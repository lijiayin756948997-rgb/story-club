import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAIProvider } from "@/lib/ai-provider";

// 写作风格配置
const WRITING_STYLES: Record<string, { label: string; prompt: string; temperature: number }> = {
  warm: {
    label: "温暖日常",
    prompt: "用温暖治愈的语调书写，像冬日午后的一杯热茶。多描写人物的情感细节和温馨互动，让读者感受到生活中的美好与温度。",
    temperature: 0.8,
  },
  humorous: {
    label: "幽默搞笑",
    prompt: "用轻松幽默的语调书写，活泼有趣。可以加入俏皮的比喻和生动的夸张，让读者会心一笑。保持善意和温暖，不嘲讽。",
    temperature: 0.9,
  },
  poetic: {
    label: "诗意散文",
    prompt: "用优美诗意的语言书写，像一篇散文。注重意境营造和文字的美感，多用比喻和通感，节奏舒缓，读起来像在品一篇文学小品。",
    temperature: 0.85,
  },
  suspense: {
    label: "悬疑叙事",
    prompt: "用略带悬疑感的叙事风格书写，设置一些悬念和伏笔，让读者有继续读下去的冲动。但不要编造虚假剧情，只是用叙事技巧来组织真实的记忆素材。",
    temperature: 0.8,
  },
  nostalgic: {
    label: "深情回忆",
    prompt: "用深情怀旧的语调书写，像翻开一本旧相册。情感充沛但不煽情，让读者在阅读中感受到时光的重量和回忆的珍贵。",
    temperature: 0.75,
  },
};

export async function POST(request: Request) {
  try {
    const { circleId, circleName, memoryIds, style, characters } = await request.json();

    if (!circleId || !memoryIds || memoryIds.length === 0) {
      return NextResponse.json(
        { error: "请选择要编入故事的记忆片段" },
        { status: 400 }
      );
    }

    const styleConfig = WRITING_STYLES[style as string] || WRITING_STYLES.warm;

    // 验证登录
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 验证成员身份
    const { data: membership } = await supabase
      .from("circle_members")
      .select("role")
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
      .single();
    if (!membership) {
      return NextResponse.json({ error: "不是圈子成员" }, { status: 403 });
    }

    // 获取选中的记忆
    const { data: memories, error: memError } = await supabase
      .from("memories")
      .select("content, tags")
      .eq("circle_id", circleId)
      .in("id", memoryIds);

    if (memError) throw memError;
    if (!memories || memories.length === 0) {
      return NextResponse.json({ error: "未找到选中的记忆" }, { status: 400 });
    }

    // 组装记忆文本
    const memoryEntries = memories
      .map((m: any, i: number) => {
        const tags = m.tags?.length ? ` [标签: ${m.tags.join(", ")}]` : "";
        return `记忆 ${i + 1}:${tags}\n${m.content}`;
      })
      .join("\n\n---\n\n");

    // 人物设定
    let characterContext = "";
    if (characters && characters.length > 0) {
      characterContext = "\n\n## 人物设定\n\n故事中涉及以下人物，请在写作时参考：\n";
      characters.forEach((c: any) => {
        characterContext += `- ${c.emoji || "👤"} ${c.name}`;
        if (c.description) characterContext += `：${c.description}`;
        if (c.personality) characterContext += `（${c.personality}）`;
        if (c.relationship) characterContext += `。与我的关系：${c.relationship}`;
        characterContext += "\n";
      });
    }

    const systemPrompt = `你是一位善于将生活记忆编织成动人故事的叙事作家。

写作风格要求：${styleConfig.prompt}${characterContext}

请基于提供的记忆片段来写，不要编造没有发生过的事情。人物设定可以作为参考，但具体行为和对话必须来自真实记忆。`;

    const userPrompt = `以下是一些生活记忆片段，请将它们编织成一篇连贯的叙事故事。

${memoryEntries}

要求：
1. 将这些片段串联成一个连贯的故事
2. 可以加入合理的环境描写和过渡，但不能编造核心事实
3. 严格按照指定的写作风格
4. 为故事起一个合适的标题
5. 用中文写作

格式：第一行是标题，空一行后是正文。正文分段，每段之间空一行。`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: styleConfig.temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return NextResponse.json(
        { error: `AI 生成失败 (${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const fullText = result.choices[0]?.message?.content;
    if (!fullText) {
      return NextResponse.json({ error: "AI 返回为空" }, { status: 502 });
    }

    // 从第一行解析标题
    const lines = fullText.trim().split("\n");
    let title = "一段回忆";
    let content = fullText;
    if (lines[0] && lines[0].length < 50) {
      title = lines[0]
        .replace(/^["「『《]|["」』》]$/g, "")
        .replace(/^#\s*/, "")
        .trim();
      content = lines.slice(2).join("\n").trim();
    }

    // 存入数据库
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert({
        circle_id: circleId,
        title,
        content,
        period_start: new Date().toISOString().split("T")[0],
        period_end: new Date().toISOString().split("T")[0],
        memory_count: memories.length,
        style: styleConfig.label,
        character_ids: [],
      })
      .select()
      .single();

    if (storyError) throw storyError;

    return NextResponse.json({ storyId: story.id, title });
  } catch (err: any) {
    console.error("Generate story error:", err);
    return NextResponse.json({ error: err.message || "服务器内部错误" }, { status: 500 });
  }
}
