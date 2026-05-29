"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "@phosphor-icons/react";

type RankEntry = {
  user_id: string | null;
  name: string | null;
  avatar_url: string | null;
  score: number;
  total: number;
  pct: number;
};

const medalColors = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

export default function RankingQuiz({ quizId, currentUserId }: { quizId: string; currentUserId: string | null }) {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [myRank, setMyRank] = useState<{ entry: RankEntry; position: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      const supabase = createClient();

      const { data: plays } = await supabase
        .from("plays")
        .select("user_id, score, total, users(name, avatar_url)")
        .eq("quiz_id", quizId)
        .not("score", "is", null)
        .not("user_id", "is", null)
        .order("score", { ascending: false });

      if (!plays) { setLoading(false); return; }

      // Pega o melhor score de cada usuário
      const bestByUser: Record<string, RankEntry> = {};
      for (const p of plays) {
        const uid = p.user_id!;
        const pct = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
        if (!bestByUser[uid] || p.score > bestByUser[uid].score) {
          bestByUser[uid] = {
            user_id: uid,
            name: (p.users as any)?.name ?? "Anônimo",
            avatar_url: (p.users as any)?.avatar_url ?? null,
            score: p.score,
            total: p.total,
            pct,
          };
        }
      }

      const sorted = Object.values(bestByUser).sort((a, b) => b.pct - a.pct || b.score - a.score);
      setRanking(sorted.slice(0, 5));

      // Posição do usuário atual
      if (currentUserId) {
        const myPos = sorted.findIndex(e => e.user_id === currentUserId);
        if (myPos >= 5 && myPos !== -1) {
          setMyRank({ entry: sorted[myPos], position: myPos + 1 });
        }
      }

      setLoading(false);
    }

    fetchRanking();
  }, [quizId, currentUserId]);

  if (loading) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
      <div className="w-32 h-4 bg-gray-100 rounded mb-3" />
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-100" />
          <div className="flex-1 h-4 bg-gray-100 rounded" />
          <div className="w-12 h-4 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );

  if (ranking.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <Trophy size={16} weight="fill" className="text-amber-500" />
        <span className="text-sm font-bold text-gray-900">Top 5 — Melhores pontuações</span>
      </div>

      {/* Top 5 */}
      <div className="divide-y divide-gray-50">
        {ranking.map((entry, i) => {
          const isMe = entry.user_id === currentUserId;
          const initials = (entry.name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-purple-50" : ""}`}
            >
              <span className="text-lg w-6 text-center">{medalColors[i]}</span>
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt={entry.name ?? ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isMe ? "text-purple-700" : "text-gray-900"}`}>
                  {entry.name ?? "Anônimo"} {isMe && <span className="text-xs font-medium text-purple-400">(você)</span>}
                </p>
                <p className="text-xs text-gray-400">{entry.score}/{entry.total} acertos</p>
              </div>
              <div className={`text-sm font-bold px-2.5 py-1 rounded-xl ${
                entry.pct === 100 ? "bg-green-50 text-green-600" :
                entry.pct >= 80 ? "bg-blue-50 text-blue-600" :
                "bg-gray-50 text-gray-500"
              }`}>
                {entry.pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Minha posição fora do top 5 */}
      {myRank && (
        <>
          <div className="px-4 py-1 flex items-center gap-2">
            <div className="flex-1 border-t border-dashed border-gray-200" />
            <span className="text-xs text-gray-300 font-medium">•••</span>
            <div className="flex-1 border-t border-dashed border-gray-200" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border-t border-purple-100">
            <span className="text-sm font-bold text-purple-400 w-6 text-center">#{myRank.position}</span>
            {myRank.entry.avatar_url ? (
              <img src={myRank.entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                {(myRank.entry.name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-purple-700 truncate">
                {myRank.entry.name ?? "Você"} <span className="text-xs font-medium text-purple-400">(você)</span>
              </p>
              <p className="text-xs text-gray-400">{myRank.entry.score}/{myRank.entry.total} acertos</p>
            </div>
            <div className="text-sm font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-xl">
              {myRank.entry.pct}%
            </div>
          </div>
        </>
      )}
    </div>
  );
}