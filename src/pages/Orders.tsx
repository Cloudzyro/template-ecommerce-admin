import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card, FulfillmentText, PageHeader, PaymentText, SortHeader, input, type SortDir } from "../components/ui";
import type { Order } from "../data/store";
import { cx, fmtDate, fmtMoney } from "../lib/format";
import { customerById, orderTotals, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";

const filters = [
  { id: "all", label: "All", test: () => true },
  { id: "unfulfilled", label: "Unfulfilled", test: (o: Order) => o.fulfillment === "unfulfilled" },
  { id: "unpaid", label: "Unpaid", test: (o: Order) => o.payment === "pending" },
  { id: "fulfilled", label: "Fulfilled", test: (o: Order) => o.fulfillment === "fulfilled" },
  { id: "returned", label: "Returned", test: (o: Order) => o.fulfillment === "returned" },
] as const;

type SortKey = "id" | "date" | "customer" | "items" | "total";
const PAGE = 12;

export function Orders() {
  useTitle("Orders");
  const { orders } = useStore();
  const [params, setParams] = useSearchParams();
  const status = filters.find((f) => f.id === params.get("status"))?.id ?? "all";
  const q = params.get("q") ?? "";
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k));
    setParams(p, { replace: true });
    setPage(1);
  }

  const searched = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^#/, "");
    if (!term) return orders;
    return orders.filter((o) => {
      const c = customerById(o.customerId);
      return o.id.includes(term) || c?.name.toLowerCase().includes(term) || c?.email.toLowerCase().includes(term);
    });
  }, [orders, q]);

  const rows = useMemo(() => {
    const f = filters.find((x) => x.id === status)!;
    const list = searched.filter(f.test).map((o) => ({ o, t: orderTotals(o), c: customerById(o.customerId) }));
    const val = (r: (typeof list)[number]) =>
      sort.key === "id" ? Number(r.o.id) : sort.key === "date" ? Date.parse(r.o.placedAt) : sort.key === "customer" ? (r.c?.name ?? "") : sort.key === "items" ? r.t.units : r.t.total;
    return list.sort((a, b) => {
      const A = val(a);
      const B = val(b);
      const d = typeof A === "string" ? A.localeCompare(B as string) : A - (B as number);
      return sort.dir === "asc" ? d : -d;
    });
  }, [searched, status, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE, current * PAGE);
  const by = (key: SortKey) => () => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <div className="enter">
      <PageHeader title="Orders" sub={`${orders.length} orders since October 1`} />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line px-4 pt-3 lg:flex-row lg:items-end lg:justify-between">
          <div role="tablist" aria-label="Filter orders" className="-mb-px flex gap-1 overflow-x-auto">
            {filters.map((f) => {
              const n = searched.filter(f.test).length;
              const on = f.id === status;
              return (
                <button
                  key={f.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => update({ status: f.id === "all" ? "" : f.id })}
                  className={cx(
                    "flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors duration-150",
                    on ? "border-accent text-fg" : "border-transparent text-fg2 hover:text-fg",
                  )}
                >
                  {f.label}
                  <span className="num text-xs text-muted">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="relative pb-3 lg:w-72">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <Search className="pointer-events-none absolute left-3 top-[18px] size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <input id="order-search" type="search" value={q} onChange={(e) => update({ q: e.target.value })} placeholder="Order or customer" className={cx(input, "pl-9")} />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Orders, sortable by column</caption>
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <SortHeader label="Order" active={sort.key === "id"} dir={sort.dir} onClick={by("id")} />
                <SortHeader label="Date" active={sort.key === "date"} dir={sort.dir} onClick={by("date")} />
                <SortHeader label="Customer" active={sort.key === "customer"} dir={sort.dir} onClick={by("customer")} />
                <th scope="col" className="px-4 py-3 font-normal">Payment</th>
                <th scope="col" className="px-4 py-3 font-normal">Fulfillment</th>
                <SortHeader label="Items" active={sort.key === "items"} dir={sort.dir} onClick={by("items")} align="right" />
                <SortHeader label="Total" active={sort.key === "total"} dir={sort.dir} onClick={by("total")} align="right" />
              </tr>
            </thead>
            <tbody>
              {shown.map(({ o, t, c }) => (
                <tr key={o.id} className="group relative border-b border-line transition-colors duration-150 last:border-0 hover:bg-raised/60">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="num font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-accent">
                      #{o.id}
                    </Link>
                  </td>
                  <td className="num px-4 py-3 text-fg2">{fmtDate(o.placedAt)}</td>
                  <td className="px-4 py-3">{c?.name}</td>
                  <td className="px-4 py-3">
                    <PaymentText status={o.payment} />
                  </td>
                  <td className="px-4 py-3">
                    <FulfillmentText status={o.fulfillment} />
                  </td>
                  <td className="num px-4 py-3 text-right text-fg2">{t.units}</td>
                  <td className="num px-4 py-3 text-right">{fmtMoney(t.total)}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-fg2">
                    No orders match. Try another filter or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-fg2">
          <p className="num">
            {rows.length === 0 ? "0 orders" : `${(current - 1) * PAGE + 1} to ${Math.min(current * PAGE, rows.length)} of ${rows.length}`}
          </p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} className="inline-flex size-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-raised disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            </button>
            <span className="num px-2">
              Page {current} of {pages}
            </span>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages} className="inline-flex size-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-raised disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
