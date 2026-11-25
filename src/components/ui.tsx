import type { ReactNode } from "react";
import type { FulfillmentStatus, PaymentStatus, ProductStatus } from "../data/store";
import { cx } from "../lib/format";
import type { StockState } from "../lib/state";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("min-w-0 rounded-2xl border border-line bg-panel", className)}>{children}</section>;
}

export function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
      <div>
        <h2 className="text-[15px] font-medium">{title}</h2>
        {sub && <p className="mt-1 text-sm text-fg2">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, sub, actions, back }: { title: string; sub?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back}
        <h1 className="page-title text-[32px] leading-[1.15]">{title}</h1>
        {sub && <p className="mt-2 text-[15px] text-fg2">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-fg px-4 text-sm font-medium text-canvas transition-[background-color,transform] duration-150 ease-out hover:bg-fg/85 active:scale-[0.98] disabled:opacity-50",
  accent:
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-accent-ink active:scale-[0.98] dark:text-[#10201c] disabled:opacity-50",
  secondary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-fg transition-[background-color,transform] duration-150 ease-out hover:bg-raised active:scale-[0.98]",
  ghost: "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-fg2 transition-colors duration-150 hover:bg-raised hover:text-fg",
};

export const input =
  "h-9 w-full rounded-lg border border-line-strong bg-panel px-3 text-sm text-fg placeholder:text-muted transition-colors duration-150 hover:border-fg2/40 focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

function Dot({ tone }: { tone: "neutral" | "warn" | "up" | "down" | "accent" }) {
  const c = { neutral: "bg-muted/60", warn: "bg-warn", up: "bg-up", down: "bg-down", accent: "bg-accent" }[tone];
  return <span className={cx("inline-block size-1.5 shrink-0 rounded-full", c)} aria-hidden="true" />;
}

function Status({ tone, children }: { tone: Parameters<typeof Dot>[0]["tone"]; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-fg2">
      <Dot tone={tone} />
      {children}
    </span>
  );
}

export function PaymentText({ status }: { status: PaymentStatus }) {
  const map = { paid: ["neutral", "Paid"], pending: ["warn", "Payment pending"], refunded: ["neutral", "Refunded"] } as const;
  const [tone, label] = map[status];
  return <Status tone={tone}>{label}</Status>;
}

export function FulfillmentText({ status }: { status: FulfillmentStatus }) {
  const map = { unfulfilled: ["warn", "Unfulfilled"], fulfilled: ["up", "Fulfilled"], returned: ["down", "Returned"] } as const;
  const [tone, label] = map[status];
  return <Status tone={tone}>{label}</Status>;
}

export function StockText({ count, state }: { count: number; state: StockState }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span className={cx("num", state === "out" ? "text-down" : state === "low" ? "text-warn" : "text-fg")}>{count}</span>
      {state !== "in" && <span className="text-muted">{state === "out" ? "out of stock" : "low"}</span>}
    </span>
  );
}

export function ProductStatusText({ status }: { status: ProductStatus }) {
  const map = { active: ["accent", "Active"], draft: ["neutral", "Draft"], archived: ["neutral", "Archived"] } as const;
  const [tone, label] = map[status];
  return <Status tone={tone}>{label}</Status>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cx("inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-medium text-fg2", className)}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export type SortDir = "asc" | "desc";

export function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"} className={cx("px-4 py-3 font-normal", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cx("inline-flex items-center gap-1 rounded transition-colors duration-150 hover:text-fg", active && "text-fg")}
      >
        {label}
        <svg viewBox="0 0 16 16" className={cx("size-3.5", !active && "opacity-0")} aria-hidden="true">
          <path d={dir === "asc" ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </th>
  );
}
