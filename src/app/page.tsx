import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/circles");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="text-6xl mb-6">🌸</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        故事花园
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        和你在乎的人一起，记录生活的点滴回忆。
        <br />
        AI 会帮你们把这些碎片编织成动人的故事。
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          开始使用
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          登录
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900 mb-2">共同记录</h3>
          <p className="text-sm text-gray-600">每个人都可以随时写下自己的记忆片段，标注时间和标签</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-semibold text-gray-900 mb-2">AI 编织</h3>
          <p className="text-sm text-gray-600">勾选记忆片段，AI 将它们编织成流畅的叙事故事</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">📖</div>
          <h3 className="font-semibold text-gray-900 mb-2">阅读故事</h3>
          <p className="text-sm text-gray-600">翻看 AI 为你和朋友们生成的故事，重温那些共同经历的时光</p>
        </div>
      </div>
    </div>
  );
}
