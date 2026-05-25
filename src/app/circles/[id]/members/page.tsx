import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";

// 每次访问都重新获取数据
export const dynamic = "force-dynamic";

export default async function MembersPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify membership
  const { data: membership } = await supabase
    .from("circle_members")
    .select("role")
    .eq("circle_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  // Get circle info
  const { data: circle } = await supabase
    .from("circles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!circle) notFound();

  // Get members
  const { data: members } = await supabase
    .from("circle_members")
    .select("id, role, joined_at, user_id, users:user_id(email)")
    .eq("circle_id", params.id)
    .order("joined_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{circle.name}</h1>
      <p className="text-sm text-gray-500 mb-6">成员管理</p>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            成员列表（{members?.length || 0} 人）
          </h2>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {members?.map((member: any) => (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                    {(member.users?.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{member.users?.email || "未知"}</p>
                    <p className="text-xs text-gray-400">
                      加入于 {new Date(member.joined_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  member.role === "admin"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {member.role === "admin" ? "管理员" : "成员"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite section */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">邀请成员</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            分享这个邀请码给你的朋友们：
          </p>
          <div className="flex items-center gap-3">
            <code className="text-lg font-bold text-primary-700 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
              {circle.invite_code}
            </code>
            <CopyButton text={circle.invite_code} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            对方可以在「故事花园」首页输入邀请码加入圈子
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
