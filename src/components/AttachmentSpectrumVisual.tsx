import React from "react";
import { AttachmentArchetype } from "@/types/assessment";

interface SpectrumProps {
  anxiousPercent: number; // 0-100
  avoidantPercent: number; // 0-100
  archetype: AttachmentArchetype;
}

const POPULATION_NORMS: {
  id: AttachmentArchetype;
  label: string;
  share: number;
  barColor: string;
  badgeColor: string;
}[] = [
  {
    id: "Secure",
    label: "Secure",
    share: 50,
    barColor: "bg-emerald-500",
    badgeColor: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  {
    id: "Dismissive-Avoidant",
    label: "Dismissive-Avoidant",
    share: 25,
    barColor: "bg-sky-500",
    badgeColor: "text-sky-800 bg-sky-50 border-sky-200",
  },
  {
    id: "Anxious-Preoccupied",
    label: "Anxious-Preoccupied",
    share: 19,
    barColor: "bg-rose-500",
    badgeColor: "text-rose-800 bg-rose-50 border-rose-200",
  },
  {
    id: "Fearful-Avoidant",
    label: "Fearful-Avoidant",
    share: 6,
    barColor: "bg-purple-500",
    badgeColor: "text-purple-800 bg-purple-50 border-purple-200",
  },
];

export function AttachmentSpectrumVisual({
  anxiousPercent,
  avoidantPercent,
  archetype,
}: SpectrumProps) {
  // Linearly map 0-100% into safe inner plot bounds centered strictly on (50, 50)
  // X axis (Avoidance): 0% -> 14, 50% -> 50, 100% -> 86
  // Y axis (Anxiety, SVG inverted): 0% -> 80, 50% -> 50, 100% -> 20
  const toPlotX = (pct: number) =>
    14 + (Math.min(Math.max(pct, 0), 100) / 100) * 72;
  const toPlotSvgY = (pct: number) =>
    100 - (20 + (Math.min(Math.max(pct, 0), 100) / 100) * 60);

  const plotX = toPlotX(avoidantPercent);
  const svgY = toPlotSvgY(anxiousPercent);
  const showCoordAbove = anxiousPercent < 25;

  const activeNorm =
    POPULATION_NORMS.find((n) => n.id === archetype) || POPULATION_NORMS[0];

  // Normative Secure Anchor (~28% Avoidance, ~26% Anxiety) on identical linear scale
  const normAnchorX = toPlotX(28);
  const normAnchorSvgY = toPlotSvgY(26);

  return (
    <div className="bg-stone-50 rounded-3xl p-5 sm:p-7 border border-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            ECR-R Two-Dimensional Attachment Spectrum
          </h3>
          <p className="text-xs text-stone-500">
            Coordinates: Anxiety ({anxiousPercent}%) • Avoidance ({avoidantPercent}%)
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          {archetype}
        </span>
      </div>

      <div className="relative w-full aspect-square sm:aspect-[16/11] max-w-lg mx-auto bg-white rounded-2xl border border-stone-200 p-6 shadow-inner overflow-hidden">
        {/* Quadrant Background Zones */}
        <div className="absolute inset-6 grid grid-cols-2 grid-rows-2 gap-1.5 pointer-events-none">
          {/* Top-Left: High Anxiety, Low Avoidance = Anxious-Preoccupied */}
          <div
            className={`rounded-tl-xl p-2 sm:p-3 flex flex-col justify-between border transition-all ${
              archetype === "Anxious-Preoccupied"
                ? "bg-rose-50/95 border-rose-300 shadow-sm"
                : "bg-rose-50/45 border-rose-100/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-900 leading-tight">
                  Anxious-Preoccupied
                </span>
                <span className="hidden sm:inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-100/80 text-rose-800">
                  ~19%
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-rose-800/75 mt-0.5 leading-tight">
                Hyper-Vigilant • Intimacy Seeking
              </p>
            </div>
          </div>

          {/* Top-Right: High Anxiety, High Avoidance = Fearful-Avoidant */}
          <div
            className={`rounded-tr-xl p-2 sm:p-3 flex flex-col justify-between items-end text-right border transition-all ${
              archetype === "Fearful-Avoidant"
                ? "bg-purple-50/95 border-purple-300 shadow-sm"
                : "bg-purple-50/45 border-purple-100/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-end gap-1">
                <span className="hidden sm:inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100/80 text-purple-800">
                  ~6%
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-900 leading-tight">
                  Fearful-Avoidant
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-purple-800/75 mt-0.5 leading-tight">
                Push-Pull • Disorganized Guard
              </p>
            </div>
          </div>

          {/* Bottom-Left: Low Anxiety, Low Avoidance = Secure */}
          <div
            className={`rounded-bl-xl p-2 sm:p-3 flex flex-col justify-end border transition-all ${
              archetype === "Secure"
                ? "bg-emerald-50/95 border-emerald-300 shadow-sm"
                : "bg-emerald-50/45 border-emerald-100/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-900 leading-tight">
                  Secure
                </span>
                <span className="hidden sm:inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                  ~50%
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-emerald-800/75 mt-0.5 leading-tight">
                Grounded • Calm Co-Regulation
              </p>
            </div>
          </div>

          {/* Bottom-Right: Low Anxiety, High Avoidance = Dismissive-Avoidant */}
          <div
            className={`rounded-br-xl p-2 sm:p-3 flex flex-col justify-end items-end text-right border transition-all ${
              archetype === "Dismissive-Avoidant"
                ? "bg-sky-50/95 border-sky-300 shadow-sm"
                : "bg-sky-50/45 border-sky-100/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-end gap-1">
                <span className="hidden sm:inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-sky-100/80 text-sky-800">
                  ~25%
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-900 leading-tight">
                  Dismissive-Avoidant
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-sky-800/75 mt-0.5 leading-tight">
                Self-Reliant • Autonomy Fortress
              </p>
            </div>
          </div>
        </div>

        {/* Concentric Radar Rings & Secondary Grid Lines */}
        <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
          <div className="w-[38%] aspect-square rounded-full border border-dashed border-stone-300/70" />
          <div className="absolute w-[72%] aspect-square rounded-full border border-dashed border-stone-200/80" />
          <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-stone-200/60" />
          <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-stone-200/60" />
          <div className="absolute inset-y-0 left-1/4 border-l border-dashed border-stone-200/60" />
          <div className="absolute inset-y-0 left-3/4 border-l border-dashed border-stone-200/60" />
        </div>

        {/* Center Crosshairs & 50% Origin Label */}
        <div className="absolute inset-6 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1.5px] bg-stone-300" />
        </div>
        <div className="absolute inset-6 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1.5px] bg-stone-300" />
          <span className="hidden sm:inline-block absolute px-1.5 py-0.5 rounded bg-white/90 border border-stone-200 text-[9px] font-mono text-stone-400">
            50% Threshold
          </span>
        </div>

        {/* Axis Labels */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 tracking-wide whitespace-nowrap">
          + High Anxiety<span className="hidden sm:inline"> (100%)</span>
        </span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 tracking-wide whitespace-nowrap">
          &minus; Low Anxiety<span className="hidden sm:inline"> (0%)</span>
        </span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 tracking-wide whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
          &minus; Low Avoidance<span className="hidden sm:inline"> (0%)</span>
        </span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 tracking-wide whitespace-nowrap [writing-mode:vertical-rl]">
          + High Avoidance<span className="hidden sm:inline"> (100%)</span>
        </span>

        {/* Plotted Coordinates Layer (Vector Line + Secure Baseline + User Marker) */}
        <div className="absolute inset-6 pointer-events-none">
          {/* SVG Vector Line connecting Secure Anchor to User Coordinate + Drop Lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Axis Drop-lines from User Marker */}
            <line
              x1={plotX}
              y1={svgY}
              x2={plotX}
              y2={50}
              stroke="#be123c"
              strokeWidth="0.6"
              strokeDasharray="1.5 1.5"
              opacity="0.45"
            />
            <line
              x1={plotX}
              y1={svgY}
              x2={50}
              y2={svgY}
              stroke="#be123c"
              strokeWidth="0.6"
              strokeDasharray="1.5 1.5"
              opacity="0.45"
            />
            {/* Vector line from Secure Norm Anchor to User */}
            <line
              x1={normAnchorX}
              y1={normAnchorSvgY}
              x2={plotX}
              y2={svgY}
              stroke="#57534e"
              strokeWidth="0.7"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          </svg>

          {/* Secure Baseline Reference Dot */}
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{
              left: `${normAnchorX}%`,
              top: `${normAnchorSvgY}%`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600/80 border border-white shadow-sm" />
            <span className="mt-0.5 px-1.5 py-0.2 rounded bg-white/90 border border-emerald-200 text-[8px] font-semibold text-emerald-800 whitespace-nowrap shadow-sm">
              Secure Norm
            </span>
          </div>

          {/* User Plotted Marker */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-auto"
            style={{
              left: `${plotX}%`,
              top: `${svgY}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              {showCoordAbove && (
                <span className="absolute bottom-full mb-1 px-1.5 py-0.5 rounded bg-stone-900/90 text-white text-[9px] font-mono font-semibold whitespace-nowrap shadow">
                  ({avoidantPercent}%, {anxiousPercent}%)
                </span>
              )}
              <span className="absolute -inset-1 h-9 w-9 m-auto rounded-full bg-rose-500/30 animate-ping print:hidden" />
              <div className="w-7 h-7 rounded-full bg-rose-700 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                You
              </div>
              {!showCoordAbove && (
                <span className="absolute top-full mt-1 px-1.5 py-0.5 rounded bg-stone-900/90 text-white text-[9px] font-mono font-semibold whitespace-nowrap shadow">
                  ({avoidantPercent}%, {anxiousPercent}%)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adult Attachment Population Distribution Bar */}
      <div className="mt-5 pt-4 border-t border-stone-200/80 max-w-lg mx-auto">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-stone-700">
            Adult Population Norm Distribution
          </span>
          <span className="text-stone-500">
            Your Quadrant:{" "}
            <strong className="text-stone-900">~{activeNorm.share}% of adults</strong>
          </span>
        </div>

        {/* Stacked Distribution Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-stone-200 p-0.5">
          {POPULATION_NORMS.map((item) => {
            const isCurrent = item.id === archetype;
            return (
              <div
                key={item.id}
                style={{ width: `${item.share}%` }}
                className={`h-full first:rounded-l-full last:rounded-r-full transition-opacity ${
                  item.barColor
                } ${isCurrent ? "opacity-100 ring-1 ring-stone-900/30" : "opacity-35"}`}
                title={`${item.label}: ~${item.share}%`}
              />
            );
          })}
        </div>

        {/* Legend Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5">
          {POPULATION_NORMS.map((item) => {
            const isCurrent = item.id === archetype;
            return (
              <div
                key={item.id}
                className={`text-[10px] px-2 py-1 rounded-lg border flex items-center justify-between ${
                  isCurrent
                    ? `${item.badgeColor} font-bold shadow-sm`
                    : "bg-white/60 border-stone-200/70 text-stone-400"
                }`}
              >
                <span className="truncate mr-1">{item.label.split("-")[0]}</span>
                <span>~{item.share}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
