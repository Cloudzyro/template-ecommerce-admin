import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { GlazeDot, Pot } from "../components/Pot";
import { Card, PageHeader, ProductStatusText, SortHeader, input, type SortDir } from "../components/ui";
import { glazes, lowStockAt, type Product } from "../data/store";
import { cx, fmtMoney } from "../lib/format";
import { stockState, totalStock, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";

const stockFilters = [
  { id: "all", label: "All" },
  { id: "in", label: "In stock" },
  { id: "low", label: "Low" },
  { id: "out", label: "Out" },
] as const;
type StockFilter = (typeof stockFilters)[number]["id"];

// A product's stock state follows its emptiest variant.
const productState = (p: Product) => stockState(Math.min(...p.variants.map((v) => v.stock)));

function StockCell({ p }: { p: Product }) {
  const total = totalStock(p);
  const outCount = p.variants.filter((v) => v.stock === 0).length;
  const lowCount = p.variants.filter((v) => v.stock > 0 && v.stock <= lowStockAt).length;
  const note = total === 0 ? "Out of stock" : outCount ? `${outCount} glaze out` : lowCount ? `${lowCount} glaze low` : "";
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap">
      <span className={cx("num w-6", total === 0 ? "text-muted" : "text-fg")}>{total}</span>
      {note && <span className={cx("text-xs", outCount ? "text-down" : "text-warn")}>{note}</span>}
    </span>
  );
}

export function Products() {
  useTitle("Products");
  const { products } = useStore();
  const [filter, setFilter] = useState<StockFilter>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: "title" | "stock" | "price"; dir: SortDir }>({ key: "title", dir: "asc" });

  const counts = useMemo(() => {
    const c: Record<StockFilter, number> = { all: products.length, in: 0, low: 0, out: 0 };
    for (const p of products) c[productState(p)]++;
    return c;
  }, [products]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = products.filter(
      (p) => (filter === "all" || productState(p) === filter) && (!term || p.title.toLowerCase().includes(term) || p.variants.some((v) => v.sku.toLowerCase().includes(term))),
    );
    const val = (p: Product) => (sort.key === "title" ? p.title : sort.key === "stock" ? totalStock(p) : p.price);
    return list.sort((a, b) => {
      const A = val(a);
      const B = val(b);
      const d = typeof A === "string" ? A.localeCompare(B as string) : A - (B as number);
      return sort.dir === "asc" ? d : -d;
    });
  }, [products, filter, q, sort]);

  const by = (key: "title" | "stock" | "price") => () => setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <div className="enter">
      <PageHeader title="Products" sub={`${products.length} products, ${products.reduce((s, p) => s + p.variants.length, 0)} glaze variants`} />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="radiogroup" aria-label="Stock" className="inline-flex w-fit rounded-lg bg-raised p-1">
            {stockFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cx(
                  "flex h-7 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-150",
                  filter === f.id ? "bg-panel text-fg shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_0_0_1px_var(--line)]" : "text-fg2 hover:text-fg",
                )}
              >
                {f.label}
                <span className="num text-xs text-muted">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <input id="product-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or SKU" className={cx(input, "pl-9")} />
          </div>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Products with stock levels</caption>
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <SortHeader label="Product" active={sort.key === "title"} dir={sort.dir} onClick={by("title")} />
                <th scope="col" className="px-4 py-3 font-normal">Status</th>
                <th scope="col" className="px-4 py-3 font-normal">Glazes</th>
                <SortHeader label="Stock" active={sort.key === "stock"} dir={sort.dir} onClick={by("stock")} />
                <th scope="col" className="px-4 py-3 font-normal">Collection</th>
                <SortHeader label="Price" active={sort.key === "price"} dir={sort.dir} onClick={by("price")} align="right" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="relative border-b border-line transition-colors duration-150 last:border-0 hover:bg-raised/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Pot shape={p.shape} glaze={p.variants[0].glaze} className="size-11" />
                      <Link to={`/products/${p.id}`} className="font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-accent">
                        {p.title}
                      </Link>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductStatusText status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5" title={p.variants.map((v) => glazes[v.glaze].name).join(", ")}>
                      {p.variants.map((v) => (
                        <GlazeDot key={v.glaze} glaze={v.glaze} />
                      ))}
                      <span className="ml-1 text-xs text-muted">{p.variants.length}</span>
                      <span className="sr-only">{p.variants.map((v) => glazes[v.glaze].name).join(", ")}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StockCell p={p} />
                  </td>
                  <td className="px-4 py-3 text-fg2">{p.collection}</td>
                  <td className="num px-4 py-3 text-right">{fmtMoney(p.price)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-fg2">
                    No products match
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
