"use client";

import { Card, CardContent } from "./ui/card";

interface StoryReaderProps {
  title: string;
  content: string;
  memoryCount: number;
  style?: string | null;
  creatorEmail?: string | null;
  createdAt?: string;
}

export function StoryReader({ title, content, memoryCount, style, creatorEmail, createdAt }: StoryReaderProps) {
  const timeAgo = createdAt ? getTimeAgo(new Date(createdAt)) : "";

  return (
    <article className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif mb-2">{title}</h1>
        <p className="text-sm text-gray-500">
          基于 <strong>{memoryCount}</strong> 条选中的记忆片段编织而成
          {style && <span className="ml-2 text-primary-600">· {style}</span>}
        </p>
        <div className="text-xs text-gray-400 mt-1">
          {creatorEmail && <span>{creatorEmail.split("@")[0]} · </span>}
          {timeAgo}
        </div>
      </div>

      <Card>
        <CardContent className="py-8 px-6">
          <div className="prose prose-lg prose-gray mx-auto font-serif leading-relaxed">
            {content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-4 text-gray-800 first-letter:text-2xl first-letter:font-serif">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}
