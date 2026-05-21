import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Nav } from "@/components/nav";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "故事花园";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "一群人共同记录回忆，AI帮你写成故事",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-primary-50/30">
        <AuthProvider>
          <Nav />
          <main className="max-w-5xl mx-auto px-4 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
