import { createClient } from "./client";
import { generateSlug } from "../utils/slug";

// ── QUIZZES ──

export async function getQuizzes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, users(name, avatar_url)`)
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getQuizBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      users(name, avatar_url),
      questions(*, options(*)),
      results(*)
    `)
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getMyQuizzes(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, questions(id)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ── CRIAR QUIZ ──

export async function createQuiz({
  userId,
  title,
  description,
  category,
  type,
  image_url,
  questions,
  results,
}: {
  userId: string;
  title: string;
  description: string;
  category: string;
  type: "knowledge" | "personality";
  image_url?: string | null;
  questions: {
    text: string;
    image_url?: string | null;
    order: number;
    options: {
      text: string;
      is_correct: boolean | null;
      result_id: string | null;
      order: number;
    }[];
  }[];
  results: {
    id: string;
    title: string;
    description: string;
    order: number;
  }[];
}) {
  const supabase = createClient();
  const slug = generateSlug(title);

  // 1. Cria o quiz
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title,
      description,
      category,
      type,
      slug,
      is_public: true,
      image_url: image_url ?? null,
    })
    .select()
    .single();

  if (quizError) throw quizError;

  // 2. Cria os resultados (personality)
  const resultIdMap: Record<string, string> = {};
  if (type === "personality" && results.length > 0) {
    const { data: createdResults, error: resultsError } = await supabase
      .from("results")
      .insert(results.map(r => ({
        quiz_id: quiz.id,
        title: r.title,
        description: r.description,
        order: r.order,
      })))
      .select();

    if (resultsError) throw resultsError;

    createdResults.forEach((cr, i) => {
      resultIdMap[results[i].id] = cr.id;
    });
  }

  // 3. Cria as perguntas e opções
  for (const q of questions) {
    const { data: question, error: qError } = await supabase
      .from("questions")
      .insert({ quiz_id: quiz.id, text: q.text, image_url: q.image_url ?? null, order: q.order })
      .select()
      .single();

    if (qError) throw qError;

    const optionsToInsert = q.options.map(o => ({
      question_id: question.id,
      text: o.text,
      is_correct: o.is_correct,
      result_id: o.result_id ? resultIdMap[o.result_id] ?? null : null,
      order: o.order,
    }));

    const { error: oError } = await supabase
      .from("options")
      .insert(optionsToInsert);

    if (oError) throw oError;
  }

  return quiz;
}

// ── PLAYS ──

export async function registerPlay({
  quizId,
  userId,
  score,
  total,
  resultId,
  answers,
}: {
  quizId: string;
  userId: string | null;
  score: number | null;
  total: number;
  resultId: string | null;
  answers: Record<string, string>;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("plays").insert({
    quiz_id: quizId,
    user_id: userId,
    score,
    total,
    result_id: resultId,
    answers,
  });

  if (error) throw error;
}