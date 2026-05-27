// placeholderimport { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import { ArrowLeft, Trophy, Lightning, Users } from "@phosphor-icons/react/dist/ssr";
import FollowButton from "@/components/layout/FollowButton";
import { Suspense } from "react";

const categoryBg: Record<string, string> = {
  Geografia: "bg-purple-50", Ciências: "bg-green-50", História: "bg-orange-50",
  "Cultura pop": "bg-pink-50", Esportes: "bg-blue-50", Tecnologia: "bg-cyan-50",
  Personalidade: "bg-yellow-50", default: "bg-gray-50",
};
const categoryEmojis: Record<string, string> = {
  Geografia: "🌍", Ciências: "🔬", História: "📜", "Cultura pop": "🎬",
  Esportes: "⚽", Tecnologia: "💻", Personalidade: "✨", default: "🧠",
};

async function UsuarioContent({ id }: { id: string }) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("user_id", id)
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  let isFollowing = false;
  if (currentUser) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", id)
      .single();
    isFollowing = !!follow;
  }

  const isOwnProfile = currentUser?.id === id;
  const initials = (profile.name ?? profile.email ?? "?")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const totalPlays = quizzes?.reduce((acc, q) => acc + (q.plays_count ?? 0), 0) ?? 0;

  return (
    <main className="pb-24 px-4 py-6">

      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
          <ArrowLeft size={18} weight="bold" /> Voltar
        </Link>
        <span className="text-base font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <div className="w-14" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">{profile.name ?? "Usuário"}</p>
            <p className="text-xs text-gray-400">{quizzes?.length ?? 0} quizzes criados</p>
          </div>
          {!isOwnProfile && currentUser && (
            <FollowButton followingId={id} initialFollowing={isFollowing} />
          )}
          {isOwnProfile && (
            <Link href="/perfil" className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
              Meu perfil
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{quizzes?.length ?? 0}</p>
            <p className="text-xs text-gray-400">Quizzes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{(profile.followers_count ?? 0).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-gray-400">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{totalPlays.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-gray-400">Jogadas</p>
          </div>
        </div>
      </div>

      <p className="text-base font-bold text-gray-900 mb-3">
        Quizzes de {profile.name?.split(" ")[0] ?? "usuário"}
      </p>

      {quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {quizzes.map(q => {
            const cat = q.category ?? "default";
            return (
              <Link key={q.id} href={`/quiz/${q.slug}`}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-all h-full">
                  {q.image_url ? (
                    <img src={q.image_url} alt={q.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className={`w-full h-36 flex items-center justify-center text-5xl ${categoryBg[cat] ?? categoryBg.default}`}>
                      {categoryEmojis[cat] ?? categoryEmojis.default}
                    </div>
                  )}
                  <div className="px-3 pt-2">
                    {q.type === "personality" ? (
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
                    <p className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">{q.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{q.questions?.length ?? 0} perguntas</span>
                      <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
                        <Users size={10} weight="fill" /> {(q.plays_count ?? 0).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-gray-900 font-bold mb-1">Nenhum quiz ainda</p>
          <p className="text-gray-400 text-sm">Este usuário ainda não criou quizzes</p>
        </div>
      )}

    </main>
  );
}

async function UsuarioWrapper({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  return <UsuarioContent id={id} />;
}

export default function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando perfil...</p>
        </div>
      }>
        <UsuarioWrapper paramsPromise={params} />
      </Suspense>
    </PageLayout>
  );
}