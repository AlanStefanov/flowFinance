import Link from "next/link";

export default function OpenSourcePage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-8 pt-32 pb-24 border-b border-white/10">
        <div className="font-mono text-[11px] text-[#4ef07c] tracking-widest uppercase mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ef07c] animate-pulse" />
          Proyecto Open Source
        </div>

        <h1 className="font-serif text-[clamp(52px,8vw,80px)] font-light leading-none tracking-[-0.02em] text-[#e8ebe9]">
          Flow<span className="italic text-[#4ef07c]">Finance</span>
          <span className="text-[#7a8480]">/</span>
          <span className="text-2xl">Open Source</span>
        </h1>

        <p className="mt-6 text-[#7a8480] text-lg max-w-[480px] leading-relaxed">
          Código abierto, transparencia financiera. Contribuí, usá el repo
          para tu propio hosting, o uníte a nuestra comunidad de desarroladores.
        </p>

        <div className="flex gap-4 mt-12 flex-wrap">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors inline-block"
          >
            Ver en GitHub
          </a>
          <Link
            href="/"
            className="px-6 py-3 border border-white/10 rounded-lg text-[#e8ebe9] hover:border-white/20 transition-colors inline-block"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </section>

      {/* DATABASE */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>01 — Base de datos</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em] mb-4">
          Esquema <span className="italic text-[#4ef07c]">MySQL</span> · AWS Aurora
        </h2>
        <p className="text-[#7a8480] max-w-[560px] leading-relaxed mb-12">
          Diseñado para multi-tenancy desde el día uno. Todas las queries filtran por user_id. Aislamiento total entre usuarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* users table */}
          <div className="bg-[#161918] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#1e2220] flex items-center justify-between">
              <span className="text-sm font-mono text-[#a8f0bc] font-medium">users</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-[rgba(78,240,124,0.3)] text-[#4ef07c] bg-[rgba(78,240,124,0.05)]">principal</span>
            </div>
            {[
              { field: "id", type: "VARCHAR(255)", pk: true },
              { field: "email", type: "VARCHAR(255)" },
              { field: "telegram_id", type: "BIGINT NULL" },
              { field: "role", type: "ENUM(ADMIN,USER)" },
              { field: "created_at", type: "DATETIME" },
            ].map((row) => (
              <div key={row.field} className="px-4 py-1.5 border-b border-white/10 flex justify-between items-center text-sm">
                <span className="font-mono text-[#e8ebe9]">{row.field}</span>
                <div className="flex items-center gap-2">
                  {row.pk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(240,184,78,0.15)] text-[#f0b84e] border border-[rgba(240,184,78,0.3)]">PK</span>}
                  <span className="font-mono text-[11px] text-[#4a5450]">{row.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* transactions table */}
          <div className="bg-[#161918] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#1e2220] flex items-center justify-between">
              <span className="text-sm font-mono text-[#a8f0bc] font-medium">transactions</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-[rgba(78,240,124,0.3)] text-[#4ef07c] bg-[rgba(78,240,124,0.05)]">core</span>
            </div>
            {[
              { field: "id", type: "BIGINT", pk: true },
              { field: "user_id", type: "VARCHAR(255)", fk: true },
              { field: "amount", type: "DECIMAL(12,2)" },
              { field: "type", type: "ENUM(INCOME,EXPENSE)" },
              { field: "category", type: "VARCHAR(100)" },
              { field: "description", type: "TEXT NULL" },
              { field: "date", type: "DATE" },
              { field: "source", type: "ENUM(WEB,TELEGRAM)" },
            ].map((row) => (
              <div key={row.field} className="px-4 py-1.5 border-b border-white/10 flex justify-between items-center text-sm">
                <span className="font-mono text-[#e8ebe9]">{row.field}</span>
                <div className="flex items-center gap-2">
                  {row.pk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(240,184,78,0.15)] text-[#f0b84e] border border-[rgba(240,184,78,0.3)]">PK</span>}
                  {row.fk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(78,184,240,0.12)] text-[#4eb8f0] border border-[rgba(78,184,240,0.3)]">FK</span>}
                  <span className="font-mono text-[11px] text-[#4a5450]">{row.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* telegram_links table */}
          <div className="bg-[#161918] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#1e2220] flex items-center justify-between">
              <span className="text-sm font-mono text-[#a8f0bc] font-medium">telegram_links</span>
            </div>
            {[
              { field: "id", type: "INT", pk: true },
              { field: "user_id", type: "VARCHAR(255)", fk: true },
              { field: "pairing_code", type: "CHAR(6)" },
              { field: "is_active", type: "BOOLEAN" },
              { field: "expires_at", type: "DATETIME" },
            ].map((row) => (
              <div key={row.field} className="px-4 py-1.5 border-b border-white/10 flex justify-between items-center text-sm">
                <span className="font-mono text-[#e8ebe9]">{row.field}</span>
                <div className="flex items-center gap-2">
                  {row.pk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(240,184,78,0.15)] text-[#f0b84e] border border-[rgba(240,184,78,0.3)]">PK</span>}
                  {row.fk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(78,184,240,0.12)] text-[#4eb8f0] border border-[rgba(78,184,240,0.3)]">FK</span>}
                  <span className="font-mono text-[11px] text-[#4a5450]">{row.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* categories table */}
          <div className="bg-[#161918] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#1e2220] flex items-center justify-between">
              <span className="text-sm font-mono text-[#a8f0bc] font-medium">categories</span>
            </div>
            {[
              { field: "id", type: "INT", pk: true },
              { field: "user_id", type: "VARCHAR(255)", fk: true },
              { field: "name", type: "VARCHAR(100)" },
              { field: "color", type: "CHAR(7)" },
              { field: "icon", type: "VARCHAR(50) NULL" },
            ].map((row) => (
              <div key={row.field} className="px-4 py-1.5 border-b border-white/10 flex justify-between items-center text-sm">
                <span className="font-mono text-[#e8ebe9]">{row.field}</span>
                <div className="flex items-center gap-2">
                  {row.pk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(240,184,78,0.15)] text-[#f0b84e] border border-[rgba(240,184,78,0.3)]">PK</span>}
                  {row.fk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(78,184,240,0.12)] text-[#4eb8f0] border border-[rgba(78,184,240,0.3)]">FK</span>}
                  <span className="font-mono text-[11px] text-[#4a5450]">{row.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-[#161918] border border-white/10 rounded-lg px-4 py-3 font-mono text-[11px] text-[#4a5450] flex items-center gap-3">
          <span className="text-[#4ef07c]">//</span>
          Todas las queries deben filtrar por user_id — aislamiento multi-tenant garantizado. El campo source en transactions permite analítica de adopción (Web vs Telegram).
        </div>
      </section>

      {/* ROADMAP */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>02 — Plan de desarrollo</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em] mb-4">
          Road<span className="italic text-[#4ef07c]">map</span> · MVP a escala
        </h2>
        <p className="text-[#7a8480] max-w-[560px] leading-relaxed mb-12">
          Cuatro fases progresivas. La Fase 1 entrega valor real; las siguientes construyen sobre una base sólida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { phase: "1", title: "Fundamentos", weeks: "Semanas 1 – 3", tag: "Fase 1 · MVP", tagColor: "border-[rgba(78,184,240,0.4)] text-[#4eb8f0] bg-[rgba(78,184,240,0.07)]", tasks: ["Setup Next.js + Tailwind + Clerk", "Conexión Aurora MySQL + migraciones con Prisma", "CRUD de transacciones desde web", "Bot Telegram básico (registrar gasto)", "Flujo de linking Telegram ↔ Web", "Dashboard con tabla de movimientos"] },
            { phase: "2", title: "Inteligencia", weeks: "Semanas 4 – 6", tag: "Fase 2 · Análisis", tagColor: "border-[rgba(78,240,124,0.4)] text-[#4ef07c] bg-[rgba(78,240,124,0.07)]", tasks: ["Gráficos Recharts (torta + barras mensuales)", "Resúmenes mensuales por Telegram", "Categorías customizables por usuario", "Exportar CSV de movimientos", "Parser NLP mejorado para el bot", "Recordatorios configurables"] },
            { phase: "3", title: "Producto público", weeks: "Semanas 7 – 9", tag: "Fase 3 · SaaS", tagColor: "border-[rgba(240,184,78,0.4)] text-[#f0b84e] bg-[rgba(240,184,78,0.07)]", tasks: ["Landing page profesional con demo live", "Admin panel (métricas globales del SaaS)", "Onboarding de 3 pasos", "Deploy en AWS con dominio propio", "README y docs para open source", "CI/CD con GitHub Actions"] },
            { phase: "4", title: "Crecimiento", weeks: "Semanas 10+", tag: "Fase 4 · Escala", tagColor: "border-[rgba(240,122,78,0.4)] text-[#f07a4e] bg-[rgba(240,122,78,0.07)]", tasks: ["PWA instalable en móvil", "Presupuestos mensuales y alertas", "Multi-cuenta bancaria", "Importar extractos bancarios (CSV)"] },
          ].map((phase) => (
            <div key={phase.phase} className={`bg-[#161918] border border-white/10 rounded-xl p-5 relative overflow-hidden phase-${phase.phase}`} data-phase={phase.phase}>
              <div className="absolute top-[-10px] right-[-4px] font-serif text-[90px] font-semibold opacity-[0.04] text-[#e8ebe9] leading-none pointer-events-none select-none">
                {phase.phase}
              </div>
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border ${phase.tagColor}`}>
                {phase.tag}
              </span>
              <div className="text-sm font-medium text-[#e8ebe9] mt-3">{phase.title}</div>
              <div className="text-[10px] font-mono text-[#4a5450] mt-1">{phase.weeks}</div>
              <div className="mt-4 space-y-1.5">
                {phase.tasks.map((task) => (
                  <div key={task} className="text-sm text-[#7a8480] flex items-start gap-2">
                    <span className="text-[#4a5450] font-mono text-[11px] mt-0.5">—</span>
                    {task}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-b border-white/10">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>03 — Stack tecnológico</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em] mb-4">
          Las herramientas <span className="italic text-[#4ef07c]">correctas</span>
        </h2>
        <p className="text-[#7a8480] max-w-[560px] leading-relaxed mb-12">
          Cada tecnología fue elegida por su integración con el ecosistema Next.js y su capacidad para escalar sin reescrituras.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "N↗", name: "Next.js 14", role: "App Router · SSR · API Routes" },
            { icon: "TS", name: "TypeScript", role: "Lenguaje base · type safety total" },
            { icon: "Ck", name: "Clerk", role: "Auth · Google OAuth · roles" },
            { icon: "TW", name: "Tailwind CSS", role: "Estilos · design system" },
            { icon: "Tg", name: "Telegraf.js", role: "Bot Telegram · webhooks · NLP" },
            { icon: "Pr", name: "Prisma ORM", role: "Migraciones · queries typesafe" },
            { icon: "DB", name: "AWS Aurora", role: "MySQL · multi-tenant · escalable" },
            { icon: "RC", name: "Recharts", role: "Gráficos · torta · barras · trends" },
          ].map((tech) => (
            <div key={tech.name} className="bg-[#161918] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
              <div className="w-8.5 h-8.5 rounded-lg border border-white/10 flex items-center justify-center text-[11px] font-medium font-mono text-[#4a5450] mb-3">
                {tech.icon}
              </div>
              <div className="text-sm font-medium text-[#e8ebe9] mb-0.5">{tech.name}</div>
              <div className="text-[11px] text-[#4a5450] leading-relaxed">{tech.role}</div>
            </div>
          ))}
        </div>

        {/* Highlight Box */}
        <div className="mt-12 bg-[rgba(78,240,124,0.05)] border border-[rgba(78,240,124,0.15)] rounded-xl p-5">
          <div className="font-mono text-[10px] text-[#4ef07c] tracking-widest uppercase mb-3">Decisiones clave de arquitectura</div>
          <div className="space-y-1.5">
            {[
              "Prisma ORM sobre queries crudas — migraciones como un comando, schema como documentación viva",
              "Campo source en transactions — analítica de adopción Web vs Telegram para el Admin Panel",
              "Categorías por usuario — cada persona puede tener \"Asado\", \"SUBE\" o cualquier cosa sin colisiones",
              "Clerk sobre NextAuth — menor configuración, roles built-in, webhooks para sincronizar con la DB propia",
              "Open Source + SaaS hosted — cualquiera puede auto-hostear; vos ofrecés la versión cloud lista para usar",
            ].map((item) => (
              <div key={item} className="text-sm text-[#7a8480] flex items-start gap-2">
                <span className="text-[#4ef07c] font-mono text-[11px] mt-0.5">↳</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTRIBUTE */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="font-mono text-[10px] text-[#4a5450] tracking-[0.12em] uppercase mb-8 flex items-center gap-3">
          <span>04 — Cómo contribuir</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light leading-[1.15] tracking-[-0.01em] mb-4">
          Uníte a la <span className="italic text-[#4ef07c]">comunidad</span>
        </h2>
        <p className="text-[#7a8480] max-w-[560px] leading-relaxed mb-12">
          FlowFinance es open source bajo licencia MIT. Contribuí mejorando el código, reportando bugs o sugiriendo nuevas features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Fork & Clone", desc: "Hacé fork del repo y clonalo localmente. Seguí las instrucciones de setup en el README." },
            { title: "Creá tu feature", desc: "Creal una branch, implemental tus cambios y asegurate de que los tests pasen." },
            { title: "Pull Request", desc: "Envial tu PR con una descripción clara. Nuestro CI/CD correrá automáticamente." },
          ].map((step, idx) => (
            <div key={idx} className="bg-[#161918] border border-white/10 rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-[rgba(78,240,124,0.1)] border border-[rgba(78,240,124,0.3)] flex items-center justify-center text-[#4ef07c] text-sm font-mono mb-3">
                {idx + 1}
              </div>
              <div className="text-sm font-medium text-[#e8ebe9] mb-1.5">{step.title}</div>
              <div className="text-[#7a8480] text-sm leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[#4ef07c] text-[#0d0f0e] font-medium rounded-lg hover:bg-[#a8f0bc] transition-colors"
          >
            Ver Repositorio en GitHub
          </a>
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
