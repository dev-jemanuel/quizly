"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-bold text-gray-400 border border-gray-100 px-3 py-1.5 rounded-xl hover:border-red-200 hover:text-red-400 transition-colors"
    >
      Sair
    </button>
  );
}