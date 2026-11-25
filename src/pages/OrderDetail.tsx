import { ChevronLeft, Mail, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { GlazeName, Pot } from "../components/Pot";
import { Avatar, Card, CardHeader, FulfillmentText, PageHeader, PaymentText, btn } from "../components/ui";
import { fmtDate, fmtDateTime, fmtMoney } from "../lib/format";
import { customerById, customerStats, orderTotals, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";

export function OrderDetail() {
  const { id } = useParams();
  const { orders, products, fulfillOrder } = useStore();
  const order = orders.find((o) => o.id === id);
  useTitle(order ? `Order #${order.id}` : "Order not found");
  const [done, setDone] = useState(false);
  if (!order) return <NotFound />;
  const c = customerById(order.customerId)!;
  const t = orderTotals(order);
  const stats = customerStats(c.id, orders);

  return (
    <div className="enter">
      <PageHeader
        back={
          <Link to="/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-fg2 hover:text-fg">
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Orders
          </Link>
        }
        title={`Order #${order.id}`}
        sub={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="num">{fmtDateTime(order.placedAt)}</span>
            <PaymentText status={order.payment} />
            <FulfillmentText status={order.fulfillment} />
          </span>
        }
        actions={
          order.fulfillment === "unfulfilled" ? (
            <button
              type="button"
              className={btn.primary}
              onClick={() => {
                fulfillOrder(order.id);
                setDone(true);
              }}
            >
              <Truck className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Mark as fulfilled
            </button>
          ) : (
            <a href={`mailto:${c.email}?subject=Your Kilnhouse order %23${order.id}`} className={btn.secondary}>
              <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Email customer
            </a>
          )
        }
      />
      <p role="status" className="sr-only">
        {done ? `Order ${order.id} marked as fulfilled` : ""}
      </p>
      {done && (
        <p className="mb-4 rounded-xl border border-line bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Marked as fulfilled. The timeline below has the new entry.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="Items" sub={`${t.units} ${t.units === 1 ? "piece" : "pieces"}, packed from the studio`} />
            <ul className="mt-3">
              {order.items.map((l) => {
                const p = products.find((x) => x.id === l.productId)!;
                const v = p.variants.find((x) => x.glaze === l.glaze);
                return (
                  <li key={`${l.productId}-${l.glaze}`} className="flex items-center gap-4 border-t border-line px-6 py-4">
                    <Pot shape={p.shape} glaze={l.glaze} className="size-14" label={`${p.title} in ${l.glaze}`} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/products/${p.id}`} className="text-sm font-medium hover:text-accent-ink">
                        {p.title}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-fg2">
                        <GlazeName glaze={l.glaze} />
                        <span className="text-xs text-muted">{v?.sku}</span>
                      </p>
                    </div>
                    <p className="num shrink-0 text-right text-sm">
                      {fmtMoney(l.price * l.qty)}
                      <span className="mt-1 block text-xs text-muted">
                        {fmtMoney(l.price)} x {l.qty}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
            <dl className="num space-y-2 border-t border-line px-6 py-4 text-sm">
              <div className="flex justify-between text-fg2">
                <dt>Subtotal</dt>
                <dd>{fmtMoney(t.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-fg2">
                <dt>Shipping</dt>
                <dd>{t.shipping === 0 ? "Free over $100" : fmtMoney(t.shipping)}</dd>
              </div>
              <div className="flex justify-between text-fg2">
                <dt>Sales tax ({Math.round(order.taxRate * 100)}%)</dt>
                <dd>{fmtMoney(t.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-[15px] font-medium">
                <dt>Total</dt>
                <dd>{fmtMoney(t.total)}</dd>
              </div>
              <div className="flex justify-between text-fg2">
                <dt>{order.payment === "refunded" ? "Refunded" : order.payment === "pending" ? "Due" : "Paid by customer"}</dt>
                <dd>{fmtMoney(t.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <ol className="relative mx-6 mb-6 mt-4">
              {[...order.events].reverse().map((e, i) => (
                <li key={`${e.at}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                  <span className="relative flex w-3 justify-center" aria-hidden="true">
                    <span className={i === 0 ? "mt-1.5 size-2.5 rounded-full bg-accent" : "mt-1.5 size-2.5 rounded-full border-2 border-line-strong bg-panel"} />
                    {i < order.events.length - 1 && <span className="absolute top-5 -bottom-1 w-px bg-line-strong" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{e.text}</p>
                    <p className="num mt-1 text-xs text-muted">{fmtDateTime(e.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          {order.note && (
            <Card className="p-5">
              <h2 className="text-[15px] font-medium">Note from customer</h2>
              <p className="mt-2 text-sm text-fg2">{order.note}</p>
            </Card>
          )}
          <Card className="p-5">
            <h2 className="text-[15px] font-medium">Customer</h2>
            <Link to={`/customers/${c.id}`} className="mt-4 flex items-center gap-3 rounded-lg transition-colors duration-150 hover:text-accent-ink">
              <Avatar name={c.name} className="size-10" />
              <span>
                <span className="block text-sm font-medium">{c.name}</span>
                <span className="num block text-xs text-muted">
                  {stats.count} {stats.count === 1 ? "order" : "orders"}, customer since {fmtDate(c.since)}
                </span>
              </span>
            </Link>
            <dl className="mt-5 space-y-4 border-t border-line pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="mt-1 break-all">
                  <a href={`mailto:${c.email}`} className="hover:text-accent-ink">
                    {c.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Ship to</dt>
                <dd className="mt-1 text-fg2">
                  {c.name}
                  {c.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
              {c.note && (
                <div>
                  <dt className="text-xs text-muted">Customer note</dt>
                  <dd className="mt-1 text-fg2">{c.note}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
