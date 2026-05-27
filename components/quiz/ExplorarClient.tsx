"use client";

import { useState } from "react";
import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import Link from "next/link";
import { Lightning, Trophy, Users } from "@phosphor-icons/react";

type Quiz = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  type: "knowledge" | "personality";
  plays_count: number;
  image_url?: string | null;
  questions: { id: string }[];
};

const categories = ["Todos", "Personalidade", "Conhecimento", "Geografia", "Ciências", "História", "Cultura pop", "Esportes", "Tecnologia"];

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

function QuizGridCard({ quiz }: { quiz: Quiz }) {
  const cat = quiz.category ?? "default";
  const bgClass = categoryBg[cat] ?? categoryBg.default;
  const emojiDisplay = categoryEmojis[cat] ?? categoryEmojis.default;

  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all h-full">

        {/* Imagem ou banner */}
        {quiz.image_url ? (
          <img src={quiz.image_url} alt={quiz.title} className="w-full h-36 object-cover" />
        ) : (
          <div className={`w-full h-36 flex items-center justify-center text-5xl ${bgClass}`}>
            {emojiDisplay}
          </div>
        )}

        {/* Badge tipo */}
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

        {/* Título e meta */}
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

export default function ExplorarClient({ quizzes }: { quizzes: Quiz[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [sort, setSort] = useState<"plays" | "recent">("plays");

  const filtered = quizzes
    .filter(q => {
      const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "Todos" ? true :
        activeCategory === "Personalidade" ? q.type === "personality" :
        activeCategory === "Conhecimento" ? q.type === "knowledge" :
        q.category === activeCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => sort === "plays" ? b.plays_count - a.plays_count : 0);

  return (
    <main className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xl font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <button
          onClick={() => setSort(s => s === "plays" ? "recent" : "plays")}
          className="flex items-center gap-1.5 text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1.5 rounded-xl"
        >
          <SlidersHorizontal size={15} weight="bold" />
          {sort === "plays" ? "Mais jogados" : "Recentes"}
        </button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <MagnifyingGlass size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar quizzes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              activeCategory === cat
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-gray-400 font-medium mb-4">
        {filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid 2 colunas */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((q, index) => (
            <>
              <QuizGridCard key={q.id} quiz={q} />
              {(index + 1) % 6 === 0 && (
                <div className="col-span-2 flex items-center justify-center gap-2 bg-white border border-dashed border-purple-200 rounded-2xl py-4 text-xs text-purple-300 font-medium">
                  📢 Espaço para anúncio
                </div>
              )}
            </>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-900 font-bold mb-1">Nenhum quiz encontrado</p>
          <p className="text-gray-400 text-sm">Tente outro termo ou categoria</p>
        </div>
      )}

    </main>
  );
}