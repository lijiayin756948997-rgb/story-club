"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MemoryForm } from "@/components/memory-form";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Circle, Memory, Character } from "@/lib/types";

const STYLE_OPTIONS = [
  { key: "warm", label: "温暖日常", emoji: "☀️" },
  { key: "humorous", label: "幽默搞笑", emoji: "😄" },
  { key: "poetic", label: "诗意散文", emoji: "🌸" },
  { key: "suspense", label: "悬疑叙事", emoji: "🔍" },
  { key: "nostalgic", label: "深情回忆", emoji: "📷" },
];

interface Props {
  circle: Circle;
  memories: Memory[];
  characters: Character[];
  userId: string;
  userRole: string;
}

export function CircleTimeline({ circle, memories: initialMemories, characters, userId, userRole }: Props) {
  const [memoryList, setMemoryList] = useState(initialMemories);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(circle.writing_style || "warm");
  const router = useRouter();
  const supabase = createClient();

  // 确保 characters 是数组
  const characterList = Array.isArray(characters) ? characters : [];

  const handleAddMemory = async (data: { content: string; tags: string[] }) => {
    const { data: memory, error } = await supabase
      .from("memories")
      .insert({
        circle_id: circle.id,
        author_id: userId,
        content: data.content,
        happened_at: new Date().toISOString().split("T")[0],
        tags: data.tags,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    setMemoryList((prev: Memory[]) => [memory, ...prev]);
    setShowForm(false);
  };

  const handleDeleteMemory = async (id: string) => {
    await supabase.from("memories").delete().eq("id", id);
    setMemoryList((prev: Memory[]) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerateStory = async () => {
    if (selectedIds.size === 0) {
      setGenerateError("请先勾选要编入故事的记忆片段");
      return;
    }
    setGenerateError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circleId: circle.id,
          circleName: circle.name,
          memoryIds: Array.from(selectedIds),
          style: selectedStyle,
          characters: characterList.map((c) => ({
            name: c.name,
            emoji: c.avatar_emoji,
            description: c.description,
            personality: c.personality,
            relationship: c.relationship,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      const { storyId } = await res.json();
      setSelectedIds(new Set());
      router.push(`/circles/${circle.id}/stories/${storyId}`);
    } catch (err: any) {
      setGenerateError(err.message || "生成失败，请检查 API Key 配置");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{circle.name}</h1>
        {circle.description && <p className="text-gray-500 mt-1">{circle.description}</p>}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            邀请码：<span className="font-mono font-bold text-primary-600">{circle.invite_code}</span>
          </span>
          <span className="text-xs text-gray-400">{memoryList.length} 条记忆</span>
          {characterList.length > 0 && <span className="text-xs text-gray-400">· {characterList.length} 个人物</span>}
        </div>
      </div>

      {/* 写记忆 */}
      <div className="mb-6">
        {showForm ? (
          <MemoryForm circleId={circle.id} onSubmit={handleAddMemory} />
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full">
            + 写下一条记忆
          </Button>
        )}
      </div>

      {/* 生成故事面板 */}
      <Card className="mb-6 border-warm-200 bg-warm-50/50">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">✨ 生成故事</h3>
              <p className="text-sm text-gray-500">
                从下方勾选想编入故事的记忆片段，选择风格，然后生成。
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* 风格选择 */}
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
                ))}
              </select>
              <div className="flex flex-col items-end gap-1">
                <Button onClick={handleGenerateStory} disabled={generating || selectedIds.size === 0}>
                  {generating
                    ? "AI 创作中..."
                    : `📖 生成故事${selectedIds.size > 0 ? ` (${selectedIds.size}条)` : ""}`}
                </Button>
                {selectedIds.size > 0 && (
                  <span className="text-xs text-gray-400">
                    选了 {selectedIds.size} / {memoryList.length} 条记忆
                    {selectedIds.size > 20 && <span className="text-amber-500 ml-1">（超过20条可能较慢）</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* 人物信息 */}
          {characterList.length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              人物设定：{characterList.map((c) => c.avatar_emoji + c.name).join("、")}
            </div>
          )}
          {generateError && <p className="text-sm text-red-600 mt-2">{generateError}</p>}
        </CardContent>
      </Card>

      {/* 记忆列表 + 筛选 */}
      <Timeline
        memories={memoryList}
        characters={characterList}
        currentUserId={userId}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onDeleteMemory={handleDeleteMemory}
      />
    </div>
  );
}
