import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExpensePieChart from "@/components/PieChart";
import MonthlyBarChart from "@/components/BarChart";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Data for pie chart (expenses by category)
  const expensesByCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, t) => {
        const existing = acc.find((item) => item.name === t.category);
        if (existing) {
          existing.value += Number(t.amount);
        } else {
          const category = categories.find((c) => c.name === t.category);
          acc.push({
            name: t.category,
            value: Number(t.amount),
            color: category?.color || "#4a5450",
          });
        }
        return acc;
      },
      [] as { name: string; value: number; color: string }[]
    )
    .sort((a, b) => b.value - a.value);

  // Data for bar chart (monthly totals)
  const monthlyData = transactions.reduce(
    (acc, t) => {
      const month = new Date(t.date).toLocaleDateString("es-AR", {
        month: "short",
        year: "2-digit",
      });
      let existing = acc.find((item) => item.month === month);
      if (!existing) {
        existing = { month, income: 0, expenses: 0 };
        acc.push(existing);
      }
      if (t.type === "INCOME") {
        existing.income += Number(t.amount);
      } else {
        existing.expenses += Number(t.amount);
      }
      return acc;
    },
    [] as { month: string; income: number; expenses: number }[]
  );

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">
            Dashboard
          </h1>
          <p className="text-[#7a8480] mt-1">
            Gestiona tus finanzas personales
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/categories"
            className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors"
          >
            Categorías
          </Link>
          <a
            href="/api/export"
            className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors inline-block"
          >
            Exportar CSV
          </a>
          <Link
            href="/dashboard/telegram"
            className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors"
          >
            Conectar Telegram
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Balance Total</div>
          <div className={`text-2xl font-light ${balance >= 0 ? "text-[#4ef07c]" : "text-[#f07a4e]"}`}>
            ${balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Ingresos</div>
          <div className="text-2xl font-light text-[#4ef07c]">
            +${totalIncome.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Gastos</div>
          <div className="text-2xl font-light text-[#f07a4e]">
            -${totalExpenses.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Gastos por Categoría</h2>
          <ExpensePieChart data={expensesByCategory} />
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Ingresos vs Gastos (Mensual)</h2>
          <MonthlyBarChart data={monthlyData} />
        </div>
      </div>

      {/* Quick Add Transaction */}
      <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Agregar Movimiento</h2>
        <form action="/api/transactions" method="POST" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-[#7a8480] mb-1">Tipo</label>
              <select
                name="type"
                required
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              >
                <option value="EXPENSE">Gasto</option>
                <option value="INCOME">Ingreso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#7a8480] mb-1">Monto</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#7a8480] mb-1">Categoría</label>
              <input
                type="text"
                name="category"
                required
                placeholder="Ej: Supermercado"
                list="categories"
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm text-[#7a8480] mb-1">Descripción</label>
              <input
                type="text"
                name="description"
                placeholder="Opcional"
                className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Agregar
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#161918] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium">Últimos Movimientos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Categoría
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Descripción
                </th>
                <th className="text-right px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Monto
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Origen
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#4a5450]">
                    No hay movimientos aún. ¡Agrega tu primer ingreso o gasto!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id.toString()}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-sm">
                      {new Date(tx.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          tx.type === "INCOME"
                            ? "bg-[rgba(78,240,124,0.1)] text-[#4ef07c]"
                            : "bg-[rgba(240,122,78,0.1)] text-[#f07a4e]"
                        }`}
                      >
                        {tx.type === "INCOME" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{tx.category}</td>
                    <td className="px-6 py-4 text-sm text-[#7a8480]">
                      {tx.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono">
                      <span
                        className={
                          tx.type === "INCOME"
                            ? "text-[#4ef07c]"
                            : "text-[#f07a4e]"
                        }
                      >
                        {tx.type === "INCOME" ? "+" : "-"}$
                        {Number(tx.amount).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-xs font-mono text-[#4a5450]">
                        {tx.source}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
