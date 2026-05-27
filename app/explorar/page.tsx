import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import QuizCard from "@/components/quiz/QuizCard";
import { createClient } from "@/lib/supabase/server";
import ExplorarClient from "@/components/quiz/ExplorarClient";

async function ExplorarContent() {
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  return <ExplorarClient quizzes={quizzes ?? []} />;
}

export default function ExplorarPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <ExplorarContent />
      </Suspense>
    </PageLayout>
  );
}