"use client";

import { useAuth } from "./auth-provider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";

export function Nav() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const isCirclePage = pathname.startsWith("/circles/");
  const circleId = isCirclePage ? pathname.split("/")[2] : null;

  if (loading) return null;
  if (!user) return null;

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/circles" className="font-bold text-lg text-primary-700">
            故事花园
          </Link>
          {circleId && (
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/circles/${circleId}`}
                className={`${pathname === `/circles/${circleId}` ? "text-primary-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              >
                记忆列表
              </Link>
              <Link
                href={`/circles/${circleId}/stories`}
                className={`${pathname.includes("/stories") ? "text-primary-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              >
                故事
              </Link>
              <Link
                href={`/circles/${circleId}/characters`}
                className={`${pathname.includes("/characters") ? "text-primary-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              >
                人物
              </Link>
              <Link
                href={`/circles/${circleId}/members`}
                className={`${pathname.includes("/members") ? "text-primary-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              >
                成员
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            退出
          </Button>
        </div>
      </div>
    </nav>
  );
}
