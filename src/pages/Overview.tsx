import { Link } from "react-router";
import { RevenueChart } from "../components/RevenueChart";
import { GlazeDot, Pot } from "../components/Pot";
import { Card, CardHeader, FulfillmentText, PageHeader, btn } from "../components/ui";
import { chart, glazes, lowStockAt, store } from "../data/store";
import { cx, fmtMoney, fmtShortDate, pct } from "../lib/format";
import { customerById, orderTotals, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";

const DAY = 86400000;

export function Overview() {
  useTitle("Overview");
  const { orders, products } = useStore();
  const today = new Date(`${store.today}T23:59:59Z`);
  const dayOfMonth = today.getUTCDate();
  const monthStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const prevStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1);
  const prevDays = Math.round((monthStart - prevStart) / DAY);

  const counted = orders.filter((o) => o.payment !== "refunded");
  const daily = (start: number, days: number) => {
    const arr = Array(days).fill(0) as number[];
    for (const o of counted) {
      const t = Date.parse(o.placedAt);
      const d = Math.floor((t - start) / DAY);
      if (d >= 0 && d < days) arr[d] += orderTotals(o).total;
    }
    let run = 0;
    return arr.map((v) => Math.round((run += v)));
  };
  const now = daily(monthStart, dayOfMonth);
  const then = daily(prevStart, prevDays);

  const inRange = (start: number, days: number) =>
    counted.filter((o) => {
      const t = Date.parse(o.placedAt);
      return t >= start && t < start + days * DAY;
    });
  const mtd = inRange(monthStart, dayOfMonth);
  const prevSame = inRange(prevStart, dayOfMonth);
  const revenue = mtd.reduce((s, o) => s + orderTotals(o).total, 0);
  const prevRevenue = prevSame.reduce((s, o) => s + orderTotals(o).total, 0);
  const aov = revenue / Math.max(mtd.length, 1);
  const prevAov = prevRevenue / Math.max(prevSame.length, 1);
  const toFulfill = orders.filter((o) => o.fulfillment === "unfulfilled");
  const oldest = toFulfill[toFulfill.length - 1];

  const stats = [
    { label: "Revenue", value: fmtMoney(revenue), change: pct(((revenue - prevRevenue) / prevRevenue) * 100), good: revenue >= prevRevenue, vs: `vs Oct 1 to ${dayOfMonth}` },
    { label: "Orders", value: String(mtd.length), change: `${mtd.length - prevSame.length >= 0 ? "+" : "-"}${Math.abs(mtd.length - prevSame.length)}`, good: mtd.length >= prevSame.length, vs: `vs Oct 1 to ${dayOfMonth}` },
    { label: "Average order", value: fmtMoney(aov), change: pct(((aov - prevAov) / prevAov) * 100), good: aov >= prevAov, vs: "vs October" },
    { label: "To fulfill", value: String(toFulfill.length), change: oldest ? `oldest from ${fmtShortDate(oldest.placedAt)}` : "all shipped", good: true, vs: "", plain: true },
  ];

  const top = [...products].filter((p) => p.sold30 > 0).sort((a, b) => b.sold30 - a.sold30).slice(0, 5);
  const topMax = top[0]?.sold30 ?? 1;
  const low = products
    .filter((p) => p.status === "active")
    .flatMap((p) => p.variants.filter((v) => v.stock <= lowStockAt).map((v) => ({ p, v })))
    .sort((a, b) => a.v.stock - b.v.stock);
  const recent = orders.slice(0, 6);

  return (
    <div className="enter">
      <PageHeader
        title={`${chart.thisMonth} 2026`}
        sub={`${store.name}, month to date through ${fmtShortDate(store.today)}`}
        actions={
          <Link to="/orders?status=unfulfilled" className={btn.primary}>
            Fulfill orders
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-fg2">{s.label}</p>
            <p className="num mt-3 text-[28px] leading-none font-medium">{s.value}</p>
            <p className="mt-3 text-xs text-muted">
              {s.plain ? (
                s.change
              ) : (
                <>
                  <span className={cx("num", s.good ? "text-up" : "text-down")}>{s.change}</span> {s.vs}
                </>
              )}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Revenue so far this month"
            sub={`Running total by day, ${chart.thisMonth} against ${chart.lastMonth}`}
            action={
              <div className="hidden shrink-0 items-center gap-4 text-xs text-fg2 sm:flex">
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-4 rounded bg-accent" aria-hidden="true" />
                  {chart.thisMonth}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 border-t-[1.5px] border-dashed border-[var(--chart-then)]" aria-hidden="true" />
                  {chart.lastMonth}
                </span>
              </div>
            }
          />
          <div className="px-3 pb-4 pt-4 sm:px-4">
            <RevenueChart now={now} then={then} nowLabel={chart.thisMonth} thenLabel={chart.lastMonth} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Best sellers" sub="Units sold, last 30 days" />
          <ol className="mt-4 space-y-1 px-3 pb-4">
            {top.map((p, i) => (
              <li key={p.id}>
                <Link to={`/products/${p.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-raised">
                  <span className="num w-4 text-xs text-muted">{i + 1}</span>
                  <Pot shape={p.shape} glaze={p.variants[0].glaze} className="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm">{p.title}</span>
                      <span className="num text-sm">{p.sold30}</span>
                    </span>
                    <span className="mt-2 block h-1 rounded-full bg-raised">
                      <span className={cx("block h-1 rounded-full", i === 0 ? "bg-accent" : "bg-fg2/35")} style={{ width: `${(p.sold30 / topMax) * 100}%` }} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Latest orders"
            action={
              <Link to="/orders" className="text-sm text-accent-ink hover:underline">
                All orders
              </Link>
            }
          />
          <div className="relative mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-6 py-2 font-normal">Order</th>
                  <th scope="col" className="px-3 py-2 font-normal">Customer</th>
                  <th scope="col" className="px-3 py-2 font-normal">Fulfillment</th>
                  <th scope="col" className="px-6 py-2 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-3">
                      <Link to={`/orders/${o.id}`} className="num font-medium hover:text-accent-ink">
                        #{o.id}
                      </Link>
                      <span className="ml-2 text-xs text-muted">{fmtShortDate(o.placedAt)}</span>
                    </td>
                    <td className="px-3 py-3 text-fg2">{customerById(o.customerId)?.name}</td>
                    <td className="px-3 py-3">
                      <FulfillmentText status={o.fulfillment} />
                    </td>
                    <td className="num px-6 py-3 text-right">{fmtMoney(orderTotals(o).total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Running low" sub={`Variants with ${lowStockAt} or fewer left`} />
          <ul className="mt-3 px-6 pb-5">
            {low.slice(0, 7).map(({ p, v }) => (
              <li key={v.sku} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
                <GlazeDot glaze={v.glaze} />
                <Link to={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-accent-ink">
                  {p.title}
                  <span className="text-muted">, {glazes[v.glaze].name}</span>
                </Link>
                <span className={cx("num text-sm", v.stock === 0 ? "text-down" : "text-warn")}>{v.stock === 0 ? "Out" : `${v.stock} left`}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
