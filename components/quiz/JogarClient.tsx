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

const optionLetters = ["A", "B", "C", "D"];

export default function JogarClient({ quizId, slug, title, type, questions, results }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = questions[current];

    if (!question) {
    return (
        <div className="flex items-center justify-center min-h-screen">
        <p className="text-purple-600 font-bold">Carregando perguntas...</p>
        </div>
    );
    }
  const total = questions.length;
  const progress = (current / total) * 100;
  const isLast = current === total - 1;
  const isPersonality = type === "personality";

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
        // Conta qual result_id aparece mais
        const counts: Record<string, number> = {};
        Object.values(finalAnswers).forEach(optId => {
          const opt = questions
            .flatMap(q => q.options)
            .find(o => o.id === optId);
          if (opt?.result_id) {
            counts[opt.result_id] = (counts[opt.result_id] ?? 0) + 1;
          }
        });
        resultId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      } else {
        // Conta acertos
        score = questions.reduce((acc, q) => {
          const selectedOptId = finalAnswers[q.id];
          const correct = q.options.find(o => o.is_correct);
          return acc + (selectedOptId === correct?.id ? 1 : 0);
        }, 0);
      }

      // Salva play no banco
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

      const params = isPersonality
        ? `result_id=${resultId}`
        : `score=${score}&total=${total}`;
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
    <main className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-purple-600 font-bold text-sm"
        >
          <ArrowLeft size={18} weight="bold" /> Sair
        </button>
        <span className="text-sm font-bold text-gray-400">
          {current + 1} de {total}
        </span>
        <div className="w-14" />
      </div>

      {/* Progresso */}
      <div className="bg-purple-100 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-purple-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Anúncio a cada 3 perguntas */}
      {current > 0 && current % 3 === 0 && (
        <div className="flex items-center justify-center gap-2 bg-white border border-dashed border-purple-200 rounded-2xl py-4 mb-5 text-xs text-purple-300 font-medium">
          📢 Espaço para anúncio
        </div>
      )}

      {/* Pergunta */}
      <div className="mb-6">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">
          Pergunta {current + 1}
        </p>
        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Opções */}
      <div className="space-y-3 mb-5">
        {question.options.map((option, i) => {
          let style = "bg-white border-gray-100 text-gray-900";
          let letterStyle = "bg-purple-100 text-purple-600";

          if (confirmed) {
            if (!isPersonality && option.is_correct) {
              style = "bg-green-50 border-green-400 text-green-800";
              letterStyle = "bg-green-400 text-white";
            } else if (option.id === selected && (isPersonality || !option.is_correct)) {
              style = isPersonality ? "bg-purple-50 border-purple-400 text-purple-900" : "bg-red-50 border-red-400 text-red-800";
              letterStyle = isPersonality ? "bg-purple-600 text-white" : "bg-red-400 text-white";
            } else {
              style = "bg-white border-gray-100 text-gray-400 opacity-50";
            }
          } else if (option.id === selected) {
            style = "bg-purple-50 border-purple-400 text-purple-900";
            letterStyle = "bg-purple-600 text-white";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full flex items-center gap-3 border-2 rounded-2xl px-4 py-3.5 text-left transition-all font-medium ${style}`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${letterStyle}`}>
                {optionLetters[i]}
              </span>
              <span className="text-sm">{option.text}</span>
              {!isPersonality && confirmed && option.is_correct && (
                <CheckCircle size={20} weight="fill" className="text-green-500 ml-auto flex-shrink-0" />
              )}
              {!isPersonality && confirmed && option.id === selected && !option.is_correct && (
                <XCircle size={20} weight="fill" className="text-red-500 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback — só knowledge */}
      {confirmed && !isPersonality && (
        <div className={`rounded-2xl px-4 py-3 mb-5 flex items-start gap-3 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {isCorrect
            ? <CheckCircle size={20} weight="fill" className="text-green-500 flex-shrink-0 mt-0.5" />
            : <XCircle size={20} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
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
            selected ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
          }`}
        >
          {isPersonality ? "Próxima" : "Confirmar resposta"}
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
        >
          {isLast ? (isPersonality ? "Ver meu resultado 🎉" : "Ver resultado 🏆") : "Próxima pergunta"}
          {!isLast && <ArrowRight size={18} weight="bold" />}
        </button>
      )}

    </main>
  );
}