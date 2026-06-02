"use client";

import { useState, useEffect } from "react";

interface BudgetAlert {
  name: string;
  spent: number;
  amount: number;
  category: string | null;
}

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/budgets?month=" + (new Date().getMonth() + 1) + "&year=" + new Date().getFullYear());
        if (!res.ok) return;
        const data = await res.json();
        const over = (data.budgets || []).filter(
          (b: BudgetAlert) => b.spent > b.amount
        );
        setAlerts(over);
      } catch {
        // silent
      }
    }
    fetchAlerts();
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((a) => {
        const pct = ((a.spent - a.amount) / a.amount * 100).toFixed(0);
        return (
          <div
            key={a.category || "global"}
            className="bg-[rgba(240,122,78,0.1)] border border-[rgba(240,122,78,0.3)] rounded-lg px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <div>
                <span className="text-sm font-medium text-[#f07a4e]">
                  Presupuesto excedido: {a.name}
                </span>
                <span className="text-xs text-[#7a8480] ml-2">
                  {a.spent.toLocaleString("es-AR", { minimumFractionDigits: 2 })} / {a.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ({pct}% por encima)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
