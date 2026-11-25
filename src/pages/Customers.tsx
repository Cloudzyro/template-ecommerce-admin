import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Avatar, Card, PageHeader, SortHeader, input, type SortDir } from "../components/ui";
import { customers } from "../data/store";
import { cx, fmtDate, fmtMoney } from "../lib/format";
import { customerStats, useStore } from "../lib/state";
import { useTitle } from "../lib/useTitle";

type Key = "name" | "orders" | "spent" | "last";

export function Customers() {
  useTitle("Customers");
  const { orders } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: Key; dir: SortDir }>({ key: "spent", dir: "desc" });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = customers
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.city.toLowerCase().includes(term))
      .map((c) => ({ c, s: customerStats(c.id, orders) }));
    const val = (r: (typeof list)[number]) => (sort.key === "name" ? r.c.name : sort.key === "orders" ? r.s.count : sort.key === "spent" ? r.s.spent : r.s.last ? Date.parse(r.s.last) : 0);
    return list.sort((a, b) => {
      const A = val(a);
      const B = val(b);
      const d = typeof A === "string" ? A.localeCompare(B as string) : A - (B as number);
      return sort.dir === "asc" ? d : -d;
    });
  }, [orders, q, sort]);

  const by = (key: Key) => () => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <div className="enter">
      <PageHeader title="Customers" sub={`${customers.length} customers with an account`} />
      <Card>
        <div className="border-b border-line p-4">
          <div className="relative sm:w-72">
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <input id="customer-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or city" className={cx(input, "pl-9")} />
          </div>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">Customers, sortable by column</caption>
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <SortHeader label="Customer" active={sort.key === "name"} dir={sort.dir} onClick={by("name")} />
                <th scope="col" className="px-4 py-3 font-normal">Location</th>
                <SortHeader label="Orders" active={sort.key === "orders"} dir={sort.dir} onClick={by("orders")} align="right" />
                <SortHeader label="Spent" active={sort.key === "spent"} dir={sort.dir} onClick={by("spent")} align="right" />
                <SortHeader label="Last order" active={sort.key === "last"} dir={sort.dir} onClick={by("last")} align="right" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, s }) => (
                <tr key={c.id} className="relative border-b border-line transition-colors duration-150 last:border-0 hover:bg-raised/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <span className="min-w-0">
                        <Link to={`/customers/${c.id}`} className="block font-medium after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-accent">
                          {c.name}
                        </Link>
                        <span className="block truncate text-xs text-muted">{c.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-fg2">{c.city}</td>
                  <td className="num px-4 py-3 text-right">{s.count}</td>
                  <td className="num px-4 py-3 text-right">{fmtMoney(s.spent)}</td>
                  <td className="num px-4 py-3 text-right text-fg2">{s.last ? fmtDate(s.last) : "None yet"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-fg2">
                    No customers match
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
