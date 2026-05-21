"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

interface MemoryFormProps {
  circleId: string;
  onSubmit: (data: { content: string; tags: string[] }) => Promise<void>;
}

export function MemoryForm({ circleId, onSubmit }: MemoryFormProps) {
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("请写下你的记忆");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(/[，,、\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      await onSubmit({ content: content.trim(), tags });
      setContent("");
      setTagsInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary-200 bg-primary-50/50">
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            id="content"
            label="写下你的记忆"
            placeholder="发生了什么有趣的事？把它记下来吧&#10;可以给记忆加上时间标签，例如：#2024年春天 #去年夏天"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div>
            <Input
              id="tags"
              label="标签（用空格或逗号分隔）"
              placeholder="例如：旅行 美食 2024年夏天 和朋友们"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} size="sm">
              {submitting ? "保存中..." : "保存记忆"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
