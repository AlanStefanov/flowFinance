import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const latest = await prisma.creditCardStatement.findFirst({
      where: { userId },
      orderBy: { statementDate: "desc" },
    });

    return NextResponse.json(latest || { balance: 0 });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { balance } = await req.json();
    const numBalance = parseFloat(balance);

    if (isNaN(numBalance)) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const statement = await prisma.creditCardStatement.create({
      data: {
        userId,
        balance: numBalance,
      },
    });

    return NextResponse.json(statement);
  } catch (error) {
    console.error("Error al actualizar resumen:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
