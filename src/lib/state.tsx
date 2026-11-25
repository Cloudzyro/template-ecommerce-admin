// The editable state of the back office: products (edited on the product
// page) and orders (marked fulfilled on the order page). It starts from the
// sample data in src/data/store.ts and keeps changes in this browser's
// localStorage, so a refresh doesn't lose them. Swap these setters for calls
// to your own API when you connect a real store.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { customers, lowStockAt, orders as seedOrders, products as seedProducts, store, type Order, type Product } from "../data/store";

const KEY = "kilnhouse-admin-v1";

type Saved = { products: Product[]; orders: Order[] };

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.orders)) return parsed;
    }
  } catch {
    // Private mode or blocked storage: fall back to the sample data.
  }
  return { products: seedProducts, orders: seedOrders };
}

type Ctx = {
  products: Product[];
  orders: Order[];
  saveProduct: (p: Product) => void;
  fulfillOrder: (id: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Saved>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Not saved; the change still applies until the page is closed.
    }
  }, [state]);

  const saveProduct = useCallback((p: Product) => {
    setState((s) => ({ ...s, products: s.products.map((x) => (x.id === p.id ? p : x)) }));
  }, []);

  const fulfillOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id && o.fulfillment === "unfulfilled"
          ? {
              ...o,
              fulfillment: "fulfilled",
              events: [...o.events, { at: `${store.today}T15:00:00.000Z`, text: `Marked as fulfilled by ${store.staff.name}` }],
            }
          : o,
      ),
    }));
  }, []);

  const reset = useCallback(() => setState({ products: seedProducts, orders: seedOrders }), []);

  const value = useMemo(() => ({ ...state, saveProduct, fulfillOrder, reset }), [state, saveProduct, fulfillOrder, reset]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function orderTotals(o: Order) {
  const subtotal = o.items.reduce((s, l) => s + l.qty * l.price, 0);
  const tax = Math.round(subtotal * o.taxRate * 100) / 100;
  return { subtotal, tax, shipping: o.shipping, total: subtotal + o.shipping + tax, units: o.items.reduce((s, l) => s + l.qty, 0) };
}

export const customerById = (id: string) => customers.find((c) => c.id === id);

export function customerStats(id: string, orders: Order[]) {
  const mine = orders.filter((o) => o.customerId === id);
  const spent = mine.filter((o) => o.payment === "paid").reduce((s, o) => s + orderTotals(o).total, 0);
  return { orders: mine, count: mine.length, spent, last: mine[0]?.placedAt };
}

export const totalStock = (p: { variants: { stock: number }[] }) => p.variants.reduce((s, v) => s + v.stock, 0);
export type StockState = "in" | "low" | "out";
export const stockState = (n: number): StockState => (n === 0 ? "out" : n <= lowStockAt ? "low" : "in");
