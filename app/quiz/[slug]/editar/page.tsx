import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageLayout from "@/components/layout/PageLayout";
import EditarQuizForm from "@/components/quiz/EditarQuizForm";

async function EditarContent({ slug }: { slug: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`*, questions(*, options(*)), results(*)`)
    .eq("slug", slug)
    .single();

  if (!quiz) notFound();
  if (quiz.user_id !== user.id) notFound();

  const questions = (quiz.questions ?? [])
    .sort((a: any, b: any) => a.order - b.order)
    .map((q: any) => ({
      ...q,
      options: (q.options ?? []).sort((a: any, b: any) => a.order - b.order),
    }));

  return (
    <EditarQuizForm
      quiz={{
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description ?? "",
        category: quiz.category ?? "",
        type: quiz.type,
        image_url: quiz.image_url ?? null,
        questions,
        results: quiz.results ?? [],
      }}
    />
  );
}

async function EditarWrapper({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  return <EditarContent slug={slug} />;
}

export default function EditarPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <EditarWrapper paramsPromise={params} />
      </Suspense>
    </PageLayout>
  );
}