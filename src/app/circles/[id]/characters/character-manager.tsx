"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Character } from "@/lib/types";

interface Props {
  circleId: string;
  circleName: string;
  characters: Character[];
  userId: string;
}

const EMOJI_OPTIONS = ["👤", "👩", "👨", "👧", "👦", "👴", "👵", "🧑", "👶", "🐱", "🐶", "🌸", "⭐", "🎨", "🎵", "📚", "🌻", "🌈", "🍀", "💡"];

export function CharacterManager({ circleId, circleName, characters: initialChars, userId }: Props) {
  const [characters, setCharacters] = useState(initialChars);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", avatar_emoji: "👤", description: "", personality: "", relationship: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState("");
  const supabase = createClient();

  const resetForm = () => {
    setForm({ name: "", avatar_emoji: "👤", description: "", personality: "", relationship: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleExtract = async () => {
    setExtracting(true);
    setExtractResult("");
    try {
      const res = await fetch("/api/extract-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractResult(data.error || "提取失败");
      } else {
        setExtractResult(`✅ 找到 ${data.found} 个人物，新增 ${data.created} 个`);
        // 刷新人物列表
        const { data: freshChars } = await supabase.from("characters").select("*").eq("circle_id", circleId).order("created_at");
        if (freshChars) setCharacters(freshChars);
      }
    } catch {
      setExtractResult("提取失败，请重试");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("请输入人物名称"); return; }
    setError("");
    setSaving(true);

    if (editingId) {
      const { error: err } = await supabase
        .from("characters")
        .update({
          name: form.name.trim(),
          avatar_emoji: form.avatar_emoji,
          description: form.description.trim(),
          personality: form.personality.trim(),
          relationship: form.relationship.trim(),
        })
        .eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
      setCharacters((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form } : c));
    } else {
      const { data, error: err } = await supabase
        .from("characters")
        .insert({
          circle_id: circleId,
          name: form.name.trim(),
          avatar_emoji: form.avatar_emoji,
          description: form.description.trim(),
          personality: form.personality.trim(),
          relationship: form.relationship.trim(),
          created_by: userId,
        })
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setCharacters((prev) => [...prev, data]);
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (char: Character) => {
    setForm({ name: char.name, avatar_emoji: char.avatar_emoji, description: char.description, personality: char.personality, relationship: char.relationship });
    setEditingId(char.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个人物的设定吗？")) return;
    await supabase.from("characters").delete().eq("id", id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{circleName} · 人物</h1>
          <p className="text-sm text-gray-500 mt-1">管理圈子中的人物设定，AI 生成故事时会参考这些信息</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExtract} disabled={extracting}>
            {extracting ? "AI 分析中..." : "🤖 从记忆中提取"}
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + 新增人物
          </Button>
        </div>
      </div>
      {extractResult && (
        <p className={`text-sm mb-4 ${extractResult.includes("失败") ? "text-red-600" : "text-green-600"}`}>
          {extractResult}
        </p>
      )}

      {showForm && (
        <Card className="mb-6 border-primary-200 bg-primary-50/50">
          <CardContent className="py-4 space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-shrink-0">
                <label className="block text-xs text-gray-500 mb-1">头像</label>
                <select
                  value={form.avatar_emoji}
                  onChange={(e) => setForm({ ...form, avatar_emoji: e.target.value })}
                  className="rounded-lg border border-gray-300 px-2 py-2 text-lg"
                >
                  {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <Input id="char-name" label="人物名称" placeholder="例如：妈妈、小明、张老师" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <Textarea id="char-desc" label="人物简介（是谁？）" placeholder="例如：我的大学室友，性格开朗" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Textarea id="char-personality" label="性格特点" placeholder="例如：乐观、幽默、偶尔有点迷糊" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} rows={2} />
            <Textarea id="char-relation" label="关系描述" placeholder="我和这个人是什么关系？例如：大学四年的室友和最好的朋友" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} rows={2} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>取消</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : (editingId ? "保存修改" : "添加人物")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {characters.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-500 mb-2">还没有添加人物</p>
          <p className="text-sm text-gray-400">添加圈子中的人物，AI 生成故事时会更懂你们的 relationship</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((char) => (
            <Card key={char.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{char.avatar_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{char.name}</h3>
                    {char.description && <p className="text-sm text-gray-600 mt-1">{char.description}</p>}
                    {char.personality && <p className="text-xs text-gray-400 mt-1">性格：{char.personality}</p>}
                    {char.relationship && <p className="text-xs text-gray-400 mt-0.5">关系：{char.relationship}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(char)} className="text-xs text-gray-400 hover:text-primary-600">编辑</button>
                    <button onClick={() => handleDelete(char.id)} className="text-xs text-gray-400 hover:text-red-500">删除</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
