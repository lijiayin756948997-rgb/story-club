import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 快捷登录：绕过邮件验证
// 1. 如果用户不存在则创建（邮箱直接已验证）
// 2. 返回密码，前端用标准方式登录
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 固定密码格式
    const password = "quick-login-" + email.split("@")[0] + "-2024";

    // 管理端客户端（使用 service_role key）
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 检查用户是否存在
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      // 已有用户 → 确保密码正确
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
    } else {
      // 新用户 → 创建（邮箱直接标记已验证）
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
    }

    // 返回密码，前端用标准方式登录
    return NextResponse.json({ password });
  } catch (err: any) {
    console.error("Dev login error:", err);
    return NextResponse.json({ error: err.message || "登录失败" }, { status: 500 });
  }
}
