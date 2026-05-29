"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Trash } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "./ImageUpload";
import InlineImageUpload from "./InlineImageUpload";

type Option = {
  id: string;
  text: string;
  is_correct: boolean | null;
  result_id: string | null;
  isNew?: boolean;
};

type Question = {
  id: string;
  text: string;
  image_url: string | null;
  options: Option[];
  isNew?: boolean;
};

type Result = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
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
const optionLetters = ["A", "B", "C", "D", "E", "F"];

function newTempId() {
  return `new_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function newOption(resultId: string | null = null): Option {
  return { id: newTempId(), text: "", is_correct: false, result_id: resultId, isNew: true };
}

function newQuestion(): Question {
  return {
    id: newTempId(),
    text: "",
    image_url: null,
    isNew: true,
    options: [newOption(), newOption(), newOption(), newOption()],
  };
}

export default function EditarQuizForm({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [category, setCategory] = useState(quiz.category);
  const [imageUrl, setImageUrl] = useState<string | null>(quiz.image_url ?? null);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);
  const [results, setResults] = useState<Result[]>(quiz.results);
  const [currentUserId, setCurrentUserId] = useState<string>(quiz.id);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState<string[]>([]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // ── Handlers questions ──
  function updateQuestion(qId: string, text: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, text } : q));
  }
  function updateQuestionImage(qId: string, url: string | null) {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, image_url: url } : q));
  }
  function removeQuestion(qId: string) {
    if (questions.length <= 1) return;
    const q = questions.find(q => q.id === qId);
    if (q && !q.isNew) setDeletedQuestionIds(prev => [...prev, qId]);
    setQuestions(qs => qs.filter(q => q.id !== qId));
  }
  function addQuestion() {
    setQuestions(qs => [...qs, newQuestion()]);
  }

  // ── Handlers options ──
  function updateOption(qId: string, oId: string, text: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o)
    } : q));
  }
  function setCorrect(qId: string, oId: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q, options: q.options.map(o => ({ ...o, is_correct: o.id === oId }))
    } : q));
  }
  function addOption(qId: string) {
    setQuestions(qs => qs.map(q => q.id === qId && q.options.length < 6 ? {
      ...q, options: [...q.options, newOption()]
    } : q));
  }
  function removeOption(qId: string, oId: string) {
    const q = questions.find(q => q.id === qId);
    if (!q || q.options.length <= 2) return;
    const opt = q.options.find(o => o.id === oId);
    if (opt && !opt.isNew) setDeletedOptionIds(prev => [...prev, oId]);
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q, options: q.options.filter(o => o.id !== oId)
    } : q));
  }
  function setPOptionResult(qId: string, oId: string, resultId: string) {
    setQuestions(qs => qs.map(q => q.id === qId ? {
      ...q, options: q.options.map(o => o.id === oId ? { ...o, result_id: resultId } : o)
    } : q));
  }

  // ── Handlers results ──
  function updateResult(rId: string, field: "title" | "description", value: string) {
    setResults(rs => rs.map(r => r.id === rId ? { ...r, [field]: value } : r));
  }
  function updateResultImage(rId: string, url: string | null) {
    setResults(rs => rs.map(r => r.id === rId ? { ...r, image_url: url } : r));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Atualiza quiz
      await supabase
        .from("quizzes")
        .update({ title, description, category, image_url: imageUrl })
        .eq("id", quiz.id);

      // Deleta perguntas removidas
      for (const qId of deletedQuestionIds) {
        await supabase.from("questions").delete().eq("id", qId);
      }

      // Deleta opções removidas
      for (const oId of deletedOptionIds) {
        await supabase.from("options").delete().eq("id", oId);
      }

      // Salva perguntas
      for (const [qi, q] of questions.entries()) {
        if (q.isNew) {
          // Insere nova pergunta
          const { data: newQ } = await supabase
            .from("questions")
            .insert({ quiz_id: quiz.id, text: q.text, image_url: q.image_url, order: qi })
            .select().single();

          if (newQ) {
            for (const [oi, o] of q.options.entries()) {
              await supabase.from("options").insert({
                question_id: newQ.id,
                text: o.text,
                is_correct: o.is_correct,
                result_id: o.result_id,
                order: oi,
              });
            }
          }
        } else {
          // Atualiza pergunta existente
          await supabase
            .from("questions")
            .update({ text: q.text, image_url: q.image_url, order: qi })
            .eq("id", q.id);

          for (const [oi, o] of q.options.entries()) {
            if (o.isNew) {
              await supabase.from("options").insert({
                question_id: q.id,
                text: o.text,
                is_correct: o.is_correct,
                result_id: o.result_id,
                order: oi,
              });
            } else {
              await supabase
                .from("options")
                .update({ text: o.text, is_correct: o.is_correct, result_id: o.result_id, order: oi })
                .eq("id", o.id);
            }
          }
        }
      }

      // Atualiza resultados
      for (const r of results) {
        await supabase
          .from("results")
          .update({ title: r.title, description: r.description, image_url: r.image_url })
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

        {/* Imagem do quiz */}
        <ImageUpload
          userId={currentUserId}
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
                    className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none mb-2"
                  />
                  <InlineImageUpload
                    userId={currentUserId}
                    currentImage={r.image_url}
                    onUpload={(url) => updateResultImage(r.id, url)}
                    label="Imagem do resultado"
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400">
                    Pergunta {qi + 1} {q.isNew && <span className="text-green-500">• Nova</span>}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  )}
                </div>
                <input
                  value={q.text}
                  onChange={e => updateQuestion(q.id, e.target.value)}
                  placeholder="Digite a pergunta..."
                  className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 outline-none mb-2"
                />
                <InlineImageUpload
                  userId={currentUserId}
                  currentImage={q.image_url}
                  onUpload={(url) => updateQuestionImage(q.id, url)}
                  label="Imagem da pergunta"
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
                        placeholder={`Opção ${optionLetters[oi]}`}
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
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(q.id, opt.id)}>
                          <Trash size={13} className="text-gray-300 hover:text-red-400 transition-colors" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Adicionar alternativa */}
                  {q.options.length < 6 && (
                    <button
                      onClick={() => addOption(q.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-purple-400 border border-dashed border-purple-200 rounded-xl py-2 hover:border-purple-400 transition-colors mt-1"
                    >
                      <Plus size={12} weight="bold" /> Adicionar alternativa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar pergunta */}
          <button
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 font-bold text-sm py-3.5 rounded-2xl mt-4 hover:border-purple-400 transition-colors"
          >
            <Plus size={16} weight="bold" /> Adicionar pergunta
          </button>
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