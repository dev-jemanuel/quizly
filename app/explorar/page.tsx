import { Suspense } from "react";
import PageLayout from "@/components/layout/PageLayout";
import QuizCard from "@/components/quiz/QuizCard";
import { createClient } from "@/lib/supabase/server";
import ExplorarClient from "@/components/quiz/ExplorarClient";

async function ExplorarContent() {
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  return <ExplorarClient quizzes={quizzes ?? []} />;
}

function ExplorarLoading() {
  return (
    <main className="min-h-screen bg-[#F0EFFE] pb-24">
      <div className="px-4 pt-6 pb-3 flex items-center justify-between mb-4">
        <div className="w-24 h-7 bg-purple-100 rounded-xl animate-pulse" />
        <div className="w-24 h-8 bg-white rounded-xl animate-pulse" />
      </div>
      <div className="px-4">
        <div className="w-full h-12 bg-white rounded-2xl animate-pulse mb-4" />
        <div className="flex gap-2 mb-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-20 h-8 bg-white rounded-full animate-pulse" />
          ))}
        </div>
        <div className="w-32 h-4 bg-gray-200 rounded-lg mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-36 bg-purple-100" />
              <div className="p-3 space-y-2">
                <div className="w-20 h-4 bg-gray-100 rounded-lg" />
                <div className="w-full h-4 bg-gray-100 rounded-lg" />
                <div className="w-3/4 h-4 bg-gray-100 rounded-lg" />
                <div className="flex gap-2">
                  <div className="w-12 h-4 bg-gray-100 rounded-md" />
                  <div className="w-16 h-4 bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ExplorarPage() {
  return (
    <PageLayout>
      <Suspense fallback={<ExplorarLoading />}>
        <ExplorarContent />
      </Suspense>
    </PageLayout>
  );
}