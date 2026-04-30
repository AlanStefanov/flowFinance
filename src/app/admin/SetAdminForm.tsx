"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetAdminForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setEmail("");
        router.refresh();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alan.emanuel.stefanov@gmail.com"
          required
          className="flex-1 bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#4eb8f0] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8d8f0] transition-colors disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Promover a Admin"}
        </button>
      </div>
      {message && (
        <p className="text-sm">{message}</p>
      )}
    </form>
  );
}
