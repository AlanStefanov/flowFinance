import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BudgetsClient from "./BudgetsClient";

export default async function BudgetsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [budgets, expenses] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      orderBy: { name: "asc" },
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

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);

  const budgetsWithSpending = budgets.map((b) => {
    const spent = b.category
      ? Number(expenses.find((e) => e.category === b.category)?._sum.amount || 0)
      : totalExpenses;
    return { ...b, amount: Number(b.amount), spent };
  });

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-8 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#7a8480] hover:text-[#e8ebe9] transition-colors"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Presupuestos</h1>
          <p className="text-[#7a8480] mt-1">
            Establecé límites mensuales por categoría
          </p>
        </div>
      </div>

      <BudgetsClient
        initialBudgets={budgetsWithSpending}
        month={currentMonth}
        year={currentYear}
      />
    </main>
  );
}
