"use client";

import { useState, useMemo } from "react";
import { MemoryCard } from "./memory-card";
import type { Memory, Character } from "@/lib/types";

interface TimelineProps {
  memories: Memory[];
  characters: Character[];
  currentUserId: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDeleteMemory?: (id: string) => Promise<void>;
}

export function Timeline({ memories, characters, currentUserId, selectedIds, onToggleSelect, onDeleteMemory }: TimelineProps) {
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterChar, setFilterChar] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // 提取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    memories.forEach((m) => m.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [memories]);

  // 筛选
  const filtered = useMemo(() => {
    let result = [...memories];
    if (filterTag) {
      result = result.filter((m) => m.tags?.includes(filterTag));
    }
    if (filterChar) {
      result = result.filter((m) => m.content.includes(filterChar));
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter((m) => m.content.toLowerCase().includes(q) || m.tags?.some((t) => t.toLowerCase().includes(q)));
    }
    return result;
  }, [memories, filterTag, filterChar, searchText]);

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📖</div>
        <p className="text-gray-500">还没有记忆，写下第一条吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索记忆内容或标签..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                !filterTag ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  filterTag === tag
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 人物筛选 */}
      {characters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 leading-7 mr-1">人物：</span>
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterChar(filterChar === c.name ? null : c.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filterChar === c.name
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.avatar_emoji} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* 结果信息 */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {filtered.length === memories.length
            ? `共 ${memories.length} 条记忆`
            : `筛选出 ${filtered.length} / ${memories.length} 条`}
          {selectedIds.size > 0 && ` · 已选 ${selectedIds.size} 条`}
        </span>
        {selectedIds.size > 0 && (
          <button
            onClick={() => {
              filtered.forEach((m) => {
                if (!selectedIds.has(m.id)) onToggleSelect(m.id);
              });
            }}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            全选当前
          </button>
        )}
      </div>

      {/* 记忆列表 */}
      <div className="space-y-2">
        {filtered.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            selected={selectedIds.has(memory.id)}
            onToggle={onToggleSelect}
            showActions={memory.author_id === currentUserId}
            onDelete={onDeleteMemory ? (id) => onDeleteMemory(id) : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">没有匹配的记忆</div>
      )}
    </div>
  );
}
