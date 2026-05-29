import Link from "next/link";
import { House, MagnifyingGlass, Plus } from "@phosphor-icons/react/dist/ssr";
import PageLayout from "@/components/layout/PageLayout";

export default function NotFound() {
  return (
    <PageLayout>
      <main className="min-h-screen bg-[#F0EFFE] flex flex-col items-center justify-center px-6 pb-24">

        {/* Ilustração */}
        <div className="relative mb-6">
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🧠</span>
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-xl">
            ❓
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-4xl font-bold text-purple-600 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
          Página não encontrada
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed max-w-xs">
          Parece que esse quiz sumiu no universo... ou talvez nunca tenha existido!
        </p>

        {/* Ações */}
        <div className="w-full max-w-xs space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors"
          >
            <House size={18} weight="bold" /> Voltar para a home
          </Link>
          <Link
            href="/explorar"
            className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 font-bold py-4 rounded-2xl border border-purple-100 hover:border-purple-300 transition-colors"
          >
            <MagnifyingGlass size={18} weight="bold" /> Explorar quizzes
          </Link>
          <Link
            href="/criar"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 font-bold py-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors"
          >
            <Plus size={18} weight="bold" /> Criar um quiz
          </Link>
        </div>

      </main>
    </PageLayout>
  );
}