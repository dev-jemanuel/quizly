"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageLayout from "@/components/layout/PageLayout";
import { EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email ou senha incorretos.");
      } else {
        router.push("/perfil");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError("Erro ao criar conta. Tente outro email.");
      } else {
        router.push("/perfil");
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <PageLayout>
      <main className="pb-24 px-4 py-6 min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm font-bold text-purple-600">← Voltar</Link>
          <span className="text-xl font-bold text-gray-900">
            Quiz<span className="text-purple-600">ly</span>
          </span>
          <div className="w-14" />
        </div>

        {/* Logo central */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
          </h1>
          <p className="text-sm text-gray-400">
            {isLogin ? "Entre para criar e salvar seus quizzes" : "Junte-se a milhares de criadores"}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 rounded-2xl py-3.5 text-sm font-bold text-gray-700 hover:border-purple-200 transition-colors mb-4"
        >
          <span className="text-lg">G</span>
          Continuar com Google
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">ou use seu email</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Form */}
        <div className="space-y-3 mb-4">
          {!isLogin && (
            <div className="bg-white border-2 border-gray-100 focus-within:border-purple-400 rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors">
              <span className="text-gray-300 text-lg">👤</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                className="flex-1 text-sm font-medium text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="bg-white border-2 border-gray-100 focus-within:border-purple-400 rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors">
            <EnvelopeSimple size={18} className="text-gray-300 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 text-sm font-medium text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          <div className="bg-white border-2 border-gray-100 focus-within:border-purple-400 rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors">
            <Lock size={18} className="text-gray-300 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="flex-1 text-sm font-medium text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
            />
            <button onClick={() => setShowPassword(s => !s)}>
              {showPassword
                ? <EyeSlash size={16} className="text-gray-300" />
                : <Eye size={16} className="text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium mb-4">
            {error}
          </div>
        )}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className={`w-full font-bold text-base py-4 rounded-2xl transition-all mb-4 ${
            !loading && email && password
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-purple-100 text-purple-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
        </button>

        {/* Trocar modo */}
        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => { setIsLogin(s => !s); setError(""); }}
            className="text-purple-600 font-bold"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>

      </main>
    </PageLayout>
  );
}