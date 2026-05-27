"use client";

import { useState } from "react";
import { UserPlus, UserMinus } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  followingId: string;
  initialFollowing: boolean;
  onUpdate?: (following: boolean) => void;
};

export default function FollowButton({ followingId, initialFollowing, onUpdate }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
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

      if (following) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", followingId);
        setFollowing(false);
        onUpdate?.(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: followingId });
        setFollowing(true);
        onUpdate?.(true);
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
      className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
        following
          ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
          : "bg-purple-600 text-white hover:bg-purple-700"
      } disabled:opacity-50`}
    >
      {following
        ? <><UserMinus size={15} weight="bold" /> Seguindo</>
        : <><UserPlus size={15} weight="bold" /> Seguir</>
      }
    </button>
  );
}