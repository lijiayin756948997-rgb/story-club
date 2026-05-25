import { createClient } from "@/lib/supabase";

/**
 * 记录活动日志
 */
export async function logActivity(
  circleId: string,
  action: string,
  description: string
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      circle_id: circleId,
      user_id: user.id,
      action,
      description,
    });
  } catch {
    // 日志写入失败不影响主要操作
  }
}
