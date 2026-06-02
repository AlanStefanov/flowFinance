import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      orderBy: { name: "asc" },
    });

    const expenses = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
      _sum: { amount: true },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);

    return NextResponse.json({
      budgets: budgets.map((b) => {
        const spent = b.category
          ? Number(expenses.find((e) => e.category === b.category)?._sum.amount || 0)
          : totalExpenses;
        return { ...b, amount: Number(b.amount), spent };
      }),
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, amount, month, year } = body;

    if (!name || !amount || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields: name, amount, month, year" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        name,
        category: category || null,
        amount: parseFloat(amount),
        month,
        year,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un presupuesto para esta categoría en este período" },
        { status: 409 }
      );
    }
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
