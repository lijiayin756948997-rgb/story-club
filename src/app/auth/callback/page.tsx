"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      // 让 Supabase 自动处理 URL 中的登录信息
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push("/circles");
      } else {
        // 检查 URL 中是否有错误信息
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get("error_description");
        if (error) {
          router.push(`/login?error=${encodeURIComponent(error)}`);
        } else {
          router.push("/login");
        }
      }
    };

    handleAuth();
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
