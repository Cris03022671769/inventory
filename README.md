# Control Diario de Caja + Inventario

Sistema web para control diario de caja e inventario con Next.js, Prisma y Neon PostgreSQL.

**Características:**
- ✓ Tabla editable de productos (cantidad inicial, movimientos, final, vendidos)
- ✓ Registro de gastos
- ✓ Entrada de denominaciones de billetes en caja
- ✓ Cálculos en vivo de diferencias (sobra/falta)
- ✓ Validaciones completas antes de guardar
- ✓ Almacenamiento en Neon PostgreSQL
- ✓ Interfaz responsiva con CSS personalizado

---

## 🚀 Desplegar en Vercel

### 1. **Preparar base de datos en Neon**

Ejecuta este script **una sola vez** en Neon SQL Editor:

1. Abre https://console.neon.tech
2. Ve a tu proyecto → **SQL Editor**
3. Copia y ejecuta el contenido de [`neon-schema.sql`](neon-schema.sql)

### 2. **Desplegar en Vercel**

```bash
# Git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

Luego en Vercel:
1. Conecta tu repositorio GitHub
2. En **Environment Variables**, agrega:
   - `DATABASE_URL`: Tu URL de Neon (pooler)
   - `DATABASE_URL_UNPOOLED`: Tu URL de Neon (sin pooler)
3. Deploy

---

## 📦 Desarrollo local

### Requisitos
- Node.js 18+
- npm/yarn

### Setup
```bash
npm install
npx prisma generate
npm run dev
```

Abre http://localhost:3000

---

## 📝 Scripts disponibles

```bash
npm run dev              # Dev server en http://localhost:3000
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Linting
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Crear migraciones
```

---

## 🔌 Variables de entorno

Copia `.env.example` a `.env` y completa:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require&channel_binding=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:5432/database?sslmode=require&channel_binding=require"
```

---

##  Estructura del proyecto

```
.
├── app/
│   ├── api/day/route.ts       # API para guardar cierres
│   ├── layout.tsx             # Layout raíz
│   ├── page.tsx               # Página root
│   ├── daily-control/page.tsx # Ruta del control
│   └── globals.css            # Estilos globales
├── components/
│   └── day-control.tsx        # Componente principal
├── lib/
│   └── prisma.ts              # Cliente Prisma singleton
├── prisma/
│   └── schema.prisma          # Esquema de datos
└── neon-schema.sql            # Script de inicialización
```

---

## 🛠️ Stack

- **Frontend:** React 19 + Next.js 15
- **Backend:** Next.js API Routes
- **ORM:** Prisma 6
- **Base de Datos:** Neon PostgreSQL
- **Hosting:** Vercel
- **Estilos:** CSS vanilla + Grid/Flexbox

---

## ⚠️ Notas importantes

1. **Base de datos:** Ejecuta `neon-schema.sql` solo una vez, antes del primer deploy
2. **Migraciones:** Las tablas se crean via Script SQL, no via `prisma migrate`
3. **Producción:** Vercel ejecuta `npm run build` automáticamente
4. **Variables de entorno:** Agrega `DATABASE_URL` y `DATABASE_URL_UNPOOLED` en Vercel Settings

---

## 📄 Licencia

MIT
