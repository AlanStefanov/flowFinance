import { Telegraf } from "telegraf";
import { PrismaClient, TransactionType, Source } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const prisma = new PrismaClient();

// Simple categorization based on keywords
function categorize(description: string, type: string): string {
  const desc = description.toLowerCase();

  if (type === "EXPENSE") {
    if (desc.match(/super|mercado|comida|restaurante|cafe|café/))
      return "Alimentación";
    if (desc.match(/uber|taxi|colectivo|subte|nafta|estacionamiento/))
      return "Transporte";
    if (desc.match(/luz|agua|gas|internet|telefono/))
      return "Servicios";
    if (desc.match(/cine|teatro|netflix|spotify|juego|juegos/))
      return "Entretenimiento";
    if (desc.match(/medic|doctor|farmacia|hospital/)) return "Salud";
    if (desc.match(/ropa|zapatillas|zapatos|calzado|remera|buzo|jean|pantalon/)) return "Ropa";
    return "Otros";
  }

  return "Ingresos";
}

// Helper: Find user by telegram ID
async function findUserByTelegramId(telegramId: number) {
  return prisma.user.findFirst({
    where: { telegramId: BigInt(telegramId) },
  });
}

// Parse argentine amount format (comma as decimal separator)
function parseAmount(raw: string): number {
  let cleaned = raw.replace(/\.(\d{3})/g, "$1");
  cleaned = cleaned.replace(",", ".");
  return parseFloat(cleaned);
}

// Parse expense/income from natural language
function parseExpense(text: string): {
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
} | null {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Expense patterns
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

      if (pattern.source.includes("compré") || pattern.source.includes("compre")) {
        amount = parseAmount(match[2]);
        desc = match[1]?.trim() || "";
      } else {
        amount = parseAmount(match[1]);
        desc = match[2]?.trim() || "";
      }

      if (isNaN(amount) || amount <= 0) continue;

      const category = categorize(desc, "EXPENSE");
      return { amount, category, type: "EXPENSE" as TransactionType, description: desc };
    }
  }

  // Income patterns
  const incomePatterns = [
    /(?:cobré|cobro|cobre|recibí|recibi|recibo)\s+(\d+(?:\.\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:me\s+)?(?:pagaron|pago|pagaron)\s+(\d+(?:\.\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:sueldo|salario)\s*(?:de)?\s*(\d+(?:\.\d{1,2})?)/i,
    /(?:honorarios|factur[oó]|facturo)\s+(\d+(?:\.\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
    /(?:ingres[oó]|ingreso)\s+(\d+(?:\.\d{1,2})?)\s*(?:por)?\s*(.+)?/i,
  ];

  for (const pattern of incomePatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseAmount(match[1]);
      if (isNaN(amount) || amount <= 0) continue;
      const desc = match[2]?.trim() || "Sueldo";
      const category = categorize(desc, "INCOME");
      return { amount, category, type: "INCOME" as TransactionType, description: desc };
    }
  }

  return null;
}

// /start command - linking
bot.start(async (ctx) => {
  const telegramId = ctx.from?.id;
  const message = ctx.message?.text || "";

  // Check if there's a pairing code
  const codeMatch = message.match(/\/start\s+(\d{6})/);
  if (codeMatch && telegramId) {
    const code = codeMatch[1];

    const link = await prisma.telegramLink.findFirst({
      where: {
        pairingCode: code,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!link) {
      return ctx.reply(
        "❌ Código inválido o expirado. Genera uno nuevo desde el dashboard."
      );
    }

    // Update user with telegram ID
    await prisma.user.update({
      where: { id: link.userId },
      data: { telegramId: BigInt(telegramId) },
    });

    // Deactivate the link
    await prisma.telegramLink.update({
      where: { id: link.id },
      data: { isActive: false },
    });

    return ctx.reply(
      "✅ ¡Vinculación exitosa! Ahora podés registrar gastos e ingresos.\n\n" +
      "Comandos disponibles:\n" +
      "• Gaste 4500 en el super\n" +
      "• Cobré 50000 sueldo\n" +
      "• Mis gastos este mes\n" +
      "• Balance\n" +
      "• /ultimos — últimos movimientos\n" +
      "• /help — todos los comandos"
    );
  }

  // Check if already linked
  if (telegramId) {
    const existingUser = await findUserByTelegramId(telegramId);
    if (existingUser) {
      return ctx.reply(
        "✅ Ya estás vinculado a FlowFinance. Escribí un gasto o ingreso!\n\n" +
        "• /help — ver todos los comandos"
      );
    }
  }

  return ctx.reply(
    "👋 ¡Hola! Para vincular tu cuenta, envía desde el dashboard: /start CÓDIGO"
  );
});

// /help command
bot.help(async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply("❌ No se pudo identificar tu usuario.");
  const user = await findUserByTelegramId(telegramId);
  if (!user) {
    return ctx.reply("❌ No estás vinculado. Usá /start CÓDIGO para vincular tu cuenta.");
  }

  const message =
    "🤖 *FlowFinance - Comandos*\n\n" +
    "*Registrar transacciones:*\n" +
    "• `Gaste 4500 en el super` — registrar gasto\n" +
    "• `Cobré 50000 sueldo` — registrar ingreso\n" +
    "• `Pague 1200 de uber` — registrar gasto\n" +
    "• `Compre remera por 3500` — registrar gasto\n\n" +
    "*Consultas:*\n" +
    "• `Mis gastos este mes` — total de gastos × categoría\n" +
    "• `Balance` — ingresos vs gastos + presupuesto diario\n" +
    "• `/ultimos [N]` — últimos N movimientos (default 5)\n\n" +
    "*Tarjeta de crédito:*\n" +
    "• `El resumen va en 5000` — actualizar saldo\n" +
    "• `Cuanto debo?` — consultar resumen actual\n\n" +
    "*Gestión:*\n" +
    "• `/eliminar <ID>` — eliminar un movimiento\n" +
    "• `/help` — este mensaje\n\n" +
    "🌐 *Dashboard web:* gestioná categorías y gráficos en flowfinance.app";

  return ctx.reply(message, { parse_mode: "Markdown" });
});

// /ultimos command - view recent transactions
bot.command("ultimos", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  const user = await findUserByTelegramId(telegramId);
  if (!user) return ctx.reply("❌ No estás vinculado. Usá /start CÓDIGO.");

  const text = ctx.message.text;
  const parts = text.split(/\s+/);
  const n = parseInt(parts[1] || "5");
  const count = Math.min(Math.max(n, 1), 20);

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: count,
  });

  if (transactions.length === 0) {
    return ctx.reply("📭 No hay movimientos registrados.");
  }

  let message = `📋 *Últimos ${transactions.length} movimientos:*\n\n`;
  for (const tx of transactions) {
    const sign = tx.type === "INCOME" ? "+" : "-";
    const emoji = tx.type === "INCOME" ? "📈" : "📉";
    const currency = (tx as any).currency || "ARS";
    message += `${emoji} *${tx.category}* — ${sign}$${Number(tx.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })} ${currency}\n`;
    message += `   ${new Date(tx.date).toLocaleDateString("es-AR")} | ${tx.description || "—"} | \`#${tx.id}\`\n`;
  }
  message += `\nPara eliminar: /eliminar #ID`;

  return ctx.reply(message, { parse_mode: "Markdown" });
});

// /eliminar command - delete a transaction by ID
bot.command("eliminar", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  const user = await findUserByTelegramId(telegramId);
  if (!user) return ctx.reply("❌ No estás vinculado. Usá /start CÓDIGO.");

  const text = ctx.message.text;
  const parts = text.split(/\s+/);
  const idStr = (parts[1] || "").replace(/^#/, "");
  if (!idStr || !/^\d+$/.test(idStr)) {
    return ctx.reply("❌ Usá: /eliminar #ID (ej: /eliminar #42)");
  }

  const id = BigInt(idStr);
  const tx = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });

  if (!tx) {
    return ctx.reply("❌ Movimiento no encontrado o no te pertenece.");
  }

  await prisma.transaction.delete({ where: { id } });

  return ctx.reply(
    `🗑️ *Movimiento eliminado*\n\n` +
    `*Monto:* $${Number(tx.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n` +
    `*Categoría:* ${tx.category}\n` +
    `*Fecha:* ${new Date(tx.date).toLocaleDateString("es-AR")}`,
    { parse_mode: "Markdown" }
  );
});

// Handle text messages (expenses/income)
bot.on("text", async (ctx) => {
  const telegramId = ctx.from?.id;
  const text = ctx.message.text;

  // Skip commands
  if (text.startsWith("/")) return;

  if (!telegramId) return;

  const user = await findUserByTelegramId(telegramId);
  if (!user) {
    return ctx.reply(
      "❌ No estás vinculado. Usá /start CÓDIGO para vincular tu cuenta."
    );
  }

  // Check for queries
  if (text.match(/cuánto\s+gast[ei]|gastos?\s+este\s+mes/i)) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (transactions.length === 0) {
      return ctx.reply("📊 Este mes no registraste gastos aún.");
    }

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const byCategory = transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    let message = `📊 *Gastos ${now.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}*\n\n`;
    message += `*Total:* $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n\n`;

    const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    for (const [cat, amount] of sortedCategories) {
      message += `${cat}: $${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n`;
    }

    const dailyAvg = total / now.getDate();
    message += `\n*Promedio diario:* $${dailyAvg.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

    return ctx.reply(message, { parse_mode: "Markdown" });
  }

  if (text.match(/cuánto\s+me\s+queda|balance/i)) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [income, expenses] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: "INCOME",
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalIncome - totalExpenses;

    let message = `💰 *Balance ${now.toLocaleDateString("es-AR", { month: "long" })}*\n\n`;
    message += `*Ingresos:* +$${totalIncome.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n`;
    message += `*Gastos:* -$${totalExpenses.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n\n`;
    message += `*Balance:* ${balance >= 0 ? "+" : ""}$${balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n\n`;

    const daysLeft = endOfMonth.getDate() - now.getDate();
    if (daysLeft > 0 && balance > 0) {
      const dailyBudget = balance / daysLeft;
      message += `*Presupuesto diario restante:* $${dailyBudget.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    }

    return ctx.reply(message, { parse_mode: "Markdown" });
  }

  // Check for credit card statement update
  const statementMatch = text.match(/(?:resumen|tarjeta)(?:\s+va)?\s*(?:en)?\s*\$?\s*(\d+(?:\.\d{1,2})?)/i);
  if (statementMatch) {
    const balance = parseFloat(statementMatch[1]);
    
    if (isNaN(balance) || balance < 0) {
      return ctx.reply("❌ El monto debe ser un número válido mayor o igual a 0.");
    }

    try {
      const statement = await prisma.creditCardStatement.create({
        data: {
          userId: user.id,
          balance: balance,
        },
      });

      return ctx.reply(
        `💳 *Resumen de tarjeta actualizado*\n\n` +
        `*Saldo actual:* $${balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n` +
        `*Fecha:* ${new Date().toLocaleDateString("es-AR")}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Error saving statement:", error);
      return ctx.reply("❌ Error al actualizar el resumen. Probá de nuevo.");
    }
  }

  // Check for credit card statement query
  if (text.match(/cuánto\s+(?:debo|es\s+el\s+resumen)|resumen\s+(?:actual|de\s+la\s+tarjeta)/i)) {
    const latest = await prisma.creditCardStatement.findFirst({
      where: { userId: user.id },
      orderBy: { statementDate: "desc" },
    });

    if (!latest) {
      return ctx.reply("💳 No tenés ningún resumen registrado. Escribí 'El resumen va en 5000' para actualizarlo.");
    }

    return ctx.reply(
      `💳 *Resumen de tarjeta actual*\n\n` +
      `*Saldo:* $${Number(latest.balance).toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n` +
      `*Actualizado:* ${latest.statementDate.toLocaleDateString("es-AR")}`,
      { parse_mode: "Markdown" }
    );
  }

  // Try to parse as expense/income
  const parsed = parseExpense(text);
  if (!parsed) {
    return ctx.reply(
      "🤔 No entendí. Probá con: 'Gaste 4500 en el super', 'Cobré 50000' o 'El resumen va en 5000'"
    );
  }

  if (isNaN(parsed.amount) || parsed.amount <= 0) {
    return ctx.reply("❌ El monto debe ser un número válido mayor a 0.");
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        description: parsed.description,
        date: new Date(),
        source: "TELEGRAM" as Source,
        currency: "ARS",
      },
    });

    const emoji = parsed.type === "INCOME" ? "📈" : "📉";
    const typeText = parsed.type === "INCOME" ? "Ingreso" : "Gasto";

    return ctx.reply(
      `${emoji} *${typeText} registrado*\n\n` +
        `*Monto:* $${parsed.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}\n` +
        `*Categoría:* ${parsed.category}\n` +
        `*Fecha:* ${new Date().toLocaleDateString("es-AR")}\n\n` +
        `¿Correcto? (si / no / editar)`
    );
  } catch (error) {
    console.error("Error saving transaction:", error);
    return ctx.reply("❌ Error al guardar. Probá de nuevo.");
  }
});

// Start bot
bot
  .launch()
  .then(() => {
    console.log("🤖 FlowFinance Telegram Bot started!");
  })
  .catch((err) => {
    console.error("Failed to start bot:", err);
  });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
