import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function categorize(description: string, type: string): string {
  const desc = description.toLowerCase();
  if (type === "EXPENSE") {
    if (desc.match(/super|mercado|comida|restaurante|cafe|café/)) return "Alimentación";
    if (desc.match(/uber|taxi|colectivo|subte|nafta|estacionamiento/)) return "Transporte";
    if (desc.match(/luz|agua|gas|internet|telefono/)) return "Servicios";
    if (desc.match(/cine|teatro|netflix|spotify|juego|juegos/)) return "Entretenimiento";
    if (desc.match(/medic|doctor|farmacia|hospital/)) return "Salud";
    if (desc.match(/ropa|zapatillas|zapatos|calzado|remera|buzo|jean|pantalon/)) return "Ropa";
    return "Otros";
  }
  return "Ingresos";
}

function parseAmount(raw: string): number {
  let cleaned = raw.replace(/\.(\d{3})/g, "$1");
  cleaned = cleaned.replace(",", ".");
  return parseFloat(cleaned);
}

describe("parseAmount", () => {
  it("handles large argentine numbers with dots", () => {
    expect(parseAmount("1.500.000,50")).toBe(1500000.50);
  });
  it("handles thousand separator", () => {
    expect(parseAmount("1.000")).toBe(1000);
  });
  it("handles comma decimal", () => {
    expect(parseAmount("500,99")).toBe(500.99);
  });
  it("handles integer", () => {
    expect(parseAmount("4500")).toBe(4500);
  });
  it("handles dot decimal", () => {
    expect(parseAmount("4500.50")).toBe(4500.50);
  });
});

describe("categorize", () => {
  it("returns Otros for unrecognized expense", () => {
    expect(categorize("amazon USD", "EXPENSE")).toBe("Otros");
  });
  it("returns Ingresos for income", () => {
    expect(categorize("cobro USD", "INCOME")).toBe("Ingresos");
  });
  it("detects food with multi-word", () => {
    expect(categorize("comida china", "EXPENSE")).toBe("Alimentación");
  });
});

describe("Prisma — Transaction with currency", () => {
  let userId: string;

  beforeAll(async () => {
    userId = "test-tx-user";
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "tx-test@flowfinance.app" },
    });
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("creates with default ARS currency", async () => {
    const tx = await prisma.transaction.create({
      data: {
        userId, amount: 4500, type: "EXPENSE",
        category: "Test", date: new Date(), source: "WEB",
      },
    });
    expect(tx.currency).toBe("ARS");
  });

  it("creates with USD currency", async () => {
    const tx = await prisma.transaction.create({
      data: {
        userId, amount: 100, type: "EXPENSE",
        category: "Amazon", date: new Date(), source: "WEB",
        currency: "USD",
      },
    });
    expect(tx.currency).toBe("USD");
  });

  it("filters by currency", async () => {
    const usd = await prisma.transaction.findMany({
      where: { userId, currency: "USD" },
    });
    expect(usd.length).toBe(1);
  });
});

describe("Prisma — Budget", () => {
  let userId: string;

  beforeAll(async () => {
    userId = "test-budget-user";
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "budget-test@flowfinance.app" },
    });
  });

  afterAll(async () => {
    await prisma.budget.deleteMany({ where: { userId } });
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("creates a budget with category", async () => {
    const b = await prisma.budget.create({
      data: { userId, name: "Super", category: "Supermercado", amount: 60000, month: 6, year: 2026 },
    });
    expect(b.name).toBe("Super");
    expect(Number(b.amount)).toBe(60000);
  });

  it("prevents duplicate category+month+year", async () => {
    await expect(
      prisma.budget.create({
        data: { userId, name: "Super", category: "Supermercado", amount: 50000, month: 6, year: 2026 },
      })
    ).rejects.toThrow();
  });

  it("creates global budget (no category)", async () => {
    const b = await prisma.budget.create({
      data: { userId, name: "General", amount: 200000, month: 6, year: 2026 },
    });
    expect(b.category).toBeNull();
  });
});

describe("Prisma — PageView", () => {
  let userId: string;

  beforeAll(async () => {
    userId = "test-pv-user";
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "pv-test@flowfinance.app" },
    });
  });

  afterAll(async () => {
    await prisma.pageView.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("creates a page view", async () => {
    const pv = await prisma.pageView.create({
      data: { path: "/dashboard", userId },
    });
    expect(pv.path).toBe("/dashboard");
  });

  it("counts page views", async () => {
    const count = await prisma.pageView.count({ where: { userId } });
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("groups by path", async () => {
    const groups = await prisma.pageView.groupBy({
      by: ["path"], where: { userId }, _count: true,
    });
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });
});
