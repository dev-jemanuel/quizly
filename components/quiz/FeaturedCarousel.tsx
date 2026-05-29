"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Lightning, Trophy, Users, CaretLeft, CaretRight } from "@phosphor-icons/react";

type Quiz = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "knowledge" | "personality";
  category: string | null;
  image_url: string | null;
  plays_count: number;
  questions: { id: string }[];
};

const categoryBg: Record<string, string> = {
  Geografia: "bg-purple-50", Ciências: "bg-green-50", História: "bg-orange-50",
  "Cultura pop": "bg-pink-50", Esportes: "bg-blue-50", Tecnologia: "bg-cyan-50",
  Personalidade: "bg-yellow-50", default: "bg-gray-50",
};
const categoryEmojis: Record<string, string> = {
  Geografia: "🌍", Ciências: "🔬", História: "📜", "Cultura pop": "🎬",
  Esportes: "⚽", Tecnologia: "💻", Personalidade: "✨", default: "🧠",
};

export default function FeaturedCarousel({ quizzes }: { quizzes: Quiz[] }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quizzes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % quizzes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [quizzes.length]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  }, [current]);

  if (!quizzes.length) return null;

  function prev() {
    setCurrent(p => (p - 1 + quizzes.length) % quizzes.length);
  }
  function next() {
    setCurrent(p => (p + 1) % quizzes.length);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold text-gray-900">⭐ Em destaque</span>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm hover:bg-purple-50 transition-colors"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm hover:bg-purple-50 transition-colors"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Container com overflow hidden */}
      <div className="overflow-hidden rounded-2xl shadow-sm shadow-purple-100">
        <div
          ref={trackRef}
          className="flex"
          style={{ transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          {quizzes.map((quiz, idx) => {
            const cat = quiz.category ?? "default";
            const bgClass = categoryBg[cat] ?? categoryBg.default;
            const emojiDisplay = categoryEmojis[cat] ?? categoryEmojis.default;

            return (
              <div key={quiz.id} className="min-w-full">
                <Link href={`/quiz/${quiz.slug}`}>
                  <div className="bg-white relative">

                    {/* Imagem */}
                    {quiz.image_url ? (
                      <img src={quiz.image_url} alt={quiz.title} className="w-full h-44 object-cover" />
                    ) : (
                      <div className={`w-full h-44 flex items-center justify-center text-6xl ${bgClass}`}>
                        {emojiDisplay}
                      </div>
                    )}

                    {/* Indicadores sobre a imagem */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {quizzes.map((_, i) => (
                        <button
                          key={i}
                          onClick={e => { e.preventDefault(); setCurrent(i); }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === current ? "bg-white w-5" : "bg-white/50 w-1.5"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Número atual */}
                    <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {idx + 1} / {quizzes.length}
                    </div>

                    {/* Conteúdo */}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicadores embaixo */}
      <div className="flex justify-center gap-1.5 mt-3">
        {quizzes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-purple-600 w-5" : "bg-purple-200 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}