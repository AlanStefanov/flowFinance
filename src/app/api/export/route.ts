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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");

    const where: any = { userId };
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Create CSV content
    const header = "Fecha,Tipo,Categoría,Descripción,Monto,Origen\n";
    const rows = transactions
      .map((t) => {
        const date = new Date(t.date).toLocaleDateString("es-AR");
        const tipo = t.type === "INCOME" ? "Ingreso" : "Gasto";
        const description = (t.description || "").replace(/"/g, '""');
        const monto = Number(t.amount).toFixed(2);
        return `"${date}","${tipo}","${t.category}","${description}",${monto},"${t.source}"`;
      })
      .join("\n");

    const csv = header + rows;

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowfinance_transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
