"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Clock, Trophy, Lightning } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Quiz = {
  id: string;
  title: string;
  description: string;
  type: "knowledge" | "personality";
  category: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  users: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = {
  pending: Quiz[];
  approved: Quiz[];
  rejected: Quiz[];
};

function QuizModerationCard({
  quiz,
  onApprove,
  onReject,
  showActions,
}: {
  quiz: Quiz;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await onApprove?.(quiz.id);
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    await onReject?.(quiz.id);
    setLoading(false);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {quiz.image_url && (
        <img src={quiz.image_url} alt={quiz.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {quiz.type === "personality" ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                  <Lightning size={10} weight="fill" /> Personalidade
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                  <Trophy size={10} weight="fill" /> Conhecimento
                </span>
              )}
              {quiz.category && (
                <span className="text-xs text-gray-400">{quiz.category}</span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">{quiz.title}</p>
            {quiz.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* Criador */}
        <div className="flex items-center gap-2 mb-3 pt-2 border-t border-gray-50">
          {quiz.users?.avatar_url ? (
            <img src={quiz.users.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
              {(quiz.users?.name ?? quiz.users?.email ?? "?")[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500">{quiz.users?.name ?? quiz.users?.email ?? "Usuário"}</span>
          <span className="text-xs text-gray-300 ml-auto">
            {new Date(quiz.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Link
            href={`/quiz/${quiz.id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Eye size={14} /> Ver
          </Link>
          {showActions && (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X size={14} weight="bold" /> Rejeitar
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <Check size={14} weight="bold" /> Aprovar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClient({ pending, approved, rejected }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [pendingList, setPendingList] = useState(pending);
  const [approvedList, setApprovedList] = useState(approved);
  const [rejectedList, setRejectedList] = useState(rejected);

  async function handleApprove(id: string) {
    const supabase = createClient();
    await supabase.from("quizzes").update({ status: "approved" }).eq("id", id);
    const quiz = pendingList.find(q => q.id === id);
    if (quiz) {
      setPendingList(prev => prev.filter(q => q.id !== id));
      setApprovedList(prev => [{ ...quiz, status: "approved" }, ...prev]);
    }
  }

  async function handleReject(id: string) {
    const supabase = createClient();
    await supabase.from("quizzes").update({ status: "rejected" }).eq("id", id);
    const quiz = pendingList.find(q => q.id === id);
    if (quiz) {
      setPendingList(prev => prev.filter(q => q.id !== id));
      setRejectedList(prev => [{ ...quiz, status: "rejected" }, ...prev]);
    }
  }

  async function handleReApprove(id: string) {
    const supabase = createClient();
    await supabase.from("quizzes").update({ status: "approved" }).eq("id", id);
    const quiz = rejectedList.find(q => q.id === id);
    if (quiz) {
      setRejectedList(prev => prev.filter(q => q.id !== id));
      setApprovedList(prev => [{ ...quiz, status: "approved" }, ...prev]);
    }
  }

  const tabs = [
    { key: "pending", label: "Pendentes", count: pendingList.length, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { key: "approved", label: "Aprovados", count: approvedList.length, color: "text-green-600 bg-green-50 border-green-200" },
    { key: "rejected", label: "Rejeitados", count: rejectedList.length, color: "text-red-500 bg-red-50 border-red-200" },
  ] as const;

  const currentList =
    activeTab === "pending" ? pendingList :
    activeTab === "approved" ? approvedList :
    rejectedList;

  return (
    <main className="pb-24 px-4 py-6">

      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold text-gray-900">
          Quiz<span className="text-purple-600">ly</span>
        </span>
        <span className="text-xs font-bold bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full">
          🛡️ Admin
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border rounded-2xl p-3 text-center transition-all ${
              activeTab === tab.key ? tab.color : "bg-white border-gray-100"
            }`}
          >
            <p className="text-lg font-bold text-gray-900">{tab.count}</p>
            <p className="text-xs text-gray-400">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* Lista */}
      {currentList.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <p className="text-4xl mb-3">
            {activeTab === "pending" ? "✅" : activeTab === "approved" ? "🎉" : "🚫"}
          </p>
          <p className="text-gray-900 font-bold mb-1">
            {activeTab === "pending" ? "Nenhum quiz pendente!" :
             activeTab === "approved" ? "Nenhum quiz aprovado ainda" :
             "Nenhum quiz rejeitado"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map(quiz => (
            <QuizModerationCard
              key={quiz.id}
              quiz={quiz}
              onApprove={activeTab === "pending" ? handleApprove : undefined}
              onReject={activeTab === "pending" ? handleReject : activeTab === "approved" ? async (id) => {
                const supabase = createClient();
                await supabase.from("quizzes").update({ status: "rejected" }).eq("id", id);
                const q = approvedList.find(q => q.id === id);
                if (q) {
                  setApprovedList(prev => prev.filter(q => q.id !== id));
                  setRejectedList(prev => [{ ...q, status: "rejected" }, ...prev]);
                }
              } : undefined}
              showActions={activeTab !== "rejected"}
            />
          ))}
          {activeTab === "rejected" && (
            <div className="space-y-4">
              {rejectedList.map(quiz => (
                <div key={quiz.id + "_reapprove"} className="flex justify-center">
                  <button
                    onClick={() => handleReApprove(quiz.id)}
                    className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    ↩️ Reativar quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}