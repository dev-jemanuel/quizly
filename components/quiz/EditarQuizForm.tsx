"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "./ImageUpload";

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

type Quiz = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  type: "knowledge" | "personality";
  image_url?: string | null;
  questions: Question[];
  results: Result[];
};

const categories = ["Geografia", "Ciências", "História", "Cultura pop", "Esportes", "Tecnologia", "Personalidade", "Outro"];
const optionLetters = ["A", "B", "C", "D"];

export default function EditarQuizForm({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [category, setCategory] = useState(quiz.category);
  const [imageUrl, setImageUrl] = useState<string | null>(quiz.image_url ?? null);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);
  const [results, setResults] = useState<Result[]>(quiz.results);

  // ── Handlers questions ──
  function updateQuestion(qId: string, text: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, text } : q));
  }
  function updateOption(qId: string, oId: string, text: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q,
      options: q.options.map(o => o.id === oId ? { ...o, text } : o)
    } : q));
  }
  function setCorrect(qId: string, oId: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q,
      options: q.options.map(o => ({ ...o, is_correct: o.id === oId }))
    } : q));
  }
  function setPOptionResult(qId: string, oId: string, resultId: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q,
      options: q.options.map(o => o.id === oId ? { ...o, result_id: resultId } : o)
    } : q));
  }
  function updateResult(rId: string, field: "title" | "description", value: string) {
    setResults(rs => rs.map(r => r.id === rId ? { ...r, [field]: value } : r));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Atualiza info do quiz
      await supabase
        .from("quizzes")
        .update({ title, description, category, image_url: imageUrl })
        .eq("id", quiz.id);

      // Atualiza perguntas
      for (const q of questions) {
        await supabase
          .from("questions")
          .update({ text: q.text })
          .eq("id", q.id);

        // Atualiza opções
        for (const o of q.options) {
          await supabase
            .from("options")
            .update({
              text: o.text,
              is_correct: o.is_correct,
              result_id: o.result_id,
            })
            .eq("id", o.id);
        }
      }

      // Atualiza resultados (personality)
      for (const r of results) {
        await supabase
          .from("results")
          .update({ title: r.title, description: r.description })
          .eq("id", r.id);
      }

      router.push("/perfil");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-purple-600 font-bold text-sm"
        >
          <ArrowLeft size={18} weight="bold" /> Cancelar
        </button>
        <span className="text-base font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-sm font-bold text-white bg-purple-600 px-4 py-1.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="space-y-4">

        {/* Título */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Título</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Descrição</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-white border-2 border-gray-100 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors resize-none"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  category === cat
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-gray-100 text-gray-500 hover:border-purple-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Imagem */}
        <ImageUpload
          userId={quiz.id}
          currentImage={imageUrl}
          onUpload={setImageUrl}
        />

        {/* Resultados — personality */}
        {quiz.type === "personality" && results.length > 0 && (
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Resultados</label>
            <div className="space-y-3">
              {results.map((r, ri) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-purple-400 block mb-2">Resultado {ri + 1}</span>
                  <input
                    value={r.title}
                    onChange={e => updateResult(r.id, "title", e.target.value)}
                    className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 outline-none mb-2"
                  />
                  <textarea
                    value={r.description}
                    onChange={e => updateResult(r.id, "description", e.target.value)}
                    rows={2}
                    className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perguntas */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Perguntas</label>
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-purple-400 block mb-2">Pergunta {qi + 1}</span>
                <input
                  value={q.text}
                  onChange={e => updateQuestion(q.id, e.target.value)}
                  className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 outline-none mb-3"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      {quiz.type === "knowledge" ? (
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer transition-all ${
                            opt.is_correct ? "bg-green-500 text-white" : "bg-purple-100 text-purple-600"
                          }`}
                          onClick={() => setCorrect(q.id, opt.id)}
                        >
                          {opt.is_correct ? <Check size={12} weight="bold" /> : optionLetters[oi]}
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                          {optionLetters[oi]}
                        </span>
                      )}
                      <input
                        value={opt.text}
                        onChange={e => updateOption(q.id, opt.id, e.target.value)}
                        className={`flex-1 bg-[#F8F7FF] border rounded-xl px-3 py-2 text-sm font-medium outline-none transition-all ${
                          quiz.type === "knowledge" && opt.is_correct
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-100 focus:border-purple-300 text-gray-900"
                        }`}
                      />
                      {quiz.type === "personality" && (
                        <select
                          value={opt.result_id ?? ""}
                          onChange={e => setPOptionResult(q.id, opt.id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-2 py-2 outline-none border transition-all ${
                            opt.result_id ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-100 text-gray-400"
                          }`}
                        >
                          <option value="">Resultado</option>
                          {results.map(r => (
                            <option key={r.id} value={r.id}>{r.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão salvar */}
        <button
          onClick={handleSave}
          disabled={loading || !title.trim()}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all ${
            !loading && title.trim() ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Salvando..." : "💾 Salvar alterações"}
        </button>

      </div>
    </div>
  );
}