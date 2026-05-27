"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowCounterClockwise, ShareNetwork, WhatsappLogo, Copy } from "@phosphor-icons/react";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import LikeButton from "@/components/quiz/LikeButton";

function getScoreMessage(pct: number) {
  if (pct === 100) return { emoji: "🏆", title: "Perfeito!", sub: "Você acertou tudo! Incrível!" };
  if (pct >= 80) return { emoji: "🎉", title: "Muito bem!", sub: `Você acertou ${pct}% das perguntas` };
  if (pct >= 60) return { emoji: "👍", title: "Bom resultado!", sub: `Você acertou ${pct}% das perguntas` };
  if (pct >= 40) return { emoji: "📚", title: "Pode melhorar!", sub: "Estude mais e tente novamente" };
  return { emoji: "💪", title: "Continue tentando!", sub: "Não desanime, tente de novo!" };
}

function ResultadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = Number(searchParams.get("score") ?? 0);
  const total = Number(searchParams.get("total") ?? 0);
  const resultId = searchParams.get("result_id");
  const isPersonality = !!resultId;

  const [personalityResult, setPersonalityResult] = useState<{
    title: string;
    description: string;
    image_url?: string | null;
  } | null>(null);

  const [quizData, setQuizData] = useState<{ id: string; likes_count: number } | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (resultId) {
      const supabase = createClient();
      supabase
        .from("results")
        .select("title, description, image_url")
        .eq("id", resultId)
        .single()
        .then(({ data }) => {
          if (data) setPersonalityResult(data);
        });
    }
  }, [resultId]);

  useEffect(() => {
    async function fetchQuiz() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const slug = window.location.pathname.split("/")[2];

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id, likes_count")
        .eq("slug", slug)
        .single();

      if (quiz) {
        setQuizData(quiz);
        if (user) {
          const { data: like } = await supabase
            .from("likes")
            .select("id")
            .eq("user_id", user.id)
            .eq("quiz_id", quiz.id)
            .single();
          setIsLiked(!!like);
        }
      }
    }
    fetchQuiz();
  }, []);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const { emoji, title, sub } = getScoreMessage(pct);

  return (
    <PageLayout>
      <main className="pb-24 px-4 py-6">

        {/* Navbar */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
            <ArrowLeft size={18} weight="bold" /> Início
          </Link>
          <span className="text-base font-bold text-gray-900">
            Quiz<span className="text-purple-600">ly</span>
          </span>
          <div className="w-14" />
        </div>

        {/* Anúncio */}
        <div className="flex items-center justify-center gap-2 bg-white border border-dashed border-purple-200 rounded-2xl py-4 mb-5 text-xs text-purple-300 font-medium">
          📢 Espaço para anúncio
        </div>

        {/* Resultado personality */}
        {isPersonality && personalityResult && (
          <div className="bg-purple-600 rounded-2xl overflow-hidden mb-4">
            {personalityResult.image_url && (
              <img
                src={personalityResult.image_url}
                alt={personalityResult.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6 text-center">
              <p className="text-purple-200 text-xs uppercase tracking-wide mb-2">Você é...</p>
              <p className="text-3xl font-bold text-white mb-3">{personalityResult.title}</p>
              <p className="text-purple-200 text-sm leading-relaxed">{personalityResult.description}</p>
            </div>
          </div>
        )}

        {/* Resultado knowledge */}
        {!isPersonality && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center mb-4">
            <div className="text-5xl mb-3">{emoji}</div>
            <div className="w-24 h-24 rounded-full bg-purple-100 border-4 border-purple-600 flex flex-col items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-purple-600 leading-none">{score}</span>
              <span className="text-sm text-purple-400">de {total}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500">{sub}</p>
          </div>
        )}

        {/* Barra de progresso — só knowledge */}
        {!isPersonality && (
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>Aproveitamento</span>
              <span className="text-purple-600">{pct}%</span>
            </div>
            <div className="bg-purple-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{score}</p>
                <p className="text-xs text-gray-400">Acertos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{total - score}</p>
                <p className="text-xs text-gray-400">Erros</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Curtir */}
        {quizData && (
          <div className="mb-4">
            <LikeButton
              quizId={quizData.id}
              initialLiked={isLiked}
              initialCount={quizData.likes_count ?? 0}
            />
          </div>
        )}

        {/* Compartilhar */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Compartilhar resultado</p>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-1.5 bg-purple-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-purple-700 transition-colors">
              <ShareNetwork size={15} weight="bold" /> Compartilhar
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-white border border-gray-100 rounded-xl py-3 text-xs font-bold text-gray-600 hover:border-purple-200 transition-colors">
              <Copy size={15} weight="bold" /> Copiar link
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-100 rounded-xl py-3 text-xs font-bold text-green-700 hover:border-green-300 transition-colors">
              <WhatsappLogo size={15} weight="bold" /> WhatsApp
            </button>
          </div>
        </div>

        {/* Jogar novamente */}
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-100 text-purple-600 font-bold text-sm py-3.5 rounded-2xl mb-3 hover:border-purple-200 transition-colors"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          {isPersonality ? "Refazer quiz" : "Jogar novamente"}
        </button>

        {/* Ver mais */}
        <Link
          href="/explorar"
          className="w-full flex items-center justify-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 font-bold text-sm py-3.5 rounded-2xl hover:border-purple-300 transition-colors"
        >
          🧭 Ver outros quizzes
        </Link>

      </main>
    </PageLayout>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Calculando resultado...</p>
        </div>
      </PageLayout>
    }>
      <ResultadoContent />
    </Suspense>
  );
}