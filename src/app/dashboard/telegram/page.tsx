import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TelegramLinkClient from "./TelegramLinkClient";

export default async function TelegramPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [link, categories] = await Promise.all([
    prisma.telegramLink.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  const isLinked = link && link.isActive && new Date() < link.expiresAt;

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

      <h1 className="font-serif text-3xl font-light mb-2">Conectar Telegram</h1>
      <p className="text-[#7a8480] mb-8">
        Vincula tu cuenta de Telegram para registrar gastos e ingresos desde
        cualquier lugar.
      </p>

      <TelegramLinkClient
        initialLink={link}
        isLinked={!!isLinked}
      />

      {/* Instructions */}
      <div className="mt-12 bg-[#161918] border border-white/10 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Cómo usar el bot</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ef07c]/10 border border-[#4ef07c]/30 flex items-center justify-center text-[#4ef07c] text-sm font-mono">
              1
            </span>
            <div>
              <div className="font-medium text-sm">Genera un código</div>
              <div className="text-[#7a8480] text-sm mt-1">
                Haz clic en "Generar Código" y copia el código de 6 dígitos.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ef07c]/10 border border-[#4ef07c]/30 flex items-center justify-center text-[#4ef07c] text-sm font-mono">
              2
            </span>
            <div>
              <div className="font-medium text-sm">Abre Telegram</div>
              <div className="text-[#7a8480] text-sm mt-1">
                Busca @FlowFinanceBot y envía:{" "}
                <code className="bg-[#0d0f0e] px-2 py-1 rounded text-[#4ef07c] font-mono text-xs">
                  /start CODE
                </code>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ef07c]/10 border border-[#4ef07c]/30 flex items-center justify-center text-[#4ef07c] text-sm font-mono">
              3
            </span>
            <div>
              <div className="font-medium text-sm">¡Empieza a usar!</div>
              <div className="text-[#7a8480] text-sm mt-1">
                Escribe gastos o ingresos en lenguaje natural. Ejemplo:{" "}
                <code className="bg-[#0d0f0e] px-2 py-1 rounded text-[#4ef07c] font-mono text-xs">
                  Gaste 4500 en el super
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commands Reference */}
      <div className="mt-8 bg-[#161918] border border-white/10 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Comandos disponibles</h2>
        <div className="space-y-3">
          <div className="bg-[#0d0f0e] rounded-lg p-3">
            <div className="text-[#4ef07c] text-sm font-mono">
              "Gaste X en Y"
            </div>
            <div className="text-[#7a8480] text-xs mt-1">
              Registra un gasto con categoría automática
            </div>
          </div>
          <div className="bg-[#0d0f0e] rounded-lg p-3">
            <div className="text-[#4ef07c] text-sm font-mono">
              "Cobré X"
            </div>
            <div className="text-[#7a8480] text-xs mt-1">
              Registra un ingreso
            </div>
          </div>
          <div className="bg-[#0d0f0e] rounded-lg p-3">
            <div className="text-[#4ef07c] text-sm font-mono">
              "¿Cuánto gasté este mes?"
            </div>
            <div className="text-[#7a8480] text-xs mt-1">
              Resumen mensual por categorías
            </div>
          </div>
          <div className="bg-[#0d0f0e] rounded-lg p-3">
            <div className="text-[#4ef07c] text-sm font-mono">
              "¿Cuánto me queda?"
            </div>
            <div className="text-[#7a8480] text-xs mt-1">
              Balance del período actual
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
