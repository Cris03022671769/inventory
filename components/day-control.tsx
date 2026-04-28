"use client";

import { useMemo, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  price: string;
  initialQty: string;
  movementQty: string;
  finalQty: string;
};

type ExpenseRow = {
  id: string;
  concept: string;
  amount: string;
};

type CashRow = {
  bill: number;
  quantity: string;
};

const BILL_DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createProduct = (): ProductRow => ({
  id: createId(),
  name: "",
  price: "",
  initialQty: "",
  movementQty: "0",
  finalQty: "",
});

const createExpense = (): ExpenseRow => ({
  id: createId(),
  concept: "",
  amount: "",
});

const createCash = (): CashRow[] => BILL_DENOMINATIONS.map((bill) => ({ bill, quantity: "0" }));

function parsePositiveInt(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMoney(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function DayControl() {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const [products, setProducts] = useState<ProductRow[]>([createProduct(), createProduct()]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([createExpense()]);
  const [cash, setCash] = useState<CashRow[]>(createCash());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const computed = useMemo(() => {
    const errors: string[] = [];

    const productDetails = products.map((product, index) => {
      const price = parseMoney(product.price);
      const initialQty = parsePositiveInt(product.initialQty);
      const movementQty = parsePositiveInt(product.movementQty) ?? 0;
      const finalQty = parsePositiveInt(product.finalQty);
      const name = product.name.trim();

      if (!name) errors.push(`Producto ${index + 1}: el nombre es obligatorio.`);
      if (price === null) errors.push(`Producto ${index + 1}: el precio es obligatorio.`);
      if (initialQty === null) errors.push(`Producto ${index + 1}: la cantidad inicial es obligatoria.`);
      if (finalQty === null) errors.push(`Producto ${index + 1}: la cantidad final es obligatoria.`);
      if ((price ?? 0) < 0) errors.push(`Producto ${index + 1}: el precio no puede ser negativo.`);
      if ((initialQty ?? 0) < 0) errors.push(`Producto ${index + 1}: la cantidad inicial no puede ser negativa.`);
      if (movementQty < 0) errors.push(`Producto ${index + 1}: el movimiento no puede ser negativo.`);
      if ((finalQty ?? 0) < 0) errors.push(`Producto ${index + 1}: la cantidad final no puede ser negativa.`);

      const available = (initialQty ?? 0) + movementQty;
      const soldQty = available - (finalQty ?? 0);

      if (finalQty !== null && finalQty > available) {
        errors.push(`Producto ${index + 1}: el final no puede ser mayor que inicial + movimiento.`);
      }
      if (soldQty < 0) {
        errors.push(`Producto ${index + 1}: la venta calculada no puede ser negativa.`);
      }

      const amount = soldQty * (price ?? 0);

      return {
        id: product.id,
        name,
        price: price ?? 0,
        initialQty: initialQty ?? 0,
        movementQty,
        finalQty: finalQty ?? 0,
        soldQty,
        amount,
      };
    });

    const expenseDetails = expenses.map((expense, index) => {
      const concept = expense.concept.trim();
      const amount = parseMoney(expense.amount);

      if (!concept) errors.push(`Gasto ${index + 1}: el concepto es obligatorio.`);
      if (amount === null) errors.push(`Gasto ${index + 1}: el monto es obligatorio.`);
      if ((amount ?? 0) < 0) errors.push(`Gasto ${index + 1}: el monto no puede ser negativo.`);

      return {
        id: expense.id,
        concept,
        amount: amount ?? 0,
      };
    });

    const cashDetails = cash.map((entry) => {
      const quantity = parsePositiveInt(entry.quantity);
      if (quantity === null) errors.push(`Caja ${entry.bill}: la cantidad es obligatoria.`);
      if ((quantity ?? 0) < 0) errors.push(`Caja ${entry.bill}: la cantidad no puede ser negativa.`);
      return {
        bill: entry.bill,
        quantity: quantity ?? 0,
        amount: entry.bill * (quantity ?? 0),
      };
    });

    const totalSales = productDetails.reduce((sum, row) => sum + row.amount, 0);
    const totalExpenses = expenseDetails.reduce((sum, row) => sum + row.amount, 0);
    const expectedCash = totalSales - totalExpenses;
    const totalCash = cashDetails.reduce((sum, row) => sum + row.amount, 0);
    const difference = totalCash - expectedCash;

    return {
      errors,
      productDetails,
      expenseDetails,
      cashDetails,
      totalSales,
      totalExpenses,
      expectedCash,
      totalCash,
      difference,
    };
  }, [products, expenses, cash]);

  const canClose = computed.errors.length === 0;

  const updateProduct = (id: string, field: keyof ProductRow, value: string) => {
    setProducts((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateExpense = (id: string, field: keyof ExpenseRow, value: string) => {
    setExpenses((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateCash = (bill: number, value: string) => {
    setCash((current) => current.map((row) => (row.bill === bill ? { ...row, quantity: value } : row)));
  };

  const addProduct = () => setProducts((current) => [...current, createProduct()]);
  const addExpense = () => setExpenses((current) => [...current, createExpense()]);
  const removeProduct = (id: string) => setProducts((current) => current.length > 1 ? current.filter((row) => row.id !== id) : current);
  const removeExpense = (id: string) => setExpenses((current) => current.length > 1 ? current.filter((row) => row.id !== id) : current);

  const handleCloseDay = async () => {
    if (!canClose || isSaving) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      date,
      products: computed.productDetails,
      expenses: computed.expenseDetails,
      cash: computed.cashDetails,
      totals: {
        totalSales: computed.totalSales,
        totalExpenses: computed.totalExpenses,
        expectedCash: computed.expectedCash,
        totalCash: computed.totalCash,
        difference: computed.difference,
      },
    };

    try {
      const response = await fetch("/api/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatusMessage(`❌ ${data?.error ?? "No se pudo guardar el cierre del día."}`);
        setIsSaving(false);
        return;
      }

      setStatusMessage("✓ Día guardado correctamente en Neon.");
      setIsSaving(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de conexión al servidor";
      setStatusMessage(`❌ Error: ${message}. Verifica que el servidor esté en funcionamiento.`);
      setIsSaving(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Control diario</p>
          <h1>Cierre de caja + inventario</h1>
          <p className="lead">
            Captura productos, movimientos, caja y gastos. El sistema valida todo en tiempo real y guarda el cierre final en la base de datos.
          </p>
        </div>
        <div className="hero-card">
          <span>Fecha</span>
          <strong>{date}</strong>
          <small>{computed.difference > 0 ? "Sobra dinero" : computed.difference < 0 ? "Falta dinero" : "Cuadre exacto"}</small>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Productos</h2>
          <button type="button" className="ghost" onClick={addProduct}>+ Agregar producto</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Inicial</th>
                <th>Mov</th>
                <th>Final</th>
                <th>Vendidos</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const row = computed.productDetails.find((item) => item.id === product.id);
                return (
                  <tr key={product.id}>
                    <td><input value={product.name} onChange={(event) => updateProduct(product.id, "name", event.target.value)} placeholder="Nombre" /></td>
                    <td><input value={product.price} onChange={(event) => updateProduct(product.id, "price", event.target.value)} inputMode="decimal" placeholder="0.00" /></td>
                    <td><input value={product.initialQty} onChange={(event) => updateProduct(product.id, "initialQty", event.target.value)} inputMode="numeric" placeholder="0" /></td>
                    <td><input value={product.movementQty} onChange={(event) => updateProduct(product.id, "movementQty", event.target.value)} inputMode="numeric" placeholder="0" /></td>
                    <td><input value={product.finalQty} onChange={(event) => updateProduct(product.id, "finalQty", event.target.value)} inputMode="numeric" placeholder="0" /></td>
                    <td className="number">{row?.soldQty ?? 0}</td>
                    <td className="number">${(row?.amount ?? 0).toFixed(2)}</td>
                    <td><button type="button" className="danger-link" onClick={() => removeProduct(product.id)}>Eliminar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h2>Gastos</h2>
            <button type="button" className="ghost" onClick={addExpense}>+ Agregar gasto</button>
          </div>
          <div className="stack">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-row">
                <input value={expense.concept} onChange={(event) => updateExpense(expense.id, "concept", event.target.value)} placeholder="Concepto" />
                <input value={expense.amount} onChange={(event) => updateExpense(expense.id, "amount", event.target.value)} inputMode="decimal" placeholder="Monto" />
                <button type="button" className="danger-link" onClick={() => removeExpense(expense.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Caja</h2>
            <span className="subtle">Billetes por denominación</span>
          </div>
          <div className="cash-grid">
            {cash.map((entry) => (
              <div key={entry.bill} className="cash-row">
                <label>${entry.bill}</label>
                <input value={entry.quantity} onChange={(event) => updateCash(entry.bill, event.target.value)} inputMode="numeric" placeholder="0" />
                <span>${(entry.bill * Number(entry.quantity || 0)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel result-panel">
        <div className="panel-header">
          <h2>Resultado del día</h2>
          <span className={`badge ${computed.difference > 0 ? "positive" : computed.difference < 0 ? "negative" : "neutral"}`}>
            {computed.difference > 0 ? "Sobra" : computed.difference < 0 ? "Falta" : "Cuadra"}
          </span>
        </div>

        <div className="metrics">
          <div><span>Total ventas</span><strong>${computed.totalSales.toFixed(2)}</strong></div>
          <div><span>Gastos</span><strong>${computed.totalExpenses.toFixed(2)}</strong></div>
          <div><span>Esperado</span><strong>${computed.expectedCash.toFixed(2)}</strong></div>
          <div><span>Caja</span><strong>${computed.totalCash.toFixed(2)}</strong></div>
          <div><span>Diferencia</span><strong className={computed.difference > 0 ? "positive-text" : computed.difference < 0 ? "negative-text" : ""}>${computed.difference.toFixed(2)}</strong></div>
        </div>

        <div className="validation">
          {computed.errors.length > 0 ? computed.errors.map((error) => <p key={error}>• {error}</p>) : <p>Todo listo para cerrar el día.</p>}
        </div>

        <div className="footer-actions">
          <button type="button" className="primary" onClick={handleCloseDay} disabled={!canClose || isSaving}>
            {isSaving ? "Guardando..." : "Cerrar día"}
          </button>
          {statusMessage ? <p className="status">{statusMessage}</p> : null}
        </div>
      </section>
    </main>
  );
}
