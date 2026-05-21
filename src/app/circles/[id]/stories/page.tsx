import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteStoryButton } from "@/components/delete-story-button";

export default async function StoriesPage({ params }: { params: { id: string } }) {
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

  const { data: circle } = await supabase
    .from("circles")
    .select("name")
    .eq("id", params.id)
    .single();

  if (!circle) notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("circle_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{circle.name} · 故事集</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI 根据你们的记忆编织而成的故事
        </p>
      </div>

      {!stories || stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-gray-500 mb-2">还没有生成过故事</p>
          <p className="text-sm text-gray-400">
            在圈子首页勾选记忆片段，让 AI 帮你们创作吧
          </p>
          <Link
            href={`/circles/${params.id}`}
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 text-sm underline"
          >
            回圈子首页
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story: any) => (
            <Link key={story.id} href={`/circles/${params.id}/stories/${story.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 font-serif">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        基于 {story.memory_count} 条选中的记忆
                        {story.style && <span className="ml-1.5 text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{story.style}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(story.created_at).toLocaleDateString("zh-CN")}
                      </span>
                      <DeleteStoryButton storyId={story.id} circleId={params.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
