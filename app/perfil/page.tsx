import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { createClient } from "@/lib/supabase/server";
import { SignIn, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";
import MyQuizCard from "@/components/quiz/MyQuizCard";

async function PerfilContent({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const created = params?.created === "true";

  if (!user) {
    return (
      <main className="pb-24 px-4 py-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Faça login para continuar</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Crie uma conta para salvar seus quizzes e acompanhar seu progresso</p>
        <Link href="/login" className="flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-purple-700 transition-colors">
          <SignIn size={18} weight="bold" /> Entrar
        </Link>
      </main>
    );
  }

  const { data: myQuizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myPlays } = await supabase
    .from("plays")
    .select("id")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("users")
    .select("followers_count, following_count")
    .eq("id", user.id)
    .single();

  const name = user.user_metadata?.full_name ?? user.email ?? "Usuário";
  const email = user.email ?? "";
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const totalPlaysReceived = myQuizzes?.reduce((acc, q) => acc + (q.plays_count ?? 0), 0) ?? 0;
  const totalPlayed = myPlays?.length ?? 0;
  const followersCount = profile?.followers_count ?? 0;

  return (
    <main className="pb-24 min-h-screen bg-[#F0EFFE]">

      {/* Header roxo */}
      <div className="bg-purple-600 px-4 pt-5 pb-16">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xl font-bold text-white">
            Quiz<span className="text-purple-200">ly</span>
          </span>
          <LogoutButton />
        </div>

        {/* Avatar centralizado */}
        <div className="flex flex-col items-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-18 h-18 w-[72px] h-[72px] rounded-full object-cover border-3 border-white mb-3" style={{border: "3px solid white"}} />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-purple-300 flex items-center justify-center text-2xl font-bold text-white mb-3" style={{border: "3px solid white"}}>
              {initials}
            </div>
          )}
          <p className="text-lg font-bold text-white">{name}</p>
          <p className="text-xs text-purple-200">{email}</p>
        </div>
      </div>

      <div className="px-4">

        {/* Stats flutuando sobre o header */}
        <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 -mt-8 mb-5 relative z-10">
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            <div className="text-center py-4 px-2">
              <p className="text-lg font-bold text-gray-900">{myQuizzes?.length ?? 0}</p>
              <p className="text-xs text-gray-400 font-medium">Criados</p>
            </div>
            <div className="text-center py-4 px-2">
              <p className="text-lg font-bold text-gray-900">{totalPlayed}</p>
              <p className="text-xs text-gray-400 font-medium">Jogados</p>
            </div>
            <div className="text-center py-4 px-2">
              <p className="text-lg font-bold text-gray-900">{totalPlaysReceived.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-gray-400 font-medium">Recebidas</p>
            </div>
            <div className="text-center py-4 px-2">
              <p className="text-lg font-bold text-gray-900">{followersCount.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-gray-400 font-medium">Seguidores</p>
            </div>
          </div>
        </div>

        {/* Aviso de quiz enviado para aprovação */}
        {created && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Quiz enviado para aprovação!</p>
              <p className="text-xs text-amber-600 mt-0.5">Seu quiz será revisado em breve e aparecerá na plataforma após aprovação.</p>
            </div>
          </div>
        )}

        {/* Meus quizzes */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-gray-900">Meus quizzes</span>
          <Link href="/criar" className="flex items-center gap-1.5 text-sm font-bold text-white bg-purple-600 px-3 py-1.5 rounded-xl">
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
                status={q.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
            <p className="text-4xl mb-3">🧠</p>
            <p className="text-gray-900 font-bold mb-1">Nenhum quiz criado ainda</p>
            <p className="text-gray-400 text-sm mb-4">Crie seu primeiro quiz agora!</p>
            <Link href="/criar" className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
              <Plus size={14} weight="bold" /> Criar quiz
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}

async function PerfilWrapper({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  return <PerfilContent searchParams={searchParams} />;
}

function PerfilLoading() {
  return (
    <main className="min-h-screen bg-[#F0EFFE] pb-24">
      <div className="bg-purple-600 px-4 pt-5 pb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="w-24 h-7 bg-purple-400 rounded-xl animate-pulse" />
          <div className="w-16 h-8 bg-purple-400 rounded-xl animate-pulse" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full bg-purple-400 animate-pulse mb-3" />
          <div className="w-32 h-5 bg-purple-400 rounded-lg animate-pulse mb-2" />
          <div className="w-44 h-3 bg-purple-400 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="px-4">
        <div className="bg-white rounded-2xl -mt-8 mb-5 animate-pulse h-16" />
        <div className="flex items-center justify-between mb-3">
          <div className="w-28 h-5 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-16 h-8 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-32 bg-purple-100" />
              <div className="p-3 space-y-2">
                <div className="w-20 h-4 bg-gray-100 rounded-lg" />
                <div className="w-full h-4 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function PerfilPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  return (
    <PageLayout>
      <Suspense fallback={<PerfilLoading />}>
        <PerfilWrapper searchParams={searchParams} />
      </Suspense>
    </PageLayout>
  );
}