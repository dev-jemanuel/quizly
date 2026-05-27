"use client";

import { ShareNetwork, WhatsappLogo, Copy, Check } from "@phosphor-icons/react";
import { useState } from "react";

type Props = {
  title: string;
  url?: string;
};

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `🧠 Fiz o quiz "${title}" no Quizly! Você consegue acertar tudo?`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz: ${title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // usuário cancelou
      }
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-1.5 bg-purple-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-purple-700 transition-colors"
      >
        <ShareNetwork size={15} weight="bold" /> Compartilhar
      </button>
      <button
        onClick={handleCopy}
        className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-colors border ${
          copied
            ? "bg-green-50 border-green-200 text-green-600"
            : "bg-white border-gray-100 text-gray-600 hover:border-purple-200"
        }`}
      >
        {copied
          ? <><Check size={15} weight="bold" /> Copiado!</>
          : <><Copy size={15} weight="bold" /> Copiar link</>
        }
      </button>
      <button
        onClick={handleWhatsApp}
        className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-100 rounded-xl py-3 text-xs font-bold text-green-700 hover:border-green-300 transition-colors"
      >
        <WhatsappLogo size={15} weight="bold" /> WhatsApp
      </button>
    </div>
  );
}