import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateCircleButton } from "./create-circle-button";

export default async function CirclesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("circle_members")
    .select(`
      circle_id,
      role,
      circles (
        id,
        name,
        description,
        invite_code,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const circles = memberships?.map((m: any) => ({
    ...m.circles,
    role: m.role,
  })) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的圈子</h1>
        <CreateCircleButton />
      </div>

      {circles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-500 mb-6">还没有加入任何圈子</p>
          <p className="text-sm text-gray-400">
            创建一个新圈子，然后邀请朋友们一起记录回忆
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circles.map((circle: any) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {circle.name}
                      </h3>
                      {circle.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{circle.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {circle.role === "admin" ? "管理员" : "成员"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    创建于 {new Date(circle.created_at).toLocaleDateString("zh-CN")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Join by invite code */}
      <JoinCircleSection />
    </div>
  );
}

function JoinCircleSection() {
  return (
    <div className="mt-8 p-4 bg-white rounded-xl border border-dashed border-gray-300">
      <form
        action={async (formData: FormData) => {
          "use server";
          const code = formData.get("code") as string;
          if (!code) return;
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: circle } = await supabase
            .from("circles")
            .select("id")
            .eq("invite_code", code.trim())
            .single();

          if (!circle) return;

          const { error } = await supabase
            .from("circle_members")
            .insert({ circle_id: circle.id, user_id: user.id, role: "member" });

          if (!error) {
            redirect(`/circles/${circle.id}`);
          }
        }}
        className="flex items-end gap-3"
      >
        <div className="flex-1">
          <label htmlFor="invite-code" className="block text-sm font-medium text-gray-600 mb-1">
            有邀请码？输入加入圈子
          </label>
          <input
            id="invite-code"
            name="code"
            type="text"
            placeholder="输入邀请码"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
        >
          加入
        </button>
      </form>
    </div>
  );
}
