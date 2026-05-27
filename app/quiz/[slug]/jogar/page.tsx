import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageLayout from "@/components/layout/PageLayout";
import JogarClient from "@/components/quiz/JogarClient";

async function JogarContent({ slug }: { slug: string }) {
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`*, questions(*, options(*)), results(*)`)
    .eq("slug", slug)
    .single();

  if (!quiz) notFound();

  console.log("Quiz:", JSON.stringify(quiz, null, 2));

  const questions = (quiz.questions ?? [])
    .sort((a: any, b: any) => a.order - b.order)
    .map((q: any) => ({
      ...q,
      options: (q.options ?? []).sort((a: any, b: any) => a.order - b.order),
    }));

  return (
    <JogarClient
      quizId={quiz.id}
      slug={quiz.slug}
      title={quiz.title}
      type={quiz.type}
      questions={questions}
      results={quiz.results ?? []}
    />
  );
}

async function JogarWrapper({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  return <JogarContent slug={slug} />;
}

export default function JogarPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando quiz...</p>
        </div>
      }>
        <JogarWrapper paramsPromise={params} />
      </Suspense>
    </PageLayout>
  );
}