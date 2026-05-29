"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowCounterClockwise, Compass } from "@phosphor-icons/react";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/client";
import LikeButton from "@/components/quiz/LikeButton";
import ShareButtons from "@/components/quiz/ShareButtons";
import confetti from "canvas-confetti";

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

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const { emoji, title, sub } = getScoreMessage(pct);

  // Confete se acertar tudo
  useEffect(() => {
    if (!isPersonality && pct === 100) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#7C3AED", "#A78BFA", "#DDD6FE", "#F59E0B", "#FCD34D"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#7C3AED", "#A78BFA", "#DDD6FE", "#F59E0B", "#FCD34D"],
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };

      frame();
    }
  }, [pct, isPersonality]);

  useEffect(() => {
    if (resultId) {
      const supabase = createClient();
      supabase
        .from("results")
        .select("title, description, image_url")
        .eq("id", resultId)
        .single()
        .then(({ data }) => { if (data) setPersonalityResult(data); });
    }
  }, [resultId]);

  useEffect(() => {
    async function fetchQuiz() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const slug = window.location.pathname.split("/")[2];
      const { data: quiz } = await supabase
        .from("quizzes").select("id, likes_count").eq("slug", slug).single();
      if (quiz) {
        setQuizData(quiz);
        if (user) {
          const { data: like } = await supabase
            .from("likes").select("id")
            .eq("user_id", user.id).eq("quiz_id", quiz.id).single();
          setIsLiked(!!like);
        }
      }
    }
    fetchQuiz();
  }, []);

  return (
    <PageLayout>
      <main className="pb-24 bg-[#F0EFFE] min-h-screen">

        {/* Navbar */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <Link href="/" className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
            <ArrowLeft size={18} weight="bold" /> Início
          </Link>
          <span className="text-base font-bold text-gray-900">
            Quiz<span className="text-purple-600">ly</span>
          </span>
          <div className="w-14" />
        </div>

        {/* Anúncio */}
        <div className="mx-4 mb-4 flex items-center justify-center gap-2 bg-white border border-dashed border-purple-200 rounded-2xl py-3 text-xs text-purple-300 font-medium">
          📢 Espaço para anúncio
        </div>

        <div className="px-4 space-y-3">

          {/* Resultado personality */}
          {isPersonality && personalityResult && (
            <div className="bg-purple-600 rounded-2xl overflow-hidden">
              {personalityResult.image_url && (
                <img src={personalityResult.image_url} alt={personalityResult.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6 text-center">
                <p className="text-purple-200 text-xs uppercase tracking-wide font-bold mb-2">Você é...</p>
                <p className="text-3xl font-bold text-white mb-3">{personalityResult.title}</p>
                <p className="text-purple-200 text-sm leading-relaxed">{personalityResult.description}</p>
              </div>
            </div>
          )}

          {/* Resultado knowledge */}
          {!isPersonality && (
            <div className="bg-purple-600 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="text-5xl mb-4">{emoji}</div>
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white flex flex-col items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white leading-none">{score}</span>
                <span className="text-xs text-purple-200 font-bold">de {total}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
              <p className="text-sm text-purple-200">{sub}</p>
            </div>
          )}

          {/* Stats — só knowledge */}
          {!isPersonality && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-green-600">{score}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Acertos</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-red-400">{total - score}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Erros</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-purple-600">{pct}%</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Aproveit.</p>
              </div>
            </div>
          )}

          {/* Barra de progresso — só knowledge */}
          {!isPersonality && (
            <div className="bg-white rounded-2xl px-4 py-4">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                <span>Aproveitamento</span>
                <span className="text-purple-600">{pct}%</span>
              </div>
              <div className="bg-purple-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Curtir */}
          {quizData && (
            <LikeButton
              quizId={quizData.id}
              initialLiked={isLiked}
              initialCount={quizData.likes_count ?? 0}
            />
          )}

          {/* Compartilhar */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Compartilhar resultado</p>
            <ShareButtons
              title="Quiz"
              url={typeof window !== "undefined" ? window.location.origin + "/quiz/" + window.location.pathname.split("/")[2] : ""}
            />
          </div>

          {/* Jogar novamente */}
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 font-bold text-sm py-4 rounded-2xl hover:border-purple-200 transition-colors border border-purple-100"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            {isPersonality ? "Refazer quiz" : "Jogar novamente"}
          </button>

          {/* Ver mais */}
          <Link
            href="/explorar"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-500 font-bold text-sm py-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors"
          >
            <Compass size={16} weight="bold" />
            Ver outros quizzes
          </Link>

        </div>
      </main>
    </PageLayout>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#F0EFFE]">
          <p className="text-purple-600 font-bold">Calculando resultado...</p>
        </div>
      </PageLayout>
    }>
      <ResultadoContent />
    </Suspense>
  );
}