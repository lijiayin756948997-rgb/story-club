import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { CharacterManager } from "./character-manager";

export default async function CharactersPage({ params }: { params: { id: string } }) {
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
    .select("name")
    .eq("id", params.id)
    .single();
  if (!circle) notFound();

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("circle_id", params.id)
    .order("created_at", { ascending: true });

  return <CharacterManager circleId={params.id} circleName={circle.name} characters={characters || []} userId={user.id} />;
}
