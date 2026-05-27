"use client";

import { useState } from "react";
import { Heart } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  quizId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({ quizId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("quiz_id", quizId);
        setLiked(false);
        setCount(c => c - 1);
      } else {
        await supabase
          .from("likes")
          .insert({ user_id: user.id, quiz_id: quizId });
        setLiked(true);
        setCount(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all w-full justify-center ${
        liked
          ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
          : "bg-white text-gray-500 border border-gray-100 hover:border-red-200 hover:text-red-400"
      } disabled:opacity-50`}
    >
      <Heart
        size={18}
        weight={liked ? "fill" : "regular"}
        className={liked ? "text-red-500" : "text-gray-400"}
      />
      {liked ? "Curtido" : "Curtir este quiz"}
      {count > 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          liked ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"
        }`}>
          {count.toLocaleString("pt-BR")}
        </span>
      )}
    </button>
  );
}