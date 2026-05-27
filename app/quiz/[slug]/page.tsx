import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightning, Trophy, Users, Question, ShareNetwork, WhatsappLogo, Copy } from "@phosphor-icons/react/dist/ssr";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/server";

async function QuizDetailContent({ slug }: { slug: string }) {
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`*, users(name, avatar_url), questions(id, text, "order"), results(id, title)`)
    .eq("slug", slug)
    .single();

  if (!quiz) notFound();

  const isPersonality = quiz.type === "personality";
  const questions = quiz.questions ?? [];
  const results = quiz.results ?? [];
  const authorName = quiz.users?.name ?? "Anônimo";
  const initials = authorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
          <ArrowLeft size={18} weight="bold" /> Voltar
        </Link>
        <span className="text-base font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <div className="w-14" />
      </div>

      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100">
        {/* Imagem ou banner colorido */}
        {quiz.image_url ? (
          <div className="relative">
            <img src={quiz.image_url} alt={quiz.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                {isPersonality ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Lightning size={11} weight="fill" /> Personalidade
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Trophy size={11} weight="fill" /> Conhecimento
                  </span>
                )}
                {quiz.category && (
                  <span className="text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                    {quiz.category}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-white leading-snug">
                {quiz.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className={`p-5 ${isPersonality ? "bg-purple-600" : "bg-purple-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              {isPersonality ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-lg">
                  <Lightning size={11} weight="fill" /> Personalidade
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-200 text-purple-700 px-2 py-1 rounded-lg">
                  <Trophy size={11} weight="fill" /> Conhecimento
                </span>
              )}
              {quiz.category && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isPersonality ? "bg-white/20 text-white" : "bg-purple-200 text-purple-700"}`}>
                  {quiz.category}
                </span>
              )}
            </div>
            <h1 className={`text-lg font-bold leading-snug mb-2 ${isPersonality ? "text-white" : "text-gray-900"}`}>
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className={`text-sm leading-relaxed ${isPersonality ? "text-purple-200" : "text-gray-500"}`}>
                {quiz.description}
              </p>
            )}
          </div>
        )}

        {/* Descrição abaixo da imagem */}
        {quiz.image_url && quiz.description && (
          <div className="px-4 py-3 bg-white">
            <p className="text-sm text-gray-500 leading-relaxed">{quiz.description}</p>
          </div>
        )}
      </div>

      {/* Meta pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-100 text-gray-600 px-3 py-1.5 rounded-xl">
          <Question size={13} weight="bold" /> {questions.length} perguntas
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-xl">
          <Users size={13} weight="fill" /> {(quiz.plays_count ?? 0).toLocaleString("pt-BR")} jogadas
        </span>
      </div>

      {/* Criador */}
      <Link href={`/perfil-publico?id=${quiz.user_id}`}>
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4 hover:border-purple-200 transition-all">
          {quiz.users?.avatar_url ? (
            <img src={quiz.users.avatar_url} alt={authorName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-400">Ver perfil e outros quizzes</p>
          </div>
          <ArrowLeft size={16} className="text-gray-300 rotate-180" />
        </div>
      </Link>

      {/* Preview resultados (personality) */}
      {isPersonality && results.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Resultados possíveis
          </p>
          <div className="flex flex-wrap gap-2">
            {results.map((r: { id: string; title: string }) => (
              <span key={r.id} className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl">
                ✨ {r.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preview perguntas */}
      {questions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Prévia das perguntas
          </p>
          <div className="space-y-2">
            {questions.slice(0, 3).map((q: { id: string; text: string }, i: number) => (
              <div key={q.id} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-400 font-bold text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                <span>{q.text}</span>
              </div>
            ))}
            {questions.length > 3 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                + {questions.length - 3} perguntas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Botão jogar */}
      <Link
        href={`/quiz/${quiz.slug}/jogar`}
        className="w-full bg-purple-600 text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 mb-3 hover:bg-purple-700 transition-colors"
      >
        {isPersonality ? "✨ Descobrir meu resultado" : "🎯 Jogar agora"}
      </Link>

      {/* Compartilhar */}
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-1.5 bg-white border border-gray-100 rounded-xl py-3 text-xs font-bold text-gray-600 hover:border-purple-200 transition-colors">
          <ShareNetwork size={15} weight="bold" /> Compartilhar
        </button>
        <button className="flex items-center justify-center gap-1.5 bg-white border border-gray-100 rounded-xl py-3 text-xs font-bold text-gray-600 hover:border-purple-200 transition-colors">
          <Copy size={15} weight="bold" /> Copiar link
        </button>
        <button className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-100 rounded-xl py-3 text-xs font-bold text-green-700 hover:border-green-300 transition-colors">
          <WhatsappLogo size={15} weight="bold" /> WhatsApp
        </button>
      </div>

    </main>
  );
}

async function QuizDetailWrapper({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  return <QuizDetailContent slug={slug} />;
}

export default function QuizDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <QuizDetailWrapper paramsPromise={params} />
      </Suspense>
    </PageLayout>
  );
}