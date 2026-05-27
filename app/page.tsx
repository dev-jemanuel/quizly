import Link from "next/link";
import { MagnifyingGlass, Plus, Lightning, Trophy, Users } from "@phosphor-icons/react/dist/ssr";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

const categoryBg: Record<string, string> = {
  Geografia: "bg-purple-50",
  Ciências: "bg-green-50",
  História: "bg-orange-50",
  "Cultura pop": "bg-pink-50",
  Esportes: "bg-blue-50",
  Tecnologia: "bg-cyan-50",
  Personalidade: "bg-yellow-50",
  default: "bg-gray-50",
};

const categoryEmojis: Record<string, string> = {
  Geografia: "🌍",
  Ciências: "🔬",
  História: "📜",
  "Cultura pop": "🎬",
  Esportes: "⚽",
  Tecnologia: "💻",
  Personalidade: "✨",
  default: "🧠",
};

function QuizGridCard({ quiz }: { quiz: any }) {
  const cat = quiz.category ?? "default";
  const bgClass = categoryBg[cat] ?? categoryBg.default;
  const emojiDisplay = categoryEmojis[cat] ?? categoryEmojis.default;

  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all h-full">
        {quiz.image_url ? (
          <img src={quiz.image_url} alt={quiz.title} className="w-full h-36 object-cover" />
        ) : (
          <div className={`w-full h-36 flex items-center justify-center text-5xl ${bgClass}`}>
            {emojiDisplay}
          </div>
        )}
        <div className="px-3 pt-2">
          {quiz.type === "personality" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
              <Lightning size={10} weight="fill" /> Personalidade
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
              <Trophy size={10} weight="fill" /> Conhecimento
            </span>
          )}
        </div>
        <div className="px-3 pb-3 pt-1.5">
          <p className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">{quiz.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{quiz.questions?.length ?? 0} perguntas</span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
              <Users size={10} weight="fill" /> {(quiz.plays_count ?? 0).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

async function HomeContent() {
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  const topQuizzes = quizzes?.slice(0, 4) ?? [];
  const personality = quizzes?.filter(q => q.type === "personality") ?? [];
  const knowledge = quizzes?.filter(q => q.type === "knowledge") ?? [];

  return (
    <main className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <div className="flex gap-2">
          <Link href="/explorar" className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <MagnifyingGlass size={18} weight="bold" />
          </Link>
          <Link href="/criar" className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Plus size={18} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-purple-600 rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">✨ Novo por aqui?</p>
          <p className="text-white font-bold text-base mb-3 leading-snug">
            Crie seu quiz em<br />menos de 5 minutos
          </p>
          <Link href="/criar" className="inline-flex items-center gap-1.5 bg-white text-purple-600 text-sm font-bold px-3 py-1.5 rounded-xl">
            <Plus size={14} weight="bold" /> Criar quiz
          </Link>
        </div>
        <span className="text-5xl select-none">🧠</span>
      </div>

      {/* Mais jogados */}
      {topQuizzes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-gray-900">🔥 Mais jogados</span>
            <Link href="/explorar" className="text-sm text-purple-600 font-medium">ver todos</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {topQuizzes.map(q => (
              <QuizGridCard key={q.id} quiz={q} />
            ))}
          </div>
        </>
      )}

      {/* Personalidade */}
      {personality.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-gray-900">✨ Personalidade</span>
            <Link href="/explorar" className="text-sm text-purple-600 font-medium">ver todos</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {personality.slice(0, 4).map(q => (
              <QuizGridCard key={q.id} quiz={q} />
            ))}
          </div>
        </>
      )}

      {/* Conhecimento */}
      {knowledge.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-gray-900">🧠 Conhecimento</span>
            <Link href="/explorar" className="text-sm text-purple-600 font-medium">ver todos</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {knowledge.slice(0, 4).map(q => (
              <QuizGridCard key={q.id} quiz={q} />
            ))}
          </div>
        </>
      )}

      {/* Estado vazio */}
      {(!quizzes || quizzes.length === 0) && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🧠</p>
          <p className="text-gray-900 font-bold text-lg mb-2">Nenhum quiz ainda!</p>
          <p className="text-gray-400 text-sm mb-6">Seja o primeiro a criar um quiz</p>
          <Link href="/criar" className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl">
            <Plus size={16} weight="bold" /> Criar quiz
          </Link>
        </div>
      )}

    </main>
  );
}

export default function Home() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </PageLayout>
  );
}