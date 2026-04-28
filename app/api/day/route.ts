import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DayPayload = {
  date?: string;
  products?: Array<{
    id?: string;
    productId?: number;
    name: string;
    price: number;
    initialQty: number;
    movementQty: number;
    finalQty: number;
    soldQty: number;
    amount: number;
  }>;
  expenses?: Array<{
    id?: string;
    concept: string;
    amount: number;
  }>;
  cash?: Array<{
    bill: number;
    quantity: number;
    amount: number;
  }>;
  totals?: {
    totalSales: number;
    totalExpenses: number;
    expectedCash: number;
    totalCash: number;
    difference: number;
  };
};

const isFiniteNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DayPayload;

    if (!payload.date) {
      return NextResponse.json({ error: "La fecha es obligatoria." }, { status: 400 });
    }

    if (!Array.isArray(payload.products) || !Array.isArray(payload.expenses) || !Array.isArray(payload.cash)) {
      return NextResponse.json({ error: "Faltan productos, gastos o caja." }, { status: 400 });
    }

    const totals = payload.totals;
    if (!totals || !isFiniteNumber(totals.totalSales) || !isFiniteNumber(totals.totalExpenses) || !isFiniteNumber(totals.expectedCash) || !isFiniteNumber(totals.totalCash) || !isFiniteNumber(totals.difference)) {
      return NextResponse.json({ error: "Los totales no son válidos." }, { status: 400 });
    }

    const dayDate = new Date(payload.date);
    if (Number.isNaN(dayDate.getTime())) {
      return NextResponse.json({ error: "La fecha enviada no es válida." }, { status: 400 });
    }

    const existingDay = await prisma.day.findUnique({
      where: { date: dayDate },
      select: { id: true },
    });

    if (existingDay) {
      return NextResponse.json({ error: "Ya existe un cierre para esa fecha." }, { status: 409 });
    }

    for (const [index, product] of payload.products.entries()) {
      if (!product.name?.trim()) {
        return NextResponse.json({ error: `El producto ${index + 1} no tiene nombre.` }, { status: 400 });
      }
      const available = product.initialQty + product.movementQty;
      if (product.initialQty < 0 || product.movementQty < 0 || product.finalQty < 0 || product.price < 0) {
        return NextResponse.json({ error: `El producto ${index + 1} tiene valores negativos.` }, { status: 400 });
      }
      if (product.finalQty > available) {
        return NextResponse.json({ error: `El producto ${index + 1} no cumple final <= inicial + movimiento.` }, { status: 400 });
      }
    }

    for (const [index, expense] of payload.expenses.entries()) {
      if (!expense.concept?.trim()) {
        return NextResponse.json({ error: `El gasto ${index + 1} no tiene concepto.` }, { status: 400 });
      }
      if (expense.amount < 0) {
        return NextResponse.json({ error: `El gasto ${index + 1} no puede ser negativo.` }, { status: 400 });
      }
    }

    for (const cashEntry of payload.cash) {
      if (cashEntry.bill <= 0 || cashEntry.quantity < 0) {
        return NextResponse.json({ error: "La caja tiene valores inválidos." }, { status: 400 });
      }
    }

    const day = await prisma.day.create({
      data: {
        date: dayDate,
        totalSales: totals.totalSales,
        totalExpenses: totals.totalExpenses,
        expectedCash: totals.expectedCash,
        totalCash: totals.totalCash,
        difference: totals.difference,
        items: {
          create: payload.products.map((product) => ({
            productName: product.name.trim(),
            unitPrice: product.price,
            initialQty: product.initialQty,
            movementQty: product.movementQty,
            finalQty: product.finalQty,
            soldQty: product.soldQty,
            amount: product.amount,
          })),
        },
        cashEntries: {
          create: payload.cash.map((entry) => ({
            bill: entry.bill,
            quantity: entry.quantity,
            amount: entry.amount,
          })),
        },
        expenses: {
          create: payload.expenses.map((expense) => ({
            concept: expense.concept.trim(),
            amount: expense.amount,
          })),
        },
      },
      include: {
        items: true,
        cashEntries: true,
        expenses: true,
      },
    });

    return NextResponse.json(day, { status: 201 });
  } catch (error) {
    console.error("[API /day POST]", error);
    
    const message = error instanceof Error ? error.message : "Error desconocido";
    
    // Detectar error de conexión a Neon
    if (message.includes("P1001") || message.includes("Can't reach database")) {
      return NextResponse.json(
        { error: "Base de datos no disponible. Verifica que Neon esté activo y accesible." },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const days = await prisma.day.findMany({
      include: {
        items: true,
        cashEntries: true,
        expenses: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error("[API /day GET]", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    
    if (message.includes("P1001") || message.includes("Can't reach database")) {
      return NextResponse.json(
        { error: "Base de datos no disponible." },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
