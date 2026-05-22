"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fastMode, setFastMode] = useState(false);
  const [fastSending, setFastSending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }
    setError("");
    setSending(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSending(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">验证邮件已发送</h2>
            <p className="text-gray-600">
              请检查 {email} 的收件箱，点击邮件中的链接即可登录。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFastLogin = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setError("");
    setFastSending(true);
    try {
      // 1. 调用 API 创建/更新用户，获取密码
      const res = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        setFastSending(false);
        return;
      }

      // 2. 用标准密码登录（这样 Supabase 会正确处理所有 auth 状态）
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: data.password,
      });
      if (signInError) {
        setError("登录失败: " + signInError.message);
        setFastSending(false);
        return;
      }

      // 3. 登录成功，用完整页面跳转（确保 cookie 被正确携带）
      window.location.href = "/circles";
    } catch {
      setError("登录失败，请重试");
      setFastSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold text-gray-900 text-center">登录故事花园</h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              输入邮箱，我们会发送一个登录链接给你
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                id="email"
                label="邮箱地址"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "发送中..." : "发送登录链接"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 快捷登录（绕过邮件验证） */}
        <div className="text-center">
          <button
            onClick={() => setFastMode(!fastMode)}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            {fastMode ? "收起快捷登录" : "邮件收不到？点这里"}
          </button>
        </div>

        {fastMode && (
          <Card className="border-warm-200">
            <CardHeader>
              <h2 className="text-sm font-medium text-gray-700 text-center">快捷登录</h2>
              <p className="text-xs text-gray-400 text-center">
                绕过邮件验证，输入邮箱即可直接登录（适合小圈子使用）
              </p>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleFastLogin}
                disabled={fastSending}
              >
                {fastSending ? "登录中..." : "一键登录"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
