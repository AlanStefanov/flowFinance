# FlowFinance

Plataforma personal de finanzas que combina un bot de Telegram para
carga rápida con un dashboard web para análisis profundo.

## ✨ Características

- **Bot de Telegram** — Registrá gastos e ingresos en lenguaje natural
- **Dashboard Web** — Gráficos, tablas, presupuestos y analítica
- **Multi-moneda** — ARS, USD, EUR, BRL y más
- **Presupuestos** — Límites mensuales por categoría con barra de progreso
- **Analytics** — Tracking de páginas y métricas de uso
- **Multi-tenant** — Aislamiento total entre usuarios
- **SaaS Gratuito** — Sin planes de pago, siempre libre

## 🏗️ Stack

Next.js 16 · TypeScript · Clerk · Tailwind CSS · Prisma · MySQL · Telegraf.js · Recharts · Docker

## 🚀 Quick Start

### Docker Compose (Recomendado)

```bash
cp .env.example .env
# Editar .env con tus credenciales (Clerk, Telegram)
docker compose up -d
```

Visitá `http://localhost:3000`

### Desarrollo Manual

```bash
npm install
# Levantar MySQL: docker compose up -d mysql
npx prisma migrate dev
npm run dev          # Terminal 1: Web
cd bot && npm run dev  # Terminal 2: Telegram bot
```

## 📁 Estructura

```
src/
├── app/
│   ├── api/           # API Routes (transactions, budgets, categories, analytics, telegram)
│   ├── admin/         # Panel admin con analytics
│   ├── dashboard/     # Dashboard + Presupuestos + Categorías + Telegram
│   ├── onboarding/    # Flujo de 3 pasos
│   └── open-source/   # Página comunidad
├── components/        # Footer, CookieConsent, Charts, PageTracker
└── lib/               # Prisma client, analytics
bot/                   # Telegram bot (Telegraf.js)
prisma/                # Schema + migraciones
deploy/                # Scripts deploy
  ├── aws/cloudformation/   # Infraestructura AWS
  └── linux/                # Setup + deploy Linux
```

## 🤖 Comandos del Bot

- `Gaste 4500 en el super` → Registrar gasto
- `Cobré 50000 sueldo` → Registrar ingreso
- `Mis gastos este mes` → Resumen mensual
- `Balance` → Resumen del período
- `/ultimos [N]` → Últimos movimientos
- `/eliminar #ID` → Eliminar movimiento
- `/help` → Todos los comandos

## 🌐 Deploy

### AWS (CloudFormation)

```bash
# Ver deploy/aws/cloudformation/template.yaml
# Crea: VPC, RDS MySQL, ECS Fargate (Web + Bot), ALB
```

### Linux (Docker)

```bash
bash deploy/linux/setup.sh    # Instala Docker + firewall
cp .env.example .env          # Configurar variables
bash deploy/linux/deploy.sh   # Build + start
```

## 🧪 Tests

```bash
npm test              # Vitest (API + Prisma)
node --import tsx --test __tests__/parser.test.ts  # NLP parser
```

## 📋 Roadmap

### ✅ Completado
- CRUD transacciones (Web + Telegram)
- Dashboard con gráficos (Recharts)
- Categorías customizables
- Parser NLP argentino
- Onboarding 3 pasos
- Admin panel + analytics
- Multi-moneda
- Presupuestos mensuales
- Cookies consent
- Footer con firma
- Deploy scripts (AWS + Linux)
- CI/CD GitHub Actions
- Pruebas automatizadas

### 🔄 En progreso
- Notificaciones de gastos
- PWA instalable
- Importar extractos bancarios

## 📄 Licencia

MIT — [Alan Emanuel Stefanov](https://github.com/anomalyco)

---

⭐ Si te gusta el proyecto, dale una estrella en GitHub.
