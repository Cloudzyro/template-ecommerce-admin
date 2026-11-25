import { ChevronsUpDown, LayoutGrid, Menu, Moon, Package, Receipt, Search, Sun, Users, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { nav, store, type NavItem } from "../data/store";
import { cx } from "../lib/format";
import { useStore } from "../lib/state";

const icons: Record<NavItem["icon"], typeof LayoutGrid> = { overview: LayoutGrid, orders: Receipt, products: Package, customers: Users };

function Mark() {
  // A kiln arch: the store's flat mark.
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M9 23V15a7 7 0 0 1 14 0v8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 23v-5a3 3 0 0 1 6 0v5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function StoreSwitcher() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-150 hover:bg-raised"
      >
        <Mark />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium leading-tight">{store.name}</span>
          <span className="block truncate text-xs text-muted">{store.domain}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted" strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="enter absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-line bg-panel p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="px-3 pb-1 pt-2 text-xs text-muted">Stores</p>
          <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-full items-center rounded-lg bg-raised px-3 text-left text-sm">
            {store.name}
          </button>
          {store.otherStores.map((s) => (
            <button key={s} type="button" onClick={() => setOpen(false)} className="flex h-9 w-full items-center rounded-lg px-3 text-left text-sm text-fg2 transition-colors duration-150 hover:bg-raised hover:text-fg">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { orders, products } = useStore();
  const counts: Record<string, number> = {
    "/orders": orders.filter((o) => o.fulfillment === "unfulfilled").length,
    "/products": products.filter((p) => p.status === "active" && p.variants.some((v) => v.stock <= 5)).length,
  };
  const link = ({ isActive }: { isActive: boolean }) =>
    cx(
      "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors duration-150",
      isActive ? "bg-raised text-fg shadow-[inset_0_0_0_1px_var(--line)]" : "text-fg2 hover:bg-raised/70 hover:text-fg",
    );
  return (
    <div className="flex h-full flex-col border-r border-line bg-panel px-3 py-3">
      <StoreSwitcher />
      <nav aria-label="Main" className="mt-4">
        {nav.map((group, gi) => (
          <div key={group.group} className={gi > 0 ? "mt-6" : ""}>
            <p className="px-3 pb-2 text-xs text-muted">{group.group}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const I = icons[item.icon];
                const count = counts[item.to];
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.to === "/"} className={link} onClick={onNavigate}>
                      <I className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {count ? (
                        <span className="num text-xs text-muted" aria-label={item.to === "/orders" ? `${count} to fulfill` : `${count} low on stock`}>
                          {count}
                        </span>
                      ) : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-line px-3 pt-4">
        <p className="text-xs leading-relaxed text-muted">Sample data from src/data/store.ts. Your edits stay in this browser.</p>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  }
  return (
    <button type="button" onClick={toggle} className="inline-flex size-9 items-center justify-center rounded-lg text-fg2 transition-colors duration-150 hover:bg-raised hover:text-fg" aria-label={dark ? "Use light theme" : "Use dark theme"}>
      {dark ? <Sun className="size-4" strokeWidth={1.5} /> : <Moon className="size-4" strokeWidth={1.5} />}
    </button>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    navigate(q ? `/orders?q=${encodeURIComponent(q)}` : "/orders");
  }

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="enter relative h-full w-72 max-w-[85vw]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-fg2 hover:bg-raised" aria-label="Close menu">
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex size-9 items-center justify-center rounded-lg text-fg2 hover:bg-raised lg:hidden" aria-label="Open menu">
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
          <form role="search" onSubmit={onSearch} className="relative w-full max-w-sm">
            <label htmlFor="global-search" className="sr-only">
              Search orders
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <input id="global-search" name="q" type="search" placeholder="Search orders" className="h-9 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-3 sm:flex">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-raised text-xs font-medium text-fg2" aria-hidden="true">
                {store.staff.initials}
              </span>
              <span className="text-sm leading-tight">
                {store.staff.name}
                <span className="block text-xs text-muted">{store.staff.role}</span>
              </span>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
