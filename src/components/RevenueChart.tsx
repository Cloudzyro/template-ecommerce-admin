// Cumulative revenue by day of the month: this month (accent, solid) against
// last month (neutral, dashed). Plain SVG, no chart library. Colors come from
// --chart-now, --chart-then and --grid in index.css.
import { useLayoutEffect, useRef, useState } from "react";
import { fmtAxis, fmtMoney } from "../lib/format";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// Four even grid steps with round labels, just above the highest value.
function niceMax(v: number) {
  const raw = v / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * pow >= raw) ?? 10;
  return step * pow * 4;
}

// Monotone cubic curve (Fritsch-Carlson): smooth, never overshoots, so a
// running total never appears to dip.
function smooth(points: [number, number][]) {
  const n = points.length;
  if (n < 2) return "";
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0]);
    m.push((points[i + 1][1] - points[i][1]) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]));
  t.push(m[n - 2]);
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h},${y0 + t[i] * h} ${x1 - h},${y1 - t[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

export function RevenueChart({
  now,
  then,
  nowLabel,
  thenLabel,
  height = 300,
}: {
  now: number[];
  then: number[];
  nowLabel: string;
  thenLabel: string;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const days = Math.max(now.length, then.length);
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const w = Math.max(width - pad.left - pad.right, 10);
  const h = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...now, ...then, 1));
  const x = (i: number) => pad.left + (i / (days - 1)) * w;
  const y = (v: number) => pad.top + h - (v / max) * h;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const dayTicks = [1, 5, 10, 15, 20, 25, 30].filter((d) => d <= days);
  const nowPts = now.map((v, i) => [x(i), y(v)] as [number, number]);
  const thenPts = then.map((v, i) => [x(i), y(v)] as [number, number]);
  const last = nowPts[nowPts.length - 1];

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left - pad.left) / w) * (days - 1));
    setHover(Math.max(0, Math.min(days - 1, i)));
  }

  const hi = hover ?? null;

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={`Revenue so far in ${nowLabel} against ${thenLabel}, by day of the month`}
        >
          <defs>
            <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-now)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--chart-now)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={pad.left + w} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
              <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="num fill-muted text-[11px]">
                {fmtAxis(t)}
              </text>
            </g>
          ))}
          {dayTicks.map((d) => (
            <text key={d} x={x(d - 1)} y={height - 8} textAnchor="middle" className="num fill-muted text-[11px]">
              {d}
            </text>
          ))}
          <path d={smooth(thenPts)} fill="none" stroke="var(--chart-then)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d={`${smooth(nowPts)} L${last[0]},${y(0)} L${pad.left},${y(0)} Z`} fill="url(#rev-fill)" />
          <path d={smooth(nowPts)} fill="none" stroke="var(--chart-now)" strokeWidth="2.25" strokeLinecap="round" />
          <circle cx={last[0]} cy={last[1]} r="4" fill="var(--panel, #fff)" stroke="var(--chart-now)" strokeWidth="2" />
          {hi !== null && (
            <g>
              <line x1={x(hi)} x2={x(hi)} y1={pad.top} y2={pad.top + h} stroke="var(--line-strong)" />
              {then[hi] !== undefined && <circle cx={x(hi)} cy={y(then[hi])} r="3" fill="var(--chart-then)" />}
              {now[hi] !== undefined && <circle cx={x(hi)} cy={y(now[hi])} r="3.5" fill="var(--chart-now)" />}
            </g>
          )}
        </svg>
      )}
      {hi !== null && width > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-44 rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          style={{ left: Math.min(Math.max(x(hi) - 88, 0), width - 176) }}
        >
          <p className="mb-1 text-muted">Day {hi + 1}</p>
          <p className="flex justify-between gap-3">
            <span className="text-fg2">{nowLabel}</span>
            <span className="num">{now[hi] !== undefined ? fmtMoney(now[hi]) : "Not yet"}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-fg2">{thenLabel}</span>
            <span className="num">{then[hi] !== undefined ? fmtMoney(then[hi]) : "No day"}</span>
          </p>
        </div>
      )}
      <div className="sr-only">
      <table>
        <caption>Cumulative revenue by day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>{nowLabel}</th>
            <th>{thenLabel}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: days }, (_, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{now[i] !== undefined ? fmtMoney(now[i]) : ""}</td>
              <td>{then[i] !== undefined ? fmtMoney(then[i]) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
