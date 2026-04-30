import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const wh = new Webhook(WEBHOK_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  try {
    wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    const { type, data } = payload;

    if (type === "user.created") {
      const { id, email_addresses } = data;
      const email = email_addresses?.[0]?.email_address;

      if (id && email) {
        await prisma.user.upsert({
          where: { id },
          update: {},
          create: {
            id,
            email,
            role: "USER",
          },
        });
      }
    }

    if (type === "user.updated") {
      const { id, email_addresses } = data;
      const email = email_addresses?.[0]?.email_address;

      if (id && email) {
        await prisma.user.update({
          where: { id },
          data: { email },
        });
      }
    }

    if (type === "user.deleted") {
      const { id } = data;
      if (id) {
        await prisma.user.deleteMany({
          where: { id },
        });
      }
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }
}
