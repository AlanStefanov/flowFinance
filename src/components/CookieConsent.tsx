"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("flowfinance-cookies");
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("flowfinance-cookies", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("flowfinance-cookies", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto bg-[#161918] border border-white/10 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-[#7a8480]">
          Este sitio utiliza cookies para mejorar la experiencia. Al continuar,
          aceptás el uso de cookies.
        </p>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:border-white/20 transition-colors text-[#7a8480]"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
