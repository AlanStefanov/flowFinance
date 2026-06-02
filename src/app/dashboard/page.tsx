import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExpensePieChart from "@/components/PieChart";
import MonthlyBarChart from "@/components/BarChart";
import BudgetAlerts from "@/components/BudgetAlerts";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [transactions, categories, cardStatement, budgets, expensesByCat] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.creditCardStatement.findFirst({
      where: { userId },
      orderBy: { statementDate: "desc" },
    }),
    prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalMonthlyExpenses = expensesByCat.reduce((s, e) => s + Number(e._sum.amount || 0), 0);
  const budgetsWithProgress = budgets.map((b) => {
    const spent = b.category
      ? Number(expensesByCat.find((e) => e.category === b.category)?._sum.amount || 0)
      : totalMonthlyExpenses;
    return { ...b, amount: Number(b.amount), spent };
  });
  const totalBudget = budgetsWithProgress.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetsWithProgress.reduce((s, b) => s + b.spent, 0);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome * 100)
    : 0;

  // Month-over-month comparison
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthExpenses = transactions
    .filter((t) => t.type === "EXPENSE" && new Date(t.date) >= lastMonth && new Date(t.date) < currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenseChange = lastMonthExpenses > 0
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100)
    : 0;

  const currentMonthIncome = transactions
    .filter((t) => t.type === "INCOME" && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthIncome = transactions
    .filter((t) => t.type === "INCOME" && new Date(t.date) >= lastMonth && new Date(t.date) < currentMonthStart)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const incomeChange = lastMonthIncome > 0
    ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100)
    : 0;

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

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
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/dashboard/budgets"
            className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors"
          >
            Presupuestos
          </Link>
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

      {/* Budget Alerts */}
      <BudgetAlerts />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
          <div className={`text-xs mt-1 ${incomeChange >= 0 ? "text-[#4ef07c]" : "text-[#f07a4e]"}`}>
            {incomeChange >= 0 ? "↑" : "↓"} vs mes anterior ({Math.abs(incomeChange).toFixed(0)}%)
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Gastos</div>
          <div className="text-2xl font-light text-[#f07a4e]">
            -${totalExpenses.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div className={`text-xs mt-1 ${expenseChange <= 0 ? "text-[#4ef07c]" : "text-[#f07a4e]"}`}>
            {expenseChange >= 0 ? "↑" : "↓"} vs mes anterior ({Math.abs(expenseChange).toFixed(0)}%)
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Tasa de Ahorro</div>
          <div className={`text-2xl font-light ${savingsRate >= 20 ? "text-[#4ef07c]" : savingsRate > 0 ? "text-[#f0d04e]" : "text-[#f07a4e]"}`}>
            {savingsRate.toFixed(0)}%
          </div>
          <div className="text-xs text-[#4a5450] mt-1">
            {savingsRate >= 20 ? "✅ Saludable" : savingsRate > 0 ? "⚠️ Mejorable" : "🔴 Negativo"}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">💳 Resumen Tarjeta</div>
          <div className="text-2xl font-light text-[#f07a4e]">
            ${cardStatement ? Number(cardStatement.balance).toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "0.00"}
          </div>
          {cardStatement && (
            <div className="text-xs text-[#4a5450] mt-1">
              Actualizado: {new Date(cardStatement.statementDate).toLocaleDateString("es-AR")}
            </div>
          )}
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

      {/* Budget Progress */}
      {budgetsWithProgress.length > 0 && (
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Presupuestos del Mes</h2>
          <div className="space-y-3">
            {budgetsWithProgress.slice(0, 4).map((b) => {
              const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
              const over = b.spent > b.amount;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{b.name}</span>
                    <span className={over ? "text-[#f07a4e]" : "text-[#4ef07c]"}>
                      ${b.spent.toLocaleString("es-AR", { minimumFractionDigits: 2 })} / ${b.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-[#0d0f0e] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${over ? "bg-[#f07a4e]" : "bg-[#4ef07c]"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {budgetsWithProgress.length > 4 && (
              <Link href="/dashboard/budgets" className="text-sm text-[#4ef07c] hover:underline block mt-2">
                Ver todos ({budgetsWithProgress.length - 4} más)
              </Link>
            )}
          </div>
        </div>
      )}

       {/* Quick Add Transaction */}
       <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
         <h2 className="text-lg font-medium mb-4">Agregar Movimiento</h2>
         <form action="/api/transactions" method="POST" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
             <div>
               <label className="block text-sm text-[#7a8480] mb-1">Moneda</label>
               <select
                 name="currency"
                 className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
               >
                 <option value="ARS">ARS ($)</option>
                 <option value="USD">USD ($)</option>
                 <option value="EUR">EUR (€)</option>
                 <option value="BRL">BRL (R$)</option>
                 <option value="UYU">UYU ($U)</option>
               </select>
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

       {/* Update Credit Card Statement */}
       <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
         <h2 className="text-lg font-medium mb-4">💳 Actualizar Resumen de Tarjeta</h2>
         <form action="/api/card-statement" method="POST" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-[#7a8480] mb-1">Saldo Actual</label>
               <input
                 type="number"
                 name="balance"
                 step="0.01"
                 required
                 placeholder="0.00"
                 className="w-full bg-[#0d0f0e] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4ef07c]"
               />
             </div>
             <div className="flex items-end">
               <button
                 type="submit"
                 className="px-6 py-2 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
               >
                 Actualizar
               </button>
             </div>
           </div>
         </form>
         {cardStatement && (
           <p className="text-xs text-[#4a5450] mt-3">
             Último resumen: ${Number(cardStatement.balance).toLocaleString("es-AR", { minimumFractionDigits: 2 })} 
             {" "}el {new Date(cardStatement.statementDate).toLocaleDateString("es-AR")}
           </p>
         )}
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
                  Moneda
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Origen
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#4a5450]">
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
                        {tx.currency || "ARS"}
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
