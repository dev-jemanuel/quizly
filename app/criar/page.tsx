import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import CreateQuizForm from "@/components/quiz/CreateQuizForm";

export default function CriarPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-purple-600 font-bold">Carregando...</p>
        </div>
      }>
        <CreateQuizForm />
      </Suspense>
    </PageLayout>
  );
}