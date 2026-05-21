import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { StoryReader } from "@/components/story-reader";

export default async function StoryPage({
  params,
}: {
  params: { id: string; storyId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("circle_members")
    .select("role")
    .eq("circle_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("id", params.storyId)
    .eq("circle_id", params.id)
    .single();

  if (!story) notFound();

  return (
    <div>
      <StoryReader
        title={story.title}
        content={story.content}
        memoryCount={story.memory_count}
        style={story.style}
      />
      <div className="text-center mt-6">
        <a
          href={`/circles/${params.id}/stories`}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          ← 返回故事列表
        </a>
      </div>
    </div>
  );
}
