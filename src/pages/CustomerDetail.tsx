import { ChevronLeft, Mail } from "lucide-react";
import { Link, useParams } from "react-router";
import { Avatar, Card, CardHeader, FulfillmentText, PageHeader, btn } from "../components/ui";
import { fmtDate, fmtMoney } from "../lib/format";
import { customerById, customerStats, orderTotals, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";

export function CustomerDetail() {
  const { id } = useParams();
  const { orders } = useStore();
  const c = id ? customerById(id) : undefined;
  useTitle(c ? c.name : "Customer not found");
  if (!c) return <NotFound />;
  const s = customerStats(c.id, orders);
  const avg = s.spent / Math.max(s.orders.filter((o) => o.payment === "paid").length, 1);

  return (
    <div className="enter">
      <PageHeader
        back={
          <Link to="/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-fg2 hover:text-fg">
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Customers
          </Link>
        }
        title={c.name}
        sub={`${c.city}, customer since ${fmtDate(c.since)}`}
        actions={
          <a href={`mailto:${c.email}`} className={btn.secondary}>
            <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Email
          </a>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {[
              ["Spent", fmtMoney(s.spent)],
              ["Orders", String(s.count)],
              ["Average order", fmtMoney(avg)],
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <p className="text-sm text-fg2">{label}</p>
                <p className="num mt-3 text-2xl leading-none font-medium">{value}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader title="Orders" />
            <ul className="mt-3">
              {s.orders.map((o) => (
                <li key={o.id} className="border-t border-line">
                  <Link to={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-3 text-sm transition-colors duration-150 hover:bg-raised/60">
                    <span className="num w-16 font-medium">#{o.id}</span>
                    <span className="num w-28 text-fg2">{fmtDate(o.placedAt)}</span>
                    <span className="flex-1">
                      <FulfillmentText status={o.fulfillment} />
                    </span>
                    <span className="num">{fmtMoney(orderTotals(o).total)}</span>
                  </Link>
                </li>
              ))}
              {s.orders.length === 0 && <li className="border-t border-line px-6 py-8 text-sm text-fg2">No orders yet</li>}
            </ul>
          </Card>
        </div>
        <Card className="h-fit p-5">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} className="size-10" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.name}</p>
              <a href={`mailto:${c.email}`} className="block truncate text-xs text-muted hover:text-accent-ink">
                {c.email}
              </a>
            </div>
          </div>
          <dl className="mt-5 space-y-4 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-xs text-muted">Default address</dt>
              <dd className="mt-1 text-fg2">
                {c.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </dd>
            </div>
            {c.note && (
              <div>
                <dt className="text-xs text-muted">Note</dt>
                <dd className="mt-1 text-fg2">{c.note}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
