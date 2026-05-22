"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 检查 URL 中是否有错误
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const error = hashParams.get("error_description");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // 等待 Supabase 自动检测 URL 中的 session
    // createBrowserClient 默认 detectSessionInUrl = true
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/circles");
      }
    });

    // 超时处理：如果 10 秒后还没登录成功，跳回登录页
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.push("/login");
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🔄</div>
        <p className="text-gray-500">正在登录...</p>
      </div>
    </div>
  );
}
