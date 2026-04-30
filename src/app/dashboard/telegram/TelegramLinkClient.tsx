"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TelegramLinkClientProps {
  initialLink: {
    pairingCode: string;
    expiresAt: Date;
    isActive: boolean;
  } | null;
  isLinked: boolean;
}

export default function TelegramLinkClient({
  initialLink,
  isLinked,
}: TelegramLinkClientProps) {
  const router = useRouter();
  const [link, setLink] = useState(initialLink);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateCode = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await res.json();
      setLink(data);
    } catch {
      setError("Error al generar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!link?.pairingCode) return;
    await navigator.clipboard.writeText(link.pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = link && new Date() > new Date(link.expiresAt);

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
        {isLinked ? (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#4ef07c] animate-pulse" />
            <span className="text-[#4ef07c] font-medium">
              Telegram conectado
            </span>
          </div>
        ) : link && !isExpired ? (
          <div className="mb-4">
            <div className="text-[#7a8480] text-sm mb-2">Tu código:</div>
            <div className="flex items-center gap-4">
              <code className="text-3xl font-mono font-light tracking-widest text-[#e8ebe9]">
                {link?.pairingCode}
              </code>
              <button
                onClick={copyCode}
                className="px-3 py-1 border border-white/10 rounded text-xs hover:border-white/20 transition-colors"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="text-[#4a5450] text-xs mt-2">
              Expira: {link?.expiresAt && new Date(link.expiresAt).toLocaleTimeString("es-AR")}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-[#7a8480] mb-2">
              No hay código activo. Genera uno para vincular tu Telegram.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 text-[#f07a4e] text-sm">{error}</div>
        )}

        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors disabled:opacity-50"
        >
          {loading
            ? "Generando..."
            : link && !isExpired
              ? "Regenerar Código"
              : "Generar Código"}
        </button>
      </div>
    </div>
  );
}
