"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Option = {
  id: string;
  text: string;
  is_correct: boolean | null;
  result_id: string | null;
};

type Question = {
  id: string;
  text: string;
  image_url?: string | null;
  options: Option[];
};

type Result = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  quizId: string;
  slug: string;
  title: string;
  type: "knowledge" | "personality";
  questions: Question[];
  results: Result[];
};

const optionLetters = ["A", "B", "C", "D", "E", "F"];
const optionColors = [
  { bg: "bg-purple-600", light: "bg-purple-50 border-purple-300 text-purple-900", letter: "bg-purple-600 text-white" },
  { bg: "bg-blue-500", light: "bg-blue-50 border-blue-300 text-blue-900", letter: "bg-blue-500 text-white" },
  { bg: "bg-pink-500", light: "bg-pink-50 border-pink-300 text-pink-900", letter: "bg-pink-500 text-white" },
  { bg: "bg-amber-500", light: "bg-amber-50 border-amber-300 text-amber-900", letter: "bg-amber-500 text-white" },
  { bg: "bg-cyan-500", light: "bg-cyan-50 border-cyan-300 text-cyan-900", letter: "bg-cyan-500 text-white" },
  { bg: "bg-green-500", light: "bg-green-50 border-green-300 text-green-900", letter: "bg-green-500 text-white" },
];

export default function JogarClient({ quizId, slug, title, type, questions, results }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = questions[current];
  const total = questions.length;
  const progress = ((current) / total) * 100;
  const isLast = current === total - 1;
  const isPersonality = type === "personality";

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-purple-600 font-bold">Carregando perguntas...</p>
      </div>
    );
  }

  function handleSelect(optionId: string) {
    if (confirmed) return;
    setSelected(optionId);
  }

  function handleConfirm() {
    if (!selected) return;
    setConfirmed(true);
    setAnswers(prev => ({ ...prev, [question.id]: selected }));
  }

  async function handleNext() {
    const finalAnswers = { ...answers, [question.id]: selected! };

    if (isLast) {
      let score = 0;
      let resultId = null;

      if (isPersonality) {
        const counts: Record<string, number> = {};
        Object.values(finalAnswers).forEach(optId => {
          const opt = questions.flatMap(q => q.options).find(o => o.id === optId);
          if (opt?.result_id) {
            counts[opt.result_id] = (counts[opt.result_id] ?? 0) + 1;
          }
        });
        resultId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      } else {
        score = questions.reduce((acc, q) => {
          const selectedOptId = finalAnswers[q.id];
          const correct = q.options.find(o => o.is_correct);
          return acc + (selectedOptId === correct?.id ? 1 : 0);
        }, 0);
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("plays").insert({
          quiz_id: quizId,
          user_id: user?.id ?? null,
          score: isPersonality ? null : score,
          total,
          result_id: resultId,
          answers: finalAnswers,
        });
      } catch (err) {
        console.error("Erro ao salvar play:", err);
      }

      const params = isPersonality ? `result_id=${resultId}` : `score=${score}&total=${total}`;
      router.push(`/quiz/${slug}/resultado?${params}`);
    } else {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  const selectedOption = question.options.find(o => o.id === selected);
  const isCorrect = selectedOption?.is_correct ?? false;

  return (
    <main className="min-h-screen bg-[#F8F7FF] pb-10">

      {/* Header com progresso */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-purple-600 font-bold text-sm"
          >
            <ArrowLeft size={18} weight="bold" /> Sair
          </button>
          <span className="text-sm font-bold text-gray-500">
            {current + 1} <span className="text-gray-300">/ {total}</span>
          </span>
          <div className="w-14" />
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 pb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i < current ? "bg-purple-600" :
                i === current ? "bg-purple-400" :
                "bg-gray-100"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-6">

        {/* Anúncio a cada 3 perguntas */}
        {current > 0 && current % 3 === 0 && (
          <div className="flex items-center justify-center gap-2 bg-white border border-dashed border-purple-200 rounded-2xl py-3 mb-5 text-xs text-purple-300 font-medium">
            📢 Espaço para anúncio
          </div>
        )}

        {/* Número e pergunta */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            {isPersonality ? "✨" : "🧠"} Pergunta {current + 1}
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {question.text}
          </h2>
        </div>

        {/* Imagem da pergunta */}
        {question.image_url && (
          <div className="mb-5 rounded-2xl overflow-hidden border border-gray-100">
            <img
              src={question.image_url}
              alt="Imagem da pergunta"
              className="w-full max-h-52 object-cover"
            />
          </div>
        )}

        {/* Opções */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, i) => {
            const color = optionColors[i % optionColors.length];
            let containerStyle = "bg-white border-2 border-gray-100";
            let letterStyle = `${color.bg} text-white`;
            let textStyle = "text-gray-900";
            let icon = null;

            if (confirmed) {
              if (!isPersonality && option.is_correct) {
                containerStyle = "bg-green-50 border-2 border-green-400";
                letterStyle = "bg-green-500 text-white";
                textStyle = "text-green-800 font-bold";
                icon = <CheckCircle size={20} weight="fill" className="text-green-500 flex-shrink-0" />;
              } else if (option.id === selected && (isPersonality || !option.is_correct)) {
                containerStyle = isPersonality
                  ? `${color.light} border-2`
                  : "bg-red-50 border-2 border-red-400";
                letterStyle = isPersonality ? color.letter : "bg-red-500 text-white";
                textStyle = isPersonality ? "" : "text-red-800 font-bold";
                if (!isPersonality) icon = <XCircle size={20} weight="fill" className="text-red-500 flex-shrink-0" />;
              } else {
                containerStyle = "bg-white border-2 border-gray-100 opacity-40";
              }
            } else if (option.id === selected) {
              containerStyle = `${color.light} border-2`;
              letterStyle = color.letter;
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all ${containerStyle}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${letterStyle}`}>
                  {optionLetters[i]}
                </span>
                <span className={`text-sm font-medium flex-1 ${textStyle}`}>{option.text}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Feedback — só knowledge */}
        {confirmed && !isPersonality && (
          <div className={`rounded-2xl px-4 py-3 mb-5 flex items-start gap-3 ${
            isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            {isCorrect
              ? <CheckCircle size={22} weight="fill" className="text-green-500 flex-shrink-0 mt-0.5" />
              : <XCircle size={22} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm font-bold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {isCorrect ? "Correto! 🎉" : "Errado!"}
              </p>
              {!isCorrect && (
                <p className="text-xs text-red-600 mt-0.5">
                  A resposta certa era: <strong>{question.options.find(o => o.is_correct)?.text}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Botão */}
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`w-full font-bold text-base py-4 rounded-2xl transition-all ${
              selected
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
                : "bg-purple-100 text-purple-300 cursor-not-allowed"
            }`}
          >
            {isPersonality ? "Próxima ✨" : "Confirmar resposta"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            {isLast
              ? (isPersonality ? "Ver meu resultado 🎉" : "Ver resultado 🏆")
              : "Próxima pergunta"
            }
            {!isLast && <ArrowRight size={18} weight="bold" />}
          </button>
        )}

      </div>
    </main>
  );
}