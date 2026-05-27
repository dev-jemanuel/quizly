import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Lightning, GameController, SignIn, Plus } from "@phosphor-icons/react/dist/ssr";
import QuizCard from "@/components/quiz/QuizCard";
import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";
import MyQuizCard from "@/components/quiz/MyQuizCard";

async function PerfilContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="pb-24 px-4 py-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Faça login para continuar</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Crie uma conta para salvar seus quizzes e acompanhar seu progresso</p>
        <Link
          href="/login"
          className="flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-purple-700 transition-colors"
        >
          <SignIn size={18} weight="bold" /> Entrar
        </Link>
      </main>
    );
  }

  // Busca quizzes reais do usuário
  const { data: myQuizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const name = user.user_metadata?.full_name ?? user.email ?? "Usuário";
  const email = user.email ?? "";
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const totalPlays = myQuizzes?.reduce((acc, q) => acc + (q.plays_count ?? 0), 0) ?? 0;
  const knowledgeCount = myQuizzes?.filter(q => q.type === "knowledge").length ?? 0;
  const personalityCount = myQuizzes?.filter(q => q.type === "personality").length ?? 0;

  return (
    <main className="pb-24 px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <LogoutButton />
      </div>

      {/* Avatar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 flex items-center gap-4 mb-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <p className="text-base font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <Trophy size={20} weight="fill" className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{knowledgeCount}</p>
          <p className="text-xs text-gray-400">Conhecimento</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <GameController size={20} weight="fill" className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{totalPlays.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-gray-400">Jogadas</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <Lightning size={20} weight="fill" className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{personalityCount}</p>
          <p className="text-xs text-gray-400">Personalidade</p>
        </div>
      </div>

      {/* Meus quizzes */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold text-gray-900">Meus quizzes</span>
        <Link href="/criar" className="flex items-center gap-1 text-sm text-purple-600 font-bold">
          <Plus size={14} weight="bold" /> Novo
        </Link>
      </div>

      {myQuizzes && myQuizzes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {myQuizzes.map(q => (
            <MyQuizCard
              key={q.id}
              id={q.id}
              slug={q.slug}
              title={q.title}
              category={q.category}
              type={q.type}
              questions_count={q.questions?.length ?? 0}
              plays_count={q.plays_count ?? 0}
              image_url={q.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-gray-900 font-bold mb-1">Nenhum quiz criado ainda</p>
          <p className="text-gray-400 text-sm mb-4">Crie seu primeiro quiz agora!</p>
          <Link
            href="/criar"
            className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={14} weight="bold" /> Criar quiz
          </Link>
        </div>
      )}
    </main>
  );
}

export default function PerfilPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <PerfilContent />
      </Suspense>
    </PageLayout>
  );
}