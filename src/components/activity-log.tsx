"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "./ui/card";

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

const ACTION_EMOJI: Record<string, string> = {
  memory_added: "📝",
  memory_deleted: "🗑️",
  story_generated: "✨",
  member_joined: "👋",
  character_added: "👤",
};

export function ActivityLog({ circleId }: { circleId: string }) {
  const [logs, setLogs] = useState<Activity[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("activity_logs")
      .select("id, action, description, created_at")
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setLogs(data);
      });
  }, [circleId]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
      >
        <span>📋 最近操作</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <Card className="mt-2">
          <CardContent className="py-3 max-h-60 overflow-y-auto">
            <div className="space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0">{ACTION_EMOJI[log.action] || "📌"}</span>
                  <span className="flex-1">{log.description}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {timeAgo(new Date(log.created_at))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}
