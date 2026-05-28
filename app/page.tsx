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

function QuizCard({ quiz }: { quiz: any }) {
  const cat = quiz.category ?? "default";
  const bgClass = categoryBg[cat] ?? categoryBg.default;
  const emojiDisplay = categoryEmojis[cat] ?? categoryEmojis.default;

  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-purple-100 hover:shadow-md transition-all">
        {quiz.image_url ? (
          <img src={quiz.image_url} alt={quiz.title} className="w-full h-28 object-cover" />
        ) : (
          <div className={`w-full h-28 flex items-center justify-center text-4xl ${bgClass}`}>
            {emojiDisplay}
          </div>
        )}
        <div className="p-3">
          {quiz.type === "personality" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-lg mb-1.5">
              <Lightning size={9} weight="fill" /> Personalidade
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg mb-1.5">
              <Trophy size={9} weight="fill" /> Conhecimento
            </span>
          )}
          <p className="text-xs font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{quiz.title}</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
              <Users size={9} weight="fill" /> {(quiz.plays_count ?? 0).toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-gray-400">{quiz.questions?.length ?? 0} perguntas</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ quiz }: { quiz: any }) {
  const cat = quiz.category ?? "default";
  const bgClass = categoryBg[cat] ?? categoryBg.default;
  const emojiDisplay = categoryEmojis[cat] ?? categoryEmojis.default;

  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-purple-100 mb-6">
        {quiz.image_url ? (
          <img src={quiz.image_url} alt={quiz.title} className="w-full h-44 object-cover" />
        ) : (
          <div className={`w-full h-44 flex items-center justify-center text-6xl ${bgClass}`}>
            {emojiDisplay}
          </div>
        )}
        <div className="p-4">
          {quiz.type === "personality" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-lg mb-2">
              <Lightning size={9} weight="fill" /> Personalidade
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg mb-2">
              <Trophy size={9} weight="fill" /> Conhecimento
            </span>
          )}
          <p className="text-base font-bold text-gray-900 mb-1">{quiz.title}</p>
          {quiz.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{quiz.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
                <Users size={9} weight="fill" /> {(quiz.plays_count ?? 0).toLocaleString("pt-BR")}
              </span>
              <span className="text-xs text-gray-400">{quiz.questions?.length ?? 0} perguntas</span>
            </div>
            <span className="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-xl">
              Jogar agora →
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
    .eq("status", "approved")
    .order("plays_count", { ascending: false });

  const topQuizzes = quizzes?.slice(0, 6) ?? [];
  const featured = quizzes?.[0] ?? null;
  const personality = quizzes?.filter(q => q.type === "personality").slice(0, 4) ?? [];
  const knowledge = quizzes?.filter(q => q.type === "knowledge").slice(0, 4) ?? [];

  const categories = ["🌍 Geografia", "⚽ Esportes", "🎬 Cultura pop", "🔬 Ciências", "💻 Tecnologia", "📜 História"];

  return (
    <main className="pb-24 bg-[#F0EFFE] min-h-screen">

      {/* Navbar */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <div className="flex gap-2">
          <Link href="/explorar" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
            <MagnifyingGlass size={18} weight="bold" />
          </Link>
          <Link href="/criar" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
            <Plus size={18} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="px-4">

        {/* Hero */}
        <div className="bg-purple-600 rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-xs uppercase tracking-wide font-bold mb-1">✨ Novo por aqui?</p>
            <p className="text-white font-bold text-base mb-3 leading-snug">
              Crie seu quiz em<br />menos de 5 minutos
            </p>
            <Link href="/criar" className="inline-flex items-center gap-1.5 bg-white text-purple-600 text-sm font-bold px-3 py-1.5 rounded-xl">
              <Plus size={14} weight="bold" /> Criar quiz
            </Link>
          </div>
          <span className="text-5xl select-none">🧠</span>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {categories.map(cat => (
            <Link
              key={cat}
              href={`/explorar?cat=${cat.split(" ")[1]}`}
              className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full bg-white text-gray-600 shadow-sm hover:bg-purple-600 hover:text-white transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Em destaque */}
        {featured && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-gray-900">⭐ Em destaque</span>
            </div>
            <FeaturedCard quiz={featured} />
          </>
        )}

        {/* Mais jogados */}
        {topQuizzes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-gray-900">🔥 Mais jogados</span>
              <Link href="/explorar" className="text-sm text-purple-600 font-medium">ver todos</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {topQuizzes.map(q => <QuizCard key={q.id} quiz={q} />)}
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
              {personality.map(q => <QuizCard key={q.id} quiz={q} />)}
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
            <div className="grid grid-cols-2 gap-3 mb-6">
              {knowledge.map(q => <QuizCard key={q.id} quiz={q} />)}
            </div>
          </>
        )}

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

      </div>
    </main>
  );
}

export default function Home() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F0EFFE]">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </PageLayout>
  );
}