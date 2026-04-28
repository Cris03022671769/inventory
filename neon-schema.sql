-- Script SQL para crear la estructura de base de datos en Neon
-- Ejecuta este script en la consola de SQL de Neon

-- Tabla Product
CREATE TABLE IF NOT EXISTS "Product" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Day
CREATE TABLE IF NOT EXISTS "Day" (
  "id" SERIAL PRIMARY KEY,
  "date" TIMESTAMP(3) NOT NULL UNIQUE,
  "totalSales" DOUBLE PRECISION NOT NULL,
  "totalExpenses" DOUBLE PRECISION NOT NULL,
  "expectedCash" DOUBLE PRECISION NOT NULL,
  "totalCash" DOUBLE PRECISION NOT NULL,
  "difference" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla DayItem
CREATE TABLE IF NOT EXISTS "DayItem" (
  "id" SERIAL PRIMARY KEY,
  "dayId" INTEGER NOT NULL,
  "productId" INTEGER,
  "productName" TEXT NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "initialQty" INTEGER NOT NULL,
  "movementQty" INTEGER NOT NULL DEFAULT 0,
  "finalQty" INTEGER NOT NULL,
  "soldQty" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DayItem_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE,
  CONSTRAINT "DayItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Tabla CashEntry
CREATE TABLE IF NOT EXISTS "CashEntry" (
  "id" SERIAL PRIMARY KEY,
  "dayId" INTEGER NOT NULL,
  "bill" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashEntry_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE
);

-- Tabla Expense
CREATE TABLE IF NOT EXISTS "Expense" (
  "id" SERIAL PRIMARY KEY,
  "dayId" INTEGER NOT NULL,
  "concept" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Expense_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS "DayItem_dayId_idx" ON "DayItem"("dayId");
CREATE INDEX IF NOT EXISTS "CashEntry_dayId_idx" ON "CashEntry"("dayId");
CREATE INDEX IF NOT EXISTS "Expense_dayId_idx" ON "Expense"("dayId");

-- Confirmación
SELECT 'Base de datos creada correctamente' AS status;
