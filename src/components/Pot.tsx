// Product thumbnails drawn in code: each shape is thrown in "clay", then
// dipped in its glaze up to a wavy line, so the raw foot shows like a real
// pot. Colors come from `glazes` in src/data/store.ts.
import { useId } from "react";
import { glazes, type GlazeId, type Shape } from "../data/store";
import { cx } from "../lib/format";

const CLAY = "#c7a688";

// rim: the opening (or the top face of flat pieces) as an ellipse [cx, cy, rx, ry].
type Body = { body: string; glazeLine: number; handle?: string; extra?: string; rim?: [number, number, number, number]; flat?: boolean };

const shapes: Record<Shape, Body> = {
  mug: {
    body: "M13 14h20v22a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4z",
    handle: "M33 19h2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-2",
    glazeLine: 34,
    rim: [23, 14, 10, 1.8],
  },
  cup: { body: "M15 20h18l-1.6 15.6A5 5 0 0 1 26.4 40h-4.8a5 5 0 0 1-5-4.4z", glazeLine: 35, rim: [24, 20, 9, 1.6] },
  bowl: { body: "M6 21h36c0 11-7.6 19-18 19S6 32 6 21z", glazeLine: 35, rim: [24, 21, 18, 3] },
  plate: { body: "M4 29h40c-1.6 5.6-8.4 9-20 9S5.6 34.6 4 29z", glazeLine: 35, rim: [24, 29, 20, 4], flat: true },
  platter: { body: "M2 32h44c-1.8 4-9 6-22 6S3.8 36 2 32z", glazeLine: 36, rim: [24, 32, 22, 4], flat: true },
  vase: {
    body: "M21 7h6v6c0 3.4 9 7 9 16 0 6.6-3.6 11-6.4 11H17.4C14.6 40 11 35.6 11 29c0-9 10-12.6 10-16z",
    glazeLine: 35,
    rim: [24, 7, 3, 0.9],
  },
  pitcher: {
    body: "M15 11h16l4-3 .6 3.6c-1.8 1.6-2.6 4-2.6 7.4 1.8 4 3 8.4 3 14.4A6.6 6.6 0 0 1 29.4 40H18.6A6.6 6.6 0 0 1 12 33.4c0-6.4 1.6-12 3.4-16.4z",
    handle: "M15 16c-5 0-7.4 3.4-7.4 7.4 0 4.6 2.8 7.2 6.4 7.6",
    glazeLine: 34,
    rim: [23, 11, 8, 1.4],
  },
  planter: {
    body: "M10 15h28l-3 21H13z",
    extra: "M7 36h34v1.6A2.4 2.4 0 0 1 38.6 40H9.4A2.4 2.4 0 0 1 7 37.6z",
    glazeLine: 30,
    rim: [24, 15, 14, 2.2],
  },
};

export function Pot({ shape, glaze, className, label }: { shape: Shape; glaze: GlazeId; className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  const s = shapes[shape];
  const color = glazes[glaze].color;
  const g = s.glazeLine;
  const wave = `M0 0H48V${g}Q42 ${g + 2.2} 36 ${g}T24 ${g}T12 ${g}T0 ${g}Z`;
  return (
    <svg
      viewBox="0 0 48 48"
      className={cx("shrink-0 rounded-lg bg-raised", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={`b${id}`}>
          <path d={s.body} />
        </clipPath>
        <clipPath id={`g${id}`}>
          <path d={wave} />
        </clipPath>
        <linearGradient id={`l${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="41" rx="15" ry="1.8" fill="#000" opacity="0.1" />
      {s.extra && <path d={s.extra} fill={color} />}
      {s.handle && <path d={s.handle} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />}
      <path d={s.body} fill={CLAY} />
      <g clipPath={`url(#g${id})`}>
        <path d={s.body} fill={color} />
      </g>
      <g clipPath={`url(#b${id})`}>
        <rect width="48" height="48" fill={`url(#l${id})`} />
      </g>
      <path d={s.body} fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="0.6" />
      {s.rim && (
        <g>
          <ellipse cx={s.rim[0]} cy={s.rim[1]} rx={s.rim[2]} ry={s.rim[3]} fill={color} stroke="#000" strokeOpacity="0.12" strokeWidth="0.6" />
          {s.flat ? (
            <ellipse cx={s.rim[0]} cy={s.rim[1]} rx={s.rim[2] * 0.62} ry={s.rim[3] * 0.55} fill="#fff" opacity="0.14" />
          ) : (
            <ellipse cx={s.rim[0]} cy={s.rim[1] + s.rim[3] * 0.15} rx={s.rim[2] * 0.86} ry={s.rim[3] * 0.7} fill={shape === "planter" ? "#4a3a2e" : "#000"} opacity={shape === "planter" ? 1 : 0.28} />
          )}
        </g>
      )}
    </svg>
  );
}

// The signature detail: one glaze dot per variant, wherever a variant appears.
export function GlazeDot({ glaze, className }: { glaze: GlazeId; className?: string }) {
  return (
    <span
      className={cx("inline-block size-3 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]", className)}
      style={{ background: glazes[glaze].color }}
      aria-hidden="true"
    />
  );
}

export function GlazeName({ glaze }: { glaze: GlazeId }) {
  return (
    <span className="inline-flex items-center gap-2">
      <GlazeDot glaze={glaze} />
      {glazes[glaze].name}
    </span>
  );
}
