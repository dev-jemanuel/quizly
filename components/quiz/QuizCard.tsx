"use client";

import Link from "next/link";
import { Lightning, Trophy, Users, Heart } from "@phosphor-icons/react";

type QuizCardProps = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  type: "knowledge" | "personality";
  questions_count: number;
  plays_count: number;
  emoji?: string;
  image_url?: string | null;
  likes_count?: number;
};

const categoryColors: Record<string, string> = {
  Geografia: "bg-purple-100 text-purple-700",
  Ciências: "bg-green-100 text-green-700",
  História: "bg-orange-100 text-orange-700",
  "Cultura pop": "bg-pink-100 text-pink-700",
  Esportes: "bg-blue-100 text-blue-700",
  Tecnologia: "bg-cyan-100 text-cyan-700",
  Personalidade: "bg-yellow-100 text-yellow-700",
  default: "bg-gray-100 text-gray-600",
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

export default function QuizCard({
  slug,
  title,
  category,
  type,
  questions_count,
  plays_count,
  emoji,
  image_url,
  likes_count,
}: QuizCardProps) {
  const cat = category ?? "default";
  const colorClass = categoryColors[cat] ?? categoryColors.default;
  const bgClass = categoryBg[cat] ?? categoryBg.default;
  const emojiDisplay = emoji ?? categoryEmojis[cat] ?? categoryEmojis.default;

  return (
    <Link href={`/quiz/${slug}`}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all">

        {/* Imagem ou banner */}
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-32 object-cover" />
        ) : (
          <div className={`w-full h-20 flex items-center justify-center text-4xl ${bgClass}`}>
            {emojiDisplay}
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {type === "personality" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                <Lightning size={10} weight="fill" /> Personalidade
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                <Trophy size={10} weight="fill" /> Conhecimento
              </span>
            )}
            {category && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${colorClass}`}>
                {category}
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-gray-900 truncate mb-1">{title}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">{questions_count} perguntas</span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
              <Users size={10} weight="fill" /> {plays_count.toLocaleString("pt-BR")}
            </span>
            {(likes_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-md">
                <Heart size={10} weight="fill" /> {(likes_count ?? 0).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
}