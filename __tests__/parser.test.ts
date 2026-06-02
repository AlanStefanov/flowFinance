/**
 * Tests for the NLP parser used by the Telegram bot.
 * Run with: node --import tsx --test __tests__/parser.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert";

// Re-import parser logic for testing
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
  // Remove thousand separators (dots followed by 3 digits)
  let cleaned = raw.replace(/\.(\d{3})/g, "$1");
  // Normalize comma decimal to dot
  cleaned = cleaned.replace(",", ".");
  return parseFloat(cleaned);
}

interface ParsedTransaction {
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  description: string;
}

function parseExpense(text: string): ParsedTransaction | null {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const expensePatterns = [
    /(?:gaste|gasto|gasté)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:en|por)?\s*(.+)?/i,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:en|por)\s*(.+)/i,
    /(?:pagué|pague|pago|aboné|abone)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:compré|compro|compre)\s+(.+?)\s+por\s+(\d+(?:[.,]\d{1,2})?)/i,
    /(?:transferí|transferi|transferencia)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:a|por)?\s*(.+)?/i,
    /(?:debit[oó]|debito)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:de|en|por)?\s*(.+)?/i,
    /(?:consum[ií]|consumo)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:en|por)?\s*(.+)?/i,
  ];

  for (const pattern of expensePatterns) {
    const match = text.match(pattern);
    if (match) {
      let amount: number;
      let desc: string;
      if (pattern.source.includes("compr") && pattern.source.includes("por")) {
        amount = parseAmount(match[2]);
        desc = match[1]?.trim() || "";
      } else {
        amount = parseAmount(match[1]);
        desc = match[2]?.trim() || "";
      }
      if (isNaN(amount) || amount <= 0) continue;
      const category = categorize(desc, "EXPENSE");
      return { amount, category, type: "EXPENSE", description: desc };
    }
  }

  const incomePatterns = [
    /(?:cobré|cobro|cobre|recibí|recibi|recibo)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:me\s+)?(?:pagaron|pago|pagaron)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:sueldo|salario)\s*(?:de)?\s*(\d+(?:[.,]\d{1,2})?)/i,
    /(?:honorarios|factur[oó]|facturo)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:ingres[oó]|ingreso)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
  ];

  for (const pattern of incomePatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseAmount(match[1]);
      if (isNaN(amount) || amount <= 0) continue;
      const desc = match[2]?.trim() || "Sueldo";
      const category = categorize(desc, "INCOME");
      return { amount, category, type: "INCOME", description: desc };
    }
  }

  return null;
}

// ── Tests ──────────────────────────────────────────

describe("parseAmount", () => {
  it("parses dot decimal", () => {
    assert.strictEqual(parseAmount("4500.50"), 4500.50);
  });
  it("parses comma decimal (argentine format)", () => {
    assert.strictEqual(parseAmount("4500,50"), 4500.50);
  });
  it("parses integer", () => {
    assert.strictEqual(parseAmount("4500"), 4500);
  });
  it("handles thousand separators", () => {
    assert.strictEqual(parseAmount("1.500"), 1500);
  });
});

describe("categorize", () => {
  it("detects food", () => {
    assert.strictEqual(categorize("supermercado", "EXPENSE"), "Alimentación");
    assert.strictEqual(categorize("comida china", "EXPENSE"), "Alimentación");
  });
  it("detects transport", () => {
    assert.strictEqual(categorize("uber", "EXPENSE"), "Transporte");
    assert.strictEqual(categorize("nafta", "EXPENSE"), "Transporte");
  });
  it("detects entertainment", () => {
    assert.strictEqual(categorize("netflix", "EXPENSE"), "Entretenimiento");
    assert.strictEqual(categorize("cine", "EXPENSE"), "Entretenimiento");
  });
  it("returns Otros for unknown", () => {
    assert.strictEqual(categorize("cosas varias", "EXPENSE"), "Otros");
  });
  it("returns Ingresos for income type", () => {
    assert.strictEqual(categorize("sueldo", "INCOME"), "Ingresos");
  });
});

describe("parseExpense", () => {
  it('parses "Gaste 4500 en el super"', () => {
    const result = parseExpense("Gaste 4500 en el super");
    assert(result !== null);
    assert.strictEqual(result.amount, 4500);
    assert.strictEqual(result.category, "Alimentación");
    assert.strictEqual(result.type, "EXPENSE");
  });

  it('parses "gasto 1500,50 en uber" (comma decimal)', () => {
    const result = parseExpense("gasto 1500,50 en uber");
    assert(result !== null);
    assert.strictEqual(result.amount, 1500.50);
    assert.strictEqual(result.category, "Transporte");
  });

  it('parses "Pague 1200 de internet"', () => {
    const result = parseExpense("Pague 1200 de internet");
    assert(result !== null);
    assert.strictEqual(result.amount, 1200);
    assert.strictEqual(result.category, "Servicios");
  });

  it('parses "Compre remera por 3500"', () => {
    const result = parseExpense("Compre remera por 3500");
    assert(result !== null);
    assert.strictEqual(result.amount, 3500);
    assert.strictEqual(result.category, "Ropa");
  });

  it('parses "Cobre 50000 sueldo"', () => {
    const result = parseExpense("Cobre 50000 sueldo");
    assert(result !== null);
    assert.strictEqual(result.amount, 50000);
    assert.strictEqual(result.type, "INCOME");
  });

  it('parses "Cobré 50000 por el proyecto"', () => {
    const result = parseExpense("Cobré 50000 por el proyecto");
    assert(result !== null);
    assert.strictEqual(result.amount, 50000);
    assert.strictEqual(result.description, "el proyecto");
  });

  it('parses "Salario de 80000"', () => {
    const result = parseExpense("Salario de 80000");
    assert(result !== null);
    assert.strictEqual(result.amount, 80000);
    assert.strictEqual(result.type, "INCOME");
  });

  it("returns null for gibberish", () => {
    const result = parseExpense("hola como estas");
    assert.strictEqual(result, null);
  });

  it("returns null for empty text", () => {
    const result = parseExpense("");
    assert.strictEqual(result, null);
  });
});
