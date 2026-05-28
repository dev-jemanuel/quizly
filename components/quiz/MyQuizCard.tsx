"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lightning, Trophy, Users, Pencil, Trash, DotsThree } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type MyQuizCardProps = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  type: "knowledge" | "personality";
  questions_count: number;
  plays_count: number;
  image_url?: string | null;
  status?: string | null;
};

export default function MyQuizCard({
  id,
  slug,
  title,
  category,
  type,
  questions_count,
  plays_count,
  image_url,
  status,
}: MyQuizCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Tem certeza que quer deletar "${title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("quizzes").delete().eq("id", id);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar quiz.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-2xl transition-all ${deleting ? "opacity-50" : ""}`}>

      {/* Imagem ou banner colorido */}
      {image_url ? (
        <img src={image_url} alt={title} className="w-full h-32 object-cover" />
      ) : (
        <div className={`w-full h-20 flex items-center justify-center text-4xl ${type === "personality" ? "bg-yellow-50" : "bg-purple-50"}`}>
          {type === "personality" ? "✨" : "🧠"}
        </div>
      )}

      {/* Badge status */}
      {status && status !== "approved" && (
        <div className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${status === "pending"
            ? "bg-amber-50 text-amber-600 border-b border-amber-100"
            : "bg-red-50 text-red-500 border-b border-red-100"
          }`}>
          {status === "pending" ? "⏳ Aguardando aprovação" : "❌ Rejeitado"}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {type === "personality" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                <Lightning size={10} weight="fill" /> Personalidade
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                <Trophy size={10} weight="fill" /> Conhecimento
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{questions_count} perguntas</span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
              <Users size={10} weight="fill" /> {plays_count.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Menu de ações */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(s => !s)}
            className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <DotsThree size={20} weight="bold" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 bottom-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden w-44">
                <Link
                  href={`/quiz/${slug}`}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users size={16} /> Ver quiz
                </Link>
                <Link
                  href={`/quiz/${slug}/editar`}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors border-t border-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Pencil size={16} /> Editar quiz
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleDelete(); }}
                  disabled={deleting}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                >
                  <Trash size={16} /> {deleting ? "Deletando..." : "Deletar quiz"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}