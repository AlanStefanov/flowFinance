"use client";

import { useState } from "react";

interface Budget {
  id: number;
  name: string;
  category: string | null;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

export default function BudgetsClient({
  initialBudgets,
  month,
  year,
}: {
  initialBudgets: Budget[];
  month: number;
  year: number;
}) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category: category || null,
        amount: parseFloat(amount),
        month,
        year,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al crear presupuesto");
      return;
    }
    const newBudget = await res.json();
    setBudgets([...budgets, { ...newBudget, amount: Number(newBudget.amount), spent: 0 }]);
    setName("");
    setCategory("");
    setAmount("");
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    setBudgets(budgets.filter((b) => b.id !== id));
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
        <div className="text-[#7a8480] text-sm mb-2">
          Progreso general — {month}/{year}
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-2xl font-light">
            ${totalSpent.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[#4a5450]">de</span>
          <span className="text-2xl font-light">
            ${totalBudget.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {totalBudget > 0 && (
          <div className="w-full bg-[#0d0f0e] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                totalSpent > totalBudget ? "bg-[#f07a4e]" : "bg-[#4ef07c]"
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Budget list */}
      <div className="bg-[#161918] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-medium">Presupuestos</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg text-sm hover:bg-[#a8f0bc] transition-colors"
          >
            {showForm ? "Cancelar" : "Agregar"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-white/10 bg-[#1e2220] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Nombre (ej: Supermercado)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
              <input
                type="text"
                placeholder="Categoría (opcional, vacío = global)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Límite mensual"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {budgets.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#4a5450]">
            No hay presupuestos para este mes. ¡Agregá uno!
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {budgets.map((b) => {
              const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
              const over = b.spent > b.amount;
              return (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{b.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-mono ${over ? "text-[#f07a4e]" : "text-[#4ef07c]"}`}>
                          ${b.spent.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[#4a5450] text-sm">/</span>
                        <span className="text-sm font-mono">
                          ${b.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                        {b.category && (
                          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-[rgba(78,240,124,0.1)] text-[#4ef07c]">
                            {b.category}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-[#4a5450] hover:text-[#f07a4e] transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-[#0d0f0e] rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${over ? "bg-[#f07a4e]" : "bg-[#4ef07c]"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
