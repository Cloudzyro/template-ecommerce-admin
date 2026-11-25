export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Every amount on screen uses two decimals, so columns line up.
export const fmtMoney = (n: number) => money.format(n);
// Only for chart axes, where cents add noise.
export const fmtAxis = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const fmtShortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });

export const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n).toFixed(1)}%`;
