import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { categories: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Check if onboarding is complete
  const hasCategories = user.categories.length > 0;
  const hasTelegram = !!user.telegramId;

  const currentStep = !hasCategories ? 1 : !hasTelegram ? 2 : 3;

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl font-light mb-2">
          Bienvenido a <span className="italic text-[#4ef07c]">FlowFinance</span>
        </h1>
        <p className="text-[#7a8480]">Completá estos pasos para comenzar</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                step < currentStep
                  ? "bg-[#4ef07c] text-[#0d0f0e]"
                  : step === currentStep
                    ? "border-2 border-[#4ef07c] text-[#4ef07c]"
                    : "border border-white/10 text-[#4a5450]"
              }`}
            >
              {step < currentStep ? "✓" : step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-px ${
                  step < currentStep ? "bg-[#4ef07c]" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="bg-[#161918] border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-medium mb-2">Paso 1: Crea tus categorías</h2>
          <p className="text-[#7a8480] mb-6">
            Agregá al menos 3 categorías para organizar tus finanzas
            (ejemplo: Alimentación, Transporte, Servicios).
          </p>
          <Link
            href="/dashboard/categories"
            className="inline-block px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Ir a Categorías
          </Link>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-[#161918] border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-medium mb-2">Paso 2: Conecta Telegram</h2>
          <p className="text-[#7a8480] mb-6">
            Vinculá tu cuenta de Telegram para registrar gastos e ingresos
            desde cualquier lugar.
          </p>
          <Link
            href="/dashboard/telegram"
            className="inline-block px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Conectar Telegram
          </Link>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-[#161918] border border-white/10 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-medium mb-2">¡Todo listo!</h2>
          <p className="text-[#7a8480] mb-6">
            Tu cuenta está configurada. ¡Empezá a gestionar tus finanzas!
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      )}
    </main>
  );
}
