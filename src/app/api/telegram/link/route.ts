import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Invalidate existing active links for this user
    await prisma.telegramLink.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const link = await prisma.telegramLink.create({
      data: {
        userId,
        pairingCode: code,
        expiresAt,
      },
    });

    return NextResponse.json({
      code: link.pairingCode,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error("Error generating pairing code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await prisma.telegramLink.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!link) {
      return NextResponse.json({ active: false });
    }

    const isExpired = new Date() > link.expiresAt;

    return NextResponse.json({
      active: !isExpired && link.isActive,
      code: !isExpired ? link.pairingCode : null,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error("Error checking telegram link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
