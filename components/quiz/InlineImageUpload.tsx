"use client";

import { useRef, useState } from "react";
import { Image, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentImage: string | null;
  onUpload: (url: string | null) => void;
  label?: string;
};

export default function InlineImageUpload({ userId, currentImage, onUpload, label = "Adicionar imagem" }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) { alert("Máximo 2MB."); return; }

    setUploading(true);
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
        console.log("Usuário logado:", user?.id);

      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("quiz-images")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("quiz-images").getPublicUrl(path);
      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mb-3">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-100">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
          >
            <X size={14} className="text-red-500" weight="bold" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border border-dashed border-purple-200 rounded-xl py-3 flex items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all text-xs font-bold text-purple-400"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Image size={14} weight="fill" /> {label}</>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}