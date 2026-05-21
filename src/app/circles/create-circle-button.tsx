"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateCircleButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入圈子名称");
      return;
    }
    setError("");
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: circle, error: err } = await supabase
      .from("circles")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (err) {
      setError("创建圈子失败: " + err.message);
      setCreating(false);
      return;
    }
    if (!circle) {
      setError("创建圈子失败：未返回数据");
      setCreating(false);
      return;
    }

    // Add creator as admin
    const { error: memberErr } = await supabase
      .from("circle_members")
      .insert({ circle_id: circle.id, user_id: user.id, role: "admin" });

    if (memberErr) {
      setError("添加成员失败: " + memberErr.message);
      setCreating(false);
      return;
    }

    setCreating(false);
    router.push(`/circles/${circle.id}`);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        + 新建圈子
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">创建新圈子</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="circle-name"
            label="圈子名称"
            placeholder="例如：我们的旅行回忆"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
          <Textarea
            id="circle-desc"
            label="圈子简介（选填）"
            placeholder="简单介绍一下这个圈子..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
