import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-8 pt-32 pb-24 border-b border-white/10">
        <div className="font-mono text-[11px] text-[#4ef07c] tracking-widest uppercase mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ef07c] animate-pulse" />
          SaaS Gratuito · Open Source
        </div>

        <h1 className="font-serif text-[clamp(52px,8vw,80px)] font-light leading-none tracking-[-0.02em] text-[#e8ebe9]">
          Flow<span className="italic text-[#4ef07c]">Finance</span>
        </h1>

        <p className="mt-6 text-[#7a8480] text-lg max-w-[480px] leading-relaxed">
          Plataforma personal de finanzas que combina un bot de Telegram para
          carga rápida con un dashboard web para análisis profundo. Multi-tenant,
          open source y deployado en AWS.
        </p>

        <div className="flex gap-3 mt-10 flex-wrap">
          <span className="px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-[#4ef07c] bg-[rgba(78,240,124,0.05)]">
            Open Source
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-[#4ef07c] bg-[rgba(78,240,124,0.05)]">
            SaaS Gratuito
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-[#4eb8f0] bg-[rgba(78,184,240,0.05)]">
            TypeScript
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-[#4eb8f0] bg-[rgba(78,184,240,0.05)]">
            Next.js 14
          </span>
        </div>

        <div className="mt-12 flex gap-4 flex-wrap">
          {!userId ? (
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors">
                Empezar gratis
              </button>
            </SignInButton>
          ) : (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors inline-block"
            >
              Ir al Dashboard
            </Link>
          )}
          <Link
            href="/open-source"
            className="px-6 py-3 border border-white/10 rounded-lg text-[#e8ebe9] hover:border-white/20 transition-colors inline-block"
          >
            Ver Proyecto Open Source
          </Link>
        </div>
      </section>

      {/* ARQUITECTURA */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>01 — Arquitectura del sistema</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em]">
          Cómo está <span className="italic text-[#4ef07c]">construido</span>
        </h2>

        <p className="mt-4 text-[#7a8480] max-w-[560px] leading-relaxed">
          Tres capas bien separadas: entrada de datos (Telegram + Web), lógica de
          negocio (API Routes + Auth), e infraestructura cloud (AWS Aurora).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {/* Entrada de datos */}
          <div>
            <div className="font-mono text-[10px] text-[#4a5450] tracking-widest uppercase pb-3 border-b border-white/10 mb-3">
              Entrada de datos
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">Bot de Telegram</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Telegraf.js · NLP básico · Webhooks
              </div>
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">Web Dashboard</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Next.js 14 App Router · SSR
              </div>
            </div>
            <div className="bg-[#161918] border border-[rgba(240,184,78,0.3)] rounded-lg p-4 mb-2">
              <div className="text-sm font-medium text-[#e8ebe9]">Flujo de Linking</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Código 6 dígitos · 15 min TTL
              </div>
            </div>
          </div>

          {/* Backend / Lógica */}
          <div>
            <div className="font-mono text-[10px] text-[#4a5450] tracking-widest uppercase pb-3 border-b border-white/10 mb-3">
              Backend / Lógica
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">API Routes</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Next.js · REST · TypeScript
              </div>
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">Auth · Clerk</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Google OAuth · JWT · Roles
              </div>
            </div>
            <div className="bg-[#161918] border border-[rgba(240,184,78,0.3)] rounded-lg p-4 mb-2">
              <div className="text-sm font-medium text-[#e8ebe9]">Parser NLP</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Regex · heurísticas · categorías
              </div>
            </div>
          </div>

          {/* Infraestructura */}
          <div>
            <div className="font-mono text-[10px] text-[#4a5450] tracking-widest uppercase pb-3 border-b border-white/10 mb-3">
              Infraestructura
            </div>
            <div className="bg-[#161918] border border-[rgba(240,184,78,0.3)] rounded-lg p-4 mb-2">
              <div className="text-sm font-medium text-[#e8ebe9]">AWS Aurora MySQL</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Multi-tenant · aislamiento por user_id
              </div>
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">Vercel / EC2</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                Next.js hosting · CI/CD
              </div>
            </div>
            <div className="bg-[#161918] border border-white/10 rounded-lg p-4 mb-2 hover:border-white/20 hover:bg-[#1e2220] transition-colors">
              <div className="text-sm font-medium text-[#e8ebe9]">Telegram Webhook</div>
              <div className="font-mono text-[10px] text-[#4a5450] mt-1">
                HTTPS · token secreto
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCIA DE USUARIO */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>02 — Experiencia de usuario</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em] mb-4">
              Cómo lo <span className="italic text-[#4ef07c]">vive</span> el usuario
            </h2>
            <p className="text-[#7a8480] max-w-[560px] leading-relaxed mb-12">
              El flujo está diseñado para que el mayor esfuerzo sea el registro, y que ese registro sea casi tan rápido como escribir un mensaje.
            </p>

            {/* Journey Steps */}
            <div className="space-y-0">
              {[
                { step: "01", title: "Descubre FlowFinance", desc: "Llega a la landing page, ve la demo del bot en vivo y el pitch open source. Un botón: \"Empezar gratis\".", tags: ["Web"] },
                { step: "02", title: "Registro con Google", desc: "Un clic con Clerk. Sin formularios. Cuenta creada con rol CONSUMER. Onboarding de 3 pasos guiado.", tags: ["Web"] },
                { step: "03", title: "Conecta Telegram", desc: "Configuración → \"Conectar Telegram\" genera un código de 6 dígitos. Envía /start XXXXXX al bot. Vinculación instantánea.", tags: ["Web + Telegram"] },
                { step: "04", title: "Registra gastos al instante", desc: "Desde cualquier lugar escribe en lenguaje natural. El bot parsea, confirma y guarda. Confirmación en segundos.", tags: ["Telegram"] },
                { step: "05", title: "Analiza en el dashboard", desc: "Gráficos de torta por categoría, barras por mes, balance general. CRUD completo, exportar a CSV.", tags: ["Web"] },
                { step: "06", title: "Consultas rápidas en Telegram", desc: "Pregunta \"¿cuánto gasté este mes?\" o \"¿cuánto me queda?\" y el bot responde en segundos, sin abrir el navegador.", tags: ["Telegram"] },
              ].map((item, idx) => (
                <div key={item.step} className="grid grid-cols-[48px_1fr] gap-0 gap-x-5 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full border border-white/10 bg-[#161918] flex items-center justify-center font-mono text-[11px] text-[#4ef07c]">
                      {item.step}
                    </div>
                    {idx < 5 && <div className="w-px flex-1 bg-white/10 my-1 min-h-6" />}
                  </div>
                  <div className="pb-8">
                    <div className="text-sm font-medium text-[#e8ebe9] mb-1.5">{item.title}</div>
                    <div className="text-[#7a8480] text-sm leading-relaxed">{item.desc}</div>
                    <div className="flex gap-2 mt-2.5 flex-wrap">
                      {item.tags.map((tag) => (
                        <span key={tag} className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                          tag === "Web" ? "border-[rgba(78,240,124,0.4)] text-[#4ef07c] bg-[rgba(78,240,124,0.07)]" :
                          tag === "Telegram" ? "border-[rgba(78,184,240,0.4)] text-[#4eb8f0] bg-[rgba(78,184,240,0.07)]" :
                          "border-[rgba(240,184,78,0.4)] text-[#f0b84e] bg-[rgba(240,184,78,0.07)]"
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Bot Demo */}
            <div className="mb-5">
              <div className="font-mono text-[10px] text-[#4a5450] tracking-widest uppercase mb-3">Conversación real con el bot</div>
              <div className="bg-[#161918] border border-white/10 rounded-xl overflow-hidden max-w-[400px]">
                <div className="px-4 py-3 border-b border-white/10 bg-[#1e2220] flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-full bg-[rgba(78,240,124,0.12)] border border-[rgba(78,240,124,0.3)] flex items-center justify-center text-sm">
                    💸
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#e8ebe9]">FlowFinance Bot</div>
                    <div className="text-[10px] font-mono text-[#4ef07c]">● en línea</div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <div className="flex justify-end mb-1">
                      <div className="bg-[rgba(78,240,124,0.12)] border border-[rgba(78,240,124,0.2)] text-[#a8f0bc] rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm max-w-[82%] ml-auto">
                        Gaste 4500 en el super
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-[#4a5450] text-right mr-1">14:32</div>
                  </div>
                  <div>
                    <div className="bg-[#1e2220] border border-white/10 text-[#e8ebe9] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm max-w-[82%]">
                      ✅ Registrado<br/><br/>
                      <strong>$4.500</strong> · Supermercado<br/>
                      Hoy 14:32 · desde Telegram<br/><br/>
                      ¿Correcto? (si / no / editar)
                    </div>
                    <div className="text-[9px] font-mono text-[#4a5450]">14:32</div>
                  </div>
                  <div>
                    <div className="flex justify-end mb-1">
                      <div className="bg-[rgba(78,240,124,0.12)] border border-[rgba(78,240,124,0.2)] text-[#a8f0bc] rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm max-w-[82%] ml-auto">
                        cuanto gasté este mes?
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-[#4a5450] text-right mr-1">14:33</div>
                  </div>
                  <div>
                    <div className="bg-[#1e2220] border border-white/10 text-[#e8ebe9] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm max-w-[82%]">
                      📊 <strong>Noviembre 2024</strong><br/><br/>
                      Total gastos: $187.400<br/>
                      Supermercado: $62.000<br/>
                      Servicios: $45.000<br/>
                      Transporte: $28.000<br/>
                      Otros: $52.400<br/><br/>
                      Promedio diario: $8.520
                    </div>
                    <div className="text-[9px] font-mono text-[#4a5450]">14:33</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commands */}
            <div>
              <div className="font-mono text-[10px] text-[#4a5450] tracking-widest uppercase mb-3">Comandos disponibles</div>
              <div className="space-y-2">
                {[
                  { cmd: "\"Gaste X en Y\"", desc: "Registra un gasto con categoría automática" },
                  { cmd: "\"Cobré X\"", desc: "Registra un ingreso" },
                  { cmd: "\"¿Cuánto gasté este mes?\"", desc: "Resumen mensual por categorías" },
                  { cmd: "\"¿Cuánto me queda?\"", desc: "Balance del período actual" },
                ].map((item) => (
                  <div key={item.cmd} className="bg-[#161918] border border-white/10 rounded-lg px-4 py-2.5">
                    <div className="text-sm font-mono text-[#4ef07c]">{item.cmd}</div>
                    <div className="text-[12px] text-[#4a5450] mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-8 py-12 flex items-center justify-between flex-wrap gap-4">
        <div className="font-serif text-xl font-light text-[#7a8480]">
          Flow<span className="italic text-[#4ef07c]">Finance</span>
        </div>
        <div className="font-mono text-[11px] text-[#4a5450] text-right">
          Desarrollado por Alan Emanuel Stefanov<br/>
          Impulsando la transparencia financiera a través del código abierto.
        </div>
      </footer>
    </main>
  );
}
