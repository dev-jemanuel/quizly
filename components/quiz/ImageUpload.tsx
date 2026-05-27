"use client";

import { useState, useRef } from "react";
import { Image, Upload, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentImage: string | null;
  onUpload: (url: string | null) => void;
};

export default function ImageUpload({ userId, currentImage, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Só imagens são permitidas.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 2MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("quiz-images")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("quiz-images")
        .getPublicUrl(path);

      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload. Tente novamente.");
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
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
        Imagem do quiz
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-100">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
          >
            <X size={16} className="text-red-500" weight="bold" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all"
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-purple-400">Enviando...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Image size={20} className="text-purple-600" weight="fill" />
              </div>
              <span className="text-sm font-bold text-gray-700">Adicionar imagem</span>
              <span className="text-xs text-gray-400">PNG, JPG até 2MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}