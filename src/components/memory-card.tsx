"use client";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import type { Memory } from "@/lib/types";

interface MemoryCardProps {
  memory: Memory;
  selected?: boolean;
  onToggle?: (id: string) => void;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function MemoryCard({ memory, selected, onToggle, showActions, onDelete }: MemoryCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${selected ? "ring-2 ring-primary-500 border-primary-500 bg-primary-50/30" : ""}`}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          {/* 勾选框 */}
          {onToggle && (
            <button
              onClick={() => onToggle(memory.id)}
              className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selected
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "border-gray-300 hover:border-primary-400"
              }`}
            >
              {selected && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{memory.content}</p>
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {memory.tags.map((tag) => (
                  <Badge key={tag} variant="warm">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {showActions && onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              title="删除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
