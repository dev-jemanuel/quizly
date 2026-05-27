"use client";

import { createClient } from "@/lib/supabase/client";
import { createQuiz } from "@/lib/supabase/queries";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash, Trophy, Lightning, Check } from "@phosphor-icons/react";
import ImageUpload from "./ImageUpload";
import InlineImageUpload from "./InlineImageUpload";

type QuizType = "knowledge" | "personality";

type Option = {
  id: string;
  text: string;
  is_correct: boolean;
  result_id: string | null;
};

type Question = {
  id: string;
  text: string;
  image_url: string | null;
  options: Option[];
};

type Result = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
};

const categories = ["Geografia", "Ciências", "História", "Cultura pop", "Esportes", "Tecnologia", "Personalidade", "Outro"];

function newOption(counter: { v: number }, resultId: string | null = null): Option {
  counter.v += 1;
  return { id: `opt_${counter.v}`, text: "", is_correct: false, result_id: resultId };
}

function newQuestion(counter: { v: number }): Question {
  counter.v += 1;
  return {
    id: `q_${counter.v}`,
    text: "",
    image_url: null,
    options: [
      newOption(counter),
      newOption(counter),
      newOption(counter),
      newOption(counter),
    ],
  };
}

function newResult(counter: { v: number }): Result {
  counter.v += 1;
  return { id: `r_${counter.v}`, title: "", description: "", image_url: null };
}

export default function CreateQuizForm() {
  const router = useRouter();
  const counter = useRef({ v: 0 });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Etapa 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<QuizType>("knowledge");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Busca userId ao montar
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Etapa 2 — knowledge
  const [questions, setQuestions] = useState<Question[]>(() => [newQuestion(counter.current)]);

  // Etapa 2/3 — personality
  const [results, setResults] = useState<Result[]>(() => [
    newResult(counter.current),
    newResult(counter.current),
  ]);
  const [personalityQuestions, setPersonalityQuestions] = useState<Question[]>(() => [newQuestion(counter.current)]);

  // ── Handlers knowledge ──
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
  function removeQuestion(qId: string) {
    setQuestions(qs => qs.filter(q => q.id !== qId));
  }

  // ── Handlers personality ──
  function updateResult(rId: string, field: "title" | "description", value: string) {
    setResults(rs => rs.map(r => r.id === rId ? { ...r, [field]: value } : r));
  }
  function removeResult(rId: string) {
    setResults(rs => rs.filter(r => r.id !== rId));
  }
  function updatePQuestion(qId: string, text: string) {
    setPersonalityQuestions(qs => qs.map(q => q.id === qId ? { ...q, text } : q));
  }
  function updatePOption(qId: string, oId: string, text: string) {
    setPersonalityQuestions(qs => qs.map(q => q.id === qId ? {
      ...q,
      options: q.options.map(o => o.id === oId ? { ...o, text } : o)
    } : q));
  }
  function setPOptionResult(qId: string, oId: string, resultId: string) {
    setPersonalityQuestions(qs => qs.map(q => q.id === qId ? {
      ...q,
      options: q.options.map(o => o.id === oId ? { ...o, result_id: resultId } : o)
    } : q));
  }
  function removePQuestion(qId: string) {
    setPersonalityQuestions(qs => qs.filter(q => q.id !== qId));
  }
  function updateQuestionImage(qId: string, url: string | null) {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, image_url: url } : q));
  }

  function updatePQuestionImage(qId: string, url: string | null) {
    setPersonalityQuestions(qs => qs.map(q => q.id === qId ? { ...q, image_url: url } : q));
  }

  function updateResultImage(rId: string, url: string | null) {
    setResults(rs => rs.map(r => r.id === rId ? { ...r, image_url: url } : r));
  }

  // ── Publicar ──
  async function handlePublish() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const qs = type === "knowledge" ? questions : personalityQuestions;

      await createQuiz({
        userId: user.id,
        title,
        description,
        category,
        type,
        image_url: imageUrl,
        questions: qs.map((q, i) => ({
          text: q.text,
          image_url: q.image_url,
          order: i,
          options: q.options.map((o, j) => ({
            text: o.text,
            is_correct: type === "knowledge" ? o.is_correct : null,
            result_id: type === "personality" ? o.result_id : null,
            order: j,
          })),
        })),
        results: type === "personality" ? results.map((r, i) => ({
          ...r,
          order: i,
        })) : [],
      });

      router.push("/perfil");
    } catch (err) {
      console.error(err);
      alert("Erro ao publicar quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}
          className="flex items-center gap-1.5 text-purple-600 font-bold text-sm"
        >
          <ArrowLeft size={18} weight="bold" />
          {step === 1 ? "Cancelar" : "Voltar"}
        </button>
        <span className="text-base font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <span className="text-sm font-bold text-gray-400">{step} de {type === "knowledge" ? 2 : 3}</span>
      </div>

      {/* Steps */}
      <div className="flex items-center mb-6">
        {[1, 2, type === "personality" ? 3 : null].filter(Boolean).map((s, i, arr) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > s! ? "bg-purple-600 text-white" :
                step === s! ? "bg-purple-600 text-white ring-4 ring-purple-100" :
                  "bg-purple-100 text-purple-400"
              }`}>
              {step > s! ? <Check size={14} weight="bold" /> : s}
            </div>
            {i < arr.length - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded-full ${step > s! ? "bg-purple-600" : "bg-purple-100"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── ETAPA 1 — Informações ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Título do quiz</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Capitais do mundo"
              className="w-full bg-white border-2 border-gray-100 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Seja claro — aparece na busca e no Google</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o tema do quiz..."
              rows={3}
              className="w-full bg-white border-2 border-gray-100 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${category === cat
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-100 text-gray-500 hover:border-purple-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tipo de quiz</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("knowledge")}
                className={`border-2 rounded-2xl p-4 text-left transition-all ${type === "knowledge" ? "border-purple-400 bg-purple-50" : "border-gray-100 bg-white"}`}
              >
                <Trophy size={22} weight="fill" className={type === "knowledge" ? "text-purple-600" : "text-gray-300"} />
                <p className={`text-sm font-bold mt-2 mb-1 ${type === "knowledge" ? "text-purple-900" : "text-gray-700"}`}>Conhecimento</p>
                <p className="text-xs text-gray-400 leading-snug">Tem resposta certa e pontuação</p>
              </button>
              <button
                onClick={() => setType("personality")}
                className={`border-2 rounded-2xl p-4 text-left transition-all ${type === "personality" ? "border-purple-400 bg-purple-50" : "border-gray-100 bg-white"}`}
              >
                <Lightning size={22} weight="fill" className={type === "personality" ? "text-purple-600" : "text-gray-300"} />
                <p className={`text-sm font-bold mt-2 mb-1 ${type === "personality" ? "text-purple-900" : "text-gray-700"}`}>Personalidade</p>
                <p className="text-xs text-gray-400 leading-snug">Sem certo ou errado, revela um perfil</p>
              </button>
            </div>
          </div>

          {/* Upload de imagem */}
          {userId && (
            <ImageUpload
              userId={userId}
              currentImage={imageUrl}
              onUpload={setImageUrl}
            />
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!title.trim()}
            className={`w-full font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${title.trim() ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
              }`}
          >
            Continuar <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      )}

      {/* ── ETAPA 2 — Knowledge: Perguntas ── */}
      {step === 2 && type === "knowledge" && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Perguntas</h2>
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-400">Pergunta {qi + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(q.id)}>
                      <Trash size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
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
                  userId={userId}
                  currentImage={q.image_url}
                  onUpload={(url) => updateQuestionImage(q.id, url)}
                  label="Adicionar imagem à pergunta"
                />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Alternativas — toque para marcar a correta</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer transition-all ${opt.is_correct ? "bg-green-500 text-white" : "bg-purple-100 text-purple-600"
                          }`}
                        onClick={() => setCorrect(q.id, opt.id)}
                      >
                        {opt.is_correct ? <Check size={12} weight="bold" /> : optionLetters[oi]}
                      </span>
                      <input
                        value={opt.text}
                        onChange={e => updateOption(q.id, opt.id, e.target.value)}
                        placeholder={`Opção ${optionLetters[oi]}`}
                        className={`flex-1 bg-[#F8F7FF] border rounded-xl px-3 py-2 text-sm font-medium outline-none transition-all ${opt.is_correct ? "border-green-300 bg-green-50 text-green-800" : "border-gray-100 focus:border-purple-300 text-gray-900"
                          }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setQuestions(qs => [...qs, newQuestion(counter.current)])}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 font-bold text-sm py-3.5 rounded-2xl mt-4 mb-4 hover:border-purple-400 transition-colors"
          >
            <Plus size={16} weight="bold" /> Adicionar pergunta
          </button>

          <button
            onClick={handlePublish}
            disabled={loading || questions.some(q => !q.text.trim())}
            className={`w-full font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${!loading && questions.every(q => q.text.trim()) ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
              }`}
          >
            {loading ? "Publicando..." : "🚀 Publicar quiz"}
          </button>
        </div>
      )}

      {/* ── ETAPA 2 — Personality: Resultados ── */}
      {step === 2 && type === "personality" && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Resultados possíveis</h2>
          <p className="text-xs text-gray-400 mb-4">Defina os perfis que o usuário pode obter</p>
          <div className="space-y-3">
            {results.map((r, ri) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-400">Resultado {ri + 1}</span>
                  {results.length > 2 && (
                    <button onClick={() => removeResult(r.id)}>
                      <Trash size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                    </button>
                  )}
                </div>
                <input
                  value={r.title}
                  onChange={e => updateResult(r.id, "title", e.target.value)}
                  placeholder="Ex: Pikachu"
                  className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 outline-none mb-2"
                />
                <textarea
                  value={r.description}
                  onChange={e => updateResult(r.id, "description", e.target.value)}
                  placeholder="Descreva esse perfil..."
                  rows={2}
                  className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setResults(rs => [...rs, newResult(counter.current)])}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 font-bold text-sm py-3.5 rounded-2xl mt-3 mb-4 hover:border-purple-400 transition-colors"
          >
            <Plus size={16} weight="bold" /> Adicionar resultado
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={results.some(r => !r.title.trim())}
            className={`w-full font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${results.every(r => r.title.trim()) ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
              }`}
          >
            Continuar <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      )}

      {/* ── ETAPA 3 — Personality: Perguntas ── */}
      {step === 3 && type === "personality" && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Perguntas</h2>
          <p className="text-xs text-gray-400 mb-4">Associe cada alternativa a um resultado</p>
          <div className="space-y-4">
            {personalityQuestions.map((q, qi) => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-400">Pergunta {qi + 1}</span>
                  {personalityQuestions.length > 1 && (
                    <button onClick={() => removePQuestion(q.id)}>
                      <Trash size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                    </button>
                  )}
                </div>
                <input
                  value={q.text}
                  onChange={e => updatePQuestion(q.id, e.target.value)}
                  placeholder="Digite a pergunta..."
                  className="w-full bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 outline-none mb-3"
                />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Alternativas — associe ao resultado</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                        {optionLetters[oi]}
                      </span>
                      <input
                        value={opt.text}
                        onChange={e => updatePOption(q.id, opt.id, e.target.value)}
                        placeholder={`Opção ${optionLetters[oi]}`}
                        className="flex-1 bg-[#F8F7FF] border border-gray-100 focus:border-purple-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 outline-none"
                      />
                      <select
                        value={opt.result_id ?? ""}
                        onChange={e => setPOptionResult(q.id, opt.id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2 py-2 outline-none border transition-all ${opt.result_id ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-100 text-gray-400"
                          }`}
                      >
                        <option value="">Resultado</option>
                        {results.map(r => (
                          <option key={r.id} value={r.id}>{r.title}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPersonalityQuestions(qs => [...qs, newQuestion(counter.current)])}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-500 font-bold text-sm py-3.5 rounded-2xl mt-4 mb-4 hover:border-purple-400 transition-colors"
          >
            <Plus size={16} weight="bold" /> Adicionar pergunta
          </button>
          <button
            onClick={handlePublish}
            disabled={loading || personalityQuestions.some(q => !q.text.trim())}
            className={`w-full font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${!loading && personalityQuestions.every(q => q.text.trim()) ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-300 cursor-not-allowed"
              }`}
          >
            {loading ? "Publicando..." : "🚀 Publicar quiz"}
          </button>
        </div>
      )}

    </div>
  );
}