# FlowFinance

Plataforma personal de finanzas que combina un bot de Telegram para
carga rápida con un dashboard web para análisis profundo.
Multi-tenant, open source y deployado en AWS.

## ✨ Características

- **Bot de Telegram** - Registrá gastos e ingresos en lenguaje natural
- **Dashboard Web** - Gráficos, tablas y analítica completa
- **Multi-tenant** - Aislamiento total entre usuarios (AWS Aurora MySQL)
- **Open Source** - MIT License, contribuciones bienvenidas
- **SaaS Gratuito** - Versión cloud lista para usar

## 🏗️ Stack Tecnológico

- **Frontend/Backend:** Next.js 14 (App Router, SSR, API Routes)
- **Lenguaje:** TypeScript
- **Autenticación:** Clerk (Google OAuth, JWT, Roles)
- **Estilos:** Tailwind CSS
- **ORM:** Prisma (Migraciones, queries typesafe)
- **Base de Datos:** AWS Aurora MySQL
- **Bot:** Telegraf.js (Webhooks, NLP)
- **Gráficos:** Recharts

## 🚀 Quick Start

### Prerrequisitos

- Docker y Docker Compose instalados
- Cuenta en Clerk (para auth)
- Token de Telegram Bot (para el bot)

### 🚀 Método Rápido: Docker Compose (Recomendado)

**1. Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/flowfinance.git
cd flowfinance
```

**2. Configurar variables de entorno:**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` desde https://clerk.com
- `TELEGRAM_BOT_TOKEN` desde @BotFather en Telegram

**3. Ejecutar el script de instalación:**

```bash
chmod +x install.sh
./install.sh
```

Este script:
- Verifica que Docker esté instalado
- Limpia contenedores anteriores (opcional)
- Builda y levanta todos los servicios (MySQL + Web + Bot)
- Configura la base de datos automáticamente

**4. ¡Listo! Visitá:**

```
http://localhost:3000
```

### 🔧 Método Manual (Desarrollo)

Si preferís correr sin Docker:

**1. Clonar e instalar:**

```bash
git clone https://github.com/tu-usuario/flowfinance.git
cd flowfinance
npm install
```

**2. Levantar MySQL:**

```bash
docker run -d \
  --name flowfinance-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=flowfinance_dev_password \
  -e MYSQL_DATABASE=flowfinance \
  -v flowfinance-mysql-data:/var/lib/mysql \
  mysql:8.0
```

**3. Configurar `.env`** (copiá desde `.env.example` y completá)

**4. Migraciones y build:**

```bash
npx prisma generate
npx prisma db push
```

**5. Ejecutar en desarrollo:**

```bash
# Terminal 1: Web app
npm run dev

# Terminal 2: Telegram bot
cd bot && npx ts-node index.ts
```

¡Visitá `http://localhost:3000`!

## 📊 Estructura del Proyecto

```
flowfinance/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── categories/      # Gestión categorías
│   │   │   ├── export/          # Exportar CSV
│   │   │   ├── telegram/        # Vinculación
│   │   │   └── transactions/   # CRUD transacciones
│   │   ├── admin/              # Panel admin
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── onboarding/         # Flujo 3 pasos
│   │   └── open-source/        # Página comunidad
│   ├── components/            # Componentes Recharts
│   └── lib/                  # Utilidades
├── bot/                      # Bot Telegram
├── prisma/                   # Schema y migraciones
├── .github/workflows/         # CI/CD
├── docker-compose.yml          # Levanta todo
├── install.sh                 # Script instalación
└── README.md
```

## 🤖 Comandos del Bot

```
Gaste 4500 en el super     → Registra un gasto
Cobré 50000                   → Registra un ingreso
¿Cuánto gasté este mes?    → Resumen mensual
¿Cuánto me queda?          → Balance del período
/start XXXXXX                 → Vincula Telegram
```

## 🌐 Deploy

### Vercel (Recomendado para Next.js)

1. Conectá tu repositorio a Vercel
2. Configurá las variables de entorno en el dashboard
3. Deploy automático en cada push

### Docker + EC2 (Self-hosted)

```bash
# Build image
docker build -t flowfinance .

# Run with env file
docker run -p 3000:3000 \
  --env-file .env \
  flowfinance
```

## 🤝 Cómo Contribuir

1. Fork el repositorio
2. Creá una branch (`git checkout -b feature/nueva-feature`)
3. Commiteá tus cambios (`git commit -am 'Add some feature'`)
4. Pusheá a la branch (`git push origin feature/nueva-feature`)
5. Abrí un Pull Request

### Guidelines

- Seguí los estándares de código existentes
- Asegurate de que TypeScript no tire errores (`npm run build`)
- Actualizá la documentación si es necesario

## 📋 Roadmap

### Fase 1: MVP ✅
- [x] Setup Next.js + Tailwind + Clerk
- [x] Conexión MySQL + Prisma
- [x] CRUD transacciones web
- [x] Bot Telegram básico
- [x] Flujo de linking Telegram ↔ Web
- [x] Dashboard con tabla

### Fase 2: Inteligencia ✅
- [x] Gráficos Recharts
- [x] Resúmenes mensuales Telegram
- [x] Categorías customizables
- [x] Exportar CSV
- [x] Parser NLP mejorado

### Fase 3: SaaS (En progreso)
- [x] Landing page profesional
- [x] Admin panel
- [x] Onboarding 3 pasos
- [ ] Deploy AWS con dominio
- [ ] Docs completas
- [ ] CI/CD GitHub Actions

### Fase 4: Escala
- [ ] PWA instalable
- [ ] Presupuestos mensuales
- [ ] Multi-cuenta bancaria
- [ ] Importar extractos bancarios

## 📄 Licencia

MIT License - Mirá el archivo [LICENSE](LICENSE) para más detalles.

## 🙌 Autor

Desarrollado por **Alan Emanuel Stefanov**

Impulsando la transparencia financiera a través del código abierto.

---

⭐ Si te gusta el proyecto, dale una estrella en GitHub!
