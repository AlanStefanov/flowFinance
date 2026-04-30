import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check if requester is admin
    const requester = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ error: "No tenés permisos de administrador" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ 
      message: `Usuario ${email} ahora es ADMIN`,
      user: { id: updated.id, email: updated.email, role: updated.role }
    });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
