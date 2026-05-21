"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function DeleteStoryButton({ storyId, circleId }: { storyId: string; circleId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("确定删除这个故事吗？")) return;
    setDeleting(true);
    await supabase.from("stories").delete().eq("id", storyId).eq("circle_id", circleId);
    setDeleting(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-gray-300 hover:text-red-500 transition-colors"
      title="删除"
    >
      {deleting ? "..." : "删除"}
    </button>
  );
}
