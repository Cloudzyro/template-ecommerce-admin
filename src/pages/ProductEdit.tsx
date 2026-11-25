import { Check, ChevronLeft } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { GlazeDot, Pot } from "../components/Pot";
import { Card, PageHeader, btn, input } from "../components/ui";
import { collections, glazes, type Product, type ProductStatus } from "../data/store";
import { cx, fmtMoney } from "../lib/format";
import { stockState, totalStock, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";

function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-xs text-down">
          {error}
        </p>
      ) : (
        hint && <p className="mt-2 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function ProductEdit() {
  const { id } = useParams();
  const { products, saveProduct } = useStore();
  const original = products.find((p) => p.id === id);
  const [draft, setDraft] = useState<Product | null>(original ?? null);
  const [preview, setPreview] = useState(0);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useTitle(original ? `Edit ${original.title}` : "Product not found");

  useEffect(() => {
    setDraft(original ?? null);
    // Reload only when another product is opened.
  }, [id]);

  if (!original || !draft) return <NotFound />;
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => {
    setDraft({ ...draft, [k]: v });
    setSaved(false);
  };
  const setVariant = (i: number, k: "sku" | "stock", v: string) => {
    const variants = draft.variants.map((x, j) => (j === i ? { ...x, [k]: k === "stock" ? Math.max(0, Math.floor(Number(v) || 0)) : v } : x));
    set("variants", variants);
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = "Give the product a title";
    if (!(draft.price > 0)) next.price = "Enter a price above $0.00";
    if (draft.compareAt !== undefined && draft.compareAt <= draft.price) next.compareAt = "Compare-at price should be higher than the price";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveProduct(draft);
    setSaved(true);
  }

  const v = draft.variants[Math.min(preview, draft.variants.length - 1)];
  const total = totalStock(draft);

  return (
    <form onSubmit={onSubmit} noValidate className="enter">
      <PageHeader
        back={
          <Link to="/products" className="mb-3 inline-flex items-center gap-1 text-sm text-fg2 hover:text-fg">
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Products
          </Link>
        }
        title={original.title}
        sub={`${original.collection} collection, ${original.variants.length} glazes`}
        actions={
          <>
            <button type="button" className={btn.secondary} disabled={!dirty} onClick={() => { setDraft(original); setErrors({}); }}>
              Discard
            </button>
            <button type="submit" className={btn.primary} disabled={!dirty}>
              Save product
            </button>
          </>
        }
      />
      <p role="status" aria-live="polite" className={cx("mb-4 items-center gap-2 rounded-xl border border-line bg-accent-soft px-4 py-3 text-sm text-accent-ink", saved ? "flex" : "hidden")}>
        <Check className="size-4" strokeWidth={1.5} aria-hidden="true" />
        {saved ? "Saved. Changes are kept in this browser until you connect your own store." : ""}
      </p>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Card className="space-y-5 p-6">
            <Field label="Title" htmlFor="title" error={errors.title}>
              <input id="title" className={input} value={draft.title} aria-invalid={!!errors.title} aria-describedby={errors.title ? "title-error" : undefined} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="description" hint="Shown on the product page. Mention size, care and what makes each piece vary">
              <textarea id="description" rows={4} className={cx(input, "h-auto py-2 leading-relaxed")} value={draft.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </Card>

          <Card className="p-6">
            <h2 className="text-[15px] font-medium">Pricing</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Price" htmlFor="price" error={errors.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input id="price" type="number" min="0" step="0.01" inputMode="decimal" className={cx(input, "num pl-7")} value={draft.price} aria-invalid={!!errors.price} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
              </Field>
              <Field label="Compare-at price" htmlFor="compare" hint="Optional. Shows the old price crossed out" error={errors.compareAt}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    id="compare"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className={cx(input, "num pl-7")}
                    value={draft.compareAt ?? ""}
                    aria-invalid={!!errors.compareAt}
                    onChange={(e) => set("compareAt", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <div className="flex items-baseline justify-between px-6 pt-6">
              <h2 className="text-[15px] font-medium">Glazes and stock</h2>
              <p className="num text-sm text-fg2">{total} in stock</p>
            </div>
            <div className="relative mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-6 py-2 font-normal">Glaze</th>
                    <th scope="col" className="px-3 py-2 font-normal">SKU</th>
                    <th scope="col" className="w-32 px-6 py-2 font-normal">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.variants.map((x, i) => {
                    const st = stockState(x.stock);
                    return (
                      <tr key={x.glaze} className="border-b border-line last:border-0">
                        <td className="px-6 py-3">
                          <button type="button" onClick={() => setPreview(i)} aria-pressed={preview === i} className={cx("inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 transition-colors duration-150 hover:bg-raised", preview === i && "bg-raised")}>
                            <GlazeDot glaze={x.glaze} />
                            {glazes[x.glaze].name}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <label className="sr-only" htmlFor={`sku-${i}`}>
                            SKU for {glazes[x.glaze].name}
                          </label>
                          <input id={`sku-${i}`} className={cx(input, "h-8 font-mono text-xs")} value={x.sku} onChange={(e) => setVariant(i, "sku", e.target.value)} />
                        </td>
                        <td className="px-6 py-3">
                          <label className="sr-only" htmlFor={`stock-${i}`}>
                            Stock for {glazes[x.glaze].name}
                          </label>
                          <div className="flex items-center gap-2">
                            <input id={`stock-${i}`} type="number" min="0" step="1" inputMode="numeric" className={cx(input, "num h-8 w-20")} value={x.stock} onChange={(e) => setVariant(i, "stock", e.target.value)} />
                            {st !== "in" && <span className={cx("text-xs", st === "out" ? "text-down" : "text-warn")}>{st === "out" ? "Out" : "Low"}</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="p-5">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-raised">
              <Pot shape={draft.shape} glaze={v.glaze} className="size-4/5 bg-transparent" label={`${draft.title} in ${glazes[v.glaze].name}`} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm">
                {draft.title}
                <span className="block text-xs text-muted">{glazes[v.glaze].name}</span>
              </p>
              <p className="num text-right text-sm">
                {fmtMoney(draft.price || 0)}
                {draft.compareAt !== undefined && draft.compareAt > draft.price && <span className="block text-xs text-muted line-through">{fmtMoney(draft.compareAt)}</span>}
              </p>
            </div>
            <div className="mt-4 flex gap-2" role="group" aria-label="Preview glaze">
              {draft.variants.map((x, i) => (
                <button
                  key={x.glaze}
                  type="button"
                  onClick={() => setPreview(i)}
                  aria-pressed={preview === i}
                  aria-label={glazes[x.glaze].name}
                  className={cx("inline-flex size-8 items-center justify-center rounded-full transition-[box-shadow] duration-150", preview === i ? "shadow-[0_0_0_1.5px_var(--fg)]" : "hover:shadow-[0_0_0_1px_var(--line-strong)]")}
                >
                  <GlazeDot glaze={x.glaze} className="size-5" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 p-5">
            <Field label="Status" htmlFor="status" hint={draft.status === "active" ? "Visible in the online store" : draft.status === "draft" ? "Hidden until you set it to active" : "Hidden and kept for your records"}>
              <select id="status" className={input} value={draft.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Collection" htmlFor="collection">
              <select id="collection" className={input} value={draft.collection} onChange={(e) => set("collection", e.target.value)}>
                {collections.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <p className="num text-sm text-fg2">{draft.sold30} sold in the last 30 days</p>
          </Card>
        </div>
      </div>
    </form>
  );
}
