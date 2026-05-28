// placeholderimport { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageLayout from "@/components/layout/PageLayout";
import AdminClient from "@/components/admin/AdminClient";
import { Suspense } from "react";

async function AdminContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica se é admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // Busca quizzes pendentes
  const { data: pending } = await supabase
    .from("quizzes")
    .select("*, users(name, email, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Busca quizzes aprovados recentemente
  const { data: approved } = await supabase
    .from("quizzes")
    .select("*, users(name, email, avatar_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);

  // Busca quizzes rejeitados
  const { data: rejected } = await supabase
    .from("quizzes")
    .select("*, users(name, email, avatar_url)")
    .eq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <AdminClient
      pending={pending ?? []}
      approved={approved ?? []}
      rejected={rejected ?? []}
    />
  );
}

export default function AdminPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando painel...</p>
        </div>
      }>
        <AdminContent />
      </Suspense>
    </PageLayout>
  );
}