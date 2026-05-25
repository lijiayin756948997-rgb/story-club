import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAIProvider } from "@/lib/ai-provider";

export async function POST(request: Request) {
  try {
    const { circleId } = await request.json();
    if (!circleId) {
      return NextResponse.json({ error: "缺少圈子 ID" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("circle_members")
      .select("role")
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
      .single();
    if (!membership) {
      return NextResponse.json({ error: "不是圈子成员" }, { status: 403 });
    }

    // 获取圈子内所有记忆
    const { data: memories } = await supabase
      .from("memories")
      .select("content, happened_at, author_id")
      .eq("circle_id", circleId)
      .order("happened_at", { ascending: true });

    if (!memories || memories.length === 0) {
      return NextResponse.json({ error: "还没有记忆，无法提取人物" }, { status: 400 });
    }

    // 限制记忆数量，避免超出 token 限制
    const recentMemories = memories.slice(-30);
    const memoryText = recentMemories
      .map((m: any) => `[${m.happened_at}] ${m.content}`)
      .join("\n");

    const prompt = `分析以下生活回忆片段，找出其中反复出现的人物。

对每个人物，提取以下信息：
- name: 人物姓名或称呼
- description: 这个人的简介（是谁）
- personality: 性格特点（从行为中推断）
- relationship: 和"我"的关系

只输出纯 JSON 数组，不要任何其他文字：
[{"name":"小明","description":"大学室友","personality":"开朗幽默","relationship":"朋友"}]

回忆内容：
${memoryText}`;

    // 调用 AI
    const provider = getAIProvider();
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI 分析失败" }, { status: 502 });
    }

    const result = await response.json();
    let extracted: any[] = [];

    try {
      let text = result.choices[0]?.message?.content || "";

      // 提取 JSON 数组：找第一个 [ 到最后一个 ]
      const startIdx = text.indexOf("[");
      const endIdx = text.lastIndexOf("]");
      if (startIdx !== -1 && endIdx > startIdx) {
        text = text.substring(startIdx, endIdx + 1);
      } else {
        throw new Error("未找到 JSON 数组");
      }

      // 清理常见的 JSON 格式问题
      text = text
        .replace(/，/g, ",")                                // 中文逗号 → 英文逗号
        .replace(/：/g, ":")                                // 中文冒号 → 英文冒号
        .replace(/‘|’/g, "'")                     // 中文单引号 → 英文单引号
        .replace(/“|”/g, '"')                     // 中文双引号 → 英文双引号
        .replace(/'([^']*?)'(?=\s*[,}\]])/g, '"$1"')        // 字段值单引号转双引号
        .replace(/(\w+)(?=\s*:)/g, '"$1"');                 // 给没加引号的字段名加引号

      extracted = JSON.parse(text);
      if (!Array.isArray(extracted)) extracted = [];
    } catch (e) {
      const raw = result.choices[0]?.message?.content || "空响应";
      console.error("JSON parse error:", raw);
      return NextResponse.json({
        error: `AI 返回格式异常，AI 回复内容：${raw.substring(0, 200)}`
      }, { status: 502 });
    }

    if (extracted.length === 0) {
      return NextResponse.json({ error: "未从记忆中识别出人物" }, { status: 400 });
    }

    // 获取已有的人物
    const { data: existingChars } = await supabase
      .from("characters")
      .select("name")
      .eq("circle_id", circleId);

    const existingNames = new Set((existingChars || []).map((c: any) => c.name));

    // 写入新人物
    let created = 0;
    for (const char of extracted) {
      if (!char.name || existingNames.has(char.name)) continue;

      const { error: insertError } = await supabase.from("characters").insert({
        circle_id: circleId,
        name: char.name.substring(0, 50),
        description: (char.description || "").substring(0, 200),
        personality: (char.personality || "").substring(0, 200),
        relationship: (char.relationship || "").substring(0, 200),
        created_by: user.id,
      });

      if (!insertError) {
        created++;
        existingNames.add(char.name);
        await supabase.from("activity_logs").insert({
          circle_id: circleId,
          user_id: user.id,
          action: "character_added",
          description: `从记忆中识别出人物「${char.name}」`,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ found: extracted.length, created, characters: extracted });
  } catch (err: any) {
    console.error("Extract characters error:", err);
    return NextResponse.json({ error: err.message || "提取失败" }, { status: 500 });
  }
}
