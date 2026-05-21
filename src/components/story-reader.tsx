"use client";

import { Card, CardContent } from "./ui/card";

interface StoryReaderProps {
  title: string;
  content: string;
  memoryCount: number;
  style?: string | null;
}

export function StoryReader({ title, content, memoryCount, style }: StoryReaderProps) {
  return (
    <article className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif mb-2">{title}</h1>
        <p className="text-sm text-gray-500">
          基于 <strong>{memoryCount}</strong> 条选中的记忆片段编织而成
          {style && <span className="ml-2 text-primary-600">· {style}</span>}
        </p>
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
