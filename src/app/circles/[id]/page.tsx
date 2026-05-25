import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { CircleTimeline } from "./circle-timeline";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CirclePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("circle_members")
    .select("role")
    .eq("circle_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) notFound();

  const { data: circle } = await supabase
    .from("circles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!circle) notFound();

  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("circle_id", params.id)
    .order("created_at", { ascending: false });

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("circle_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <CircleTimeline
      circle={circle}
      memories={memories || []}
      characters={characters || []}
      userId={user.id}
      userRole={membership.role}
    />
  );
}
