import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SetAdminForm from "./SetAdminForm";

export default async function AdminPage() {
  // Global stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalTransactions,
    totalIncome,
    totalExpenses,
    telegramUsers,
    recentTransactions,
    users,
    totalPageViews,
    todayPageViews,
    topPaths,
    uniqueUsers,
    pageViewsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.user.count({
      where: { telegramId: { not: null } },
    }),
    prisma.transaction.findMany({
      take: 10,
      orderBy: { date: "desc" },
      include: { user: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    }),
    prisma.pageView.count(),
    prisma.pageView.count({
      where: { timestamp: { gte: todayStart } },
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["userId"],
      _count: true,
    }),
    prisma.pageView.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  const incomeSum = Number(totalIncome._sum.amount) || 0;
  const expenseSum = Number(totalExpenses._sum.amount) || 0;

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-8 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#7a8480] hover:text-[#e8ebe9] transition-colors"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      <h1 className="font-serif text-3xl font-light mb-2">Admin Panel</h1>
      <p className="text-[#7a8480] mb-8">
        Métricas globales del SaaS FlowFinance
      </p>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Total Usuarios</div>
          <div className="text-2xl font-light text-[#e8ebe9]">
            {totalUsers.toLocaleString()}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Total Transacciones</div>
          <div className="text-2xl font-light text-[#e8ebe9]">
            {totalTransactions.toLocaleString()}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Usuarios Telegram</div>
          <div className="text-2xl font-light text-[#4eb8f0]">
            {telegramUsers.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Ingresos Totales</div>
          <div className="text-2xl font-light text-[#4ef07c]">
            +${incomeSum.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[#161918] border border-white/10 rounded-lg p-6">
          <div className="text-[#7a8480] text-sm mb-1">Gastos Totales</div>
          <div className="text-2xl font-light text-[#f07a4e]">
            -${expenseSum.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">📊 Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-[#7a8480] text-sm">Vistas Totales</div>
            <div className="text-xl font-light">{totalPageViews.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[#7a8480] text-sm">Vistas Hoy</div>
            <div className="text-xl font-light">{todayPageViews.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[#7a8480] text-sm">Usuarios Únicos</div>
            <div className="text-xl font-light">{uniqueUsers.length.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[#7a8480] text-sm">Páginas</div>
            <div className="text-xl font-light">{topPaths.length}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[#7a8480] text-sm mb-2">Páginas más visitadas</div>
            <div className="space-y-1">
              {topPaths.map((p) => (
                <div key={p.path} className="flex justify-between text-sm">
                  <span className="font-mono text-[#4a5450]">{p.path}</span>
                  <span className="text-[#4ef07c] font-mono">{p._count.toLocaleString()}</span>
                </div>
              ))}
              {topPaths.length === 0 && (
                <div className="text-[#4a5450] text-sm">Sin datos aún</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-[#7a8480] text-sm mb-2">Vistas últimos 30 días</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(() => {
                const byDay: Record<string, number> = {};
                for (const v of pageViewsByDay) {
                  const day = new Date(v.timestamp).toLocaleDateString("es-AR");
                  byDay[day] = (byDay[day] || 0) + 1;
                }
                return Object.entries(byDay).reverse().slice(0, 30).map(([day, count]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-[#4a5450]">{day}</span>
                    <span className="text-[#4eb8f0] font-mono">{count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          {
            source: "WEB",
            color: "#4ef07c",
            count: await prisma.transaction.count({ where: { source: "WEB" } }),
          },
          {
            source: "TELEGRAM",
            color: "#4eb8f0",
            count: await prisma.transaction.count({ where: { source: "TELEGRAM" } }),
          },
        ].map((item) => (
          <div
            key={item.source}
            className="bg-[#161918] border border-white/10 rounded-lg p-6"
          >
            <div className="text-[#7a8480] text-sm mb-1">
              Via {item.source}
            </div>
            <div
              className="text-2xl font-light"
              style={{ color: item.color }}
            >
              {item.count.toLocaleString()} transacciones
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#161918] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium">Últimas Transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Categoría
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
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id.toString()}
                  className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm">
                    {tx.user.email || tx.user.id}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Admin Form */}
      <div className="bg-[#161918] border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Promover a Admin</h2>
        <SetAdminForm />
      </div>

      {/* Users List */}
      <div className="bg-[#161918] border border-white/10 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium">Usuarios Registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Telegram
                </th>
                <th className="text-right px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Transacciones
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono text-[#4a5450] uppercase tracking-wider">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        user.role === "ADMIN"
                          ? "bg-[rgba(78,184,240,0.1)] text-[#4eb8f0]"
                          : "bg-[rgba(122,132,128,0.1)] text-[#7a8480]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.telegramId ? (
                      <span className="text-[#4eb8f0] text-xs">✓ Vinculado</span>
                    ) : (
                      <span className="text-[#4a5450] text-xs">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-mono">
                    {user._count.transactions}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#7a8480]">
                    {new Date(user.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
