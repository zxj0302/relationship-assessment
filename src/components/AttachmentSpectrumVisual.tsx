import React from "react";
import { AttachmentArchetype } from "@/types/assessment";

interface SpectrumProps {
  anxiousPercent: number; // 0-100
  avoidantPercent: number; // 0-100
  archetype: AttachmentArchetype;
}

export function AttachmentSpectrumVisual({
  anxiousPercent,
  avoidantPercent,
  archetype,
}: SpectrumProps) {
  // Map 0-100% to coordinates on grid
  // X axis: Avoidance (Left = Low, Right = High)
  // Y axis: Anxiety (Bottom = Low, Top = High)
  const clampedX = Math.min(Math.max(avoidantPercent, 8), 92);
  const clampedY = Math.min(Math.max(anxiousPercent, 8), 92);

  // SVG coordinate system: y=0 is top, y=100 is bottom
  const svgY = 100 - clampedY;

  return (
    <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200">
      <div className="flex items-center justify-between mb-4">
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

      <div className="relative w-full aspect-square max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-6 shadow-inner">
        {/* Quadrant Background Zones */}
        <div className="absolute inset-6 grid grid-cols-2 grid-rows-2 gap-1 pointer-events-none">
          {/* Top-Left: High Anxiety, Low Avoidance = Anxious-Preoccupied */}
          <div className="bg-rose-50/70 rounded-tl-xl p-3 flex flex-col justify-start border border-rose-100/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900/70">
              Anxious-Preoccupied
            </span>
          </div>

          {/* Top-Right: High Anxiety, High Avoidance = Fearful-Avoidant */}
          <div className="bg-purple-50/70 rounded-tr-xl p-3 flex flex-col justify-start items-end text-right border border-purple-100/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900/70">
              Fearful-Avoidant
            </span>
          </div>

          {/* Bottom-Left: Low Anxiety, Low Avoidance = Secure */}
          <div className="bg-emerald-50/70 rounded-bl-xl p-3 flex flex-col justify-end border border-emerald-100/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70">
              Secure
            </span>
          </div>

          {/* Bottom-Right: Low Anxiety, High Avoidance = Dismissive-Avoidant */}
          <div className="bg-sky-50/70 rounded-br-xl p-3 flex flex-col justify-end items-end text-right border border-sky-100/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900/70">
              Dismissive-Avoidant
            </span>
          </div>
        </div>

        {/* Subtle Secondary Grid Lines (25% / 75%) */}
        <div className="absolute inset-6 pointer-events-none">
          <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-stone-200/70" />
          <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-stone-200/70" />
          <div className="absolute inset-y-0 left-1/4 border-l border-dashed border-stone-200/70" />
          <div className="absolute inset-y-0 left-3/4 border-l border-dashed border-stone-200/70" />
        </div>

        {/* Center Crosshairs */}
        <div className="absolute inset-6 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1.5px] bg-stone-300/90" />
        </div>
        <div className="absolute inset-6 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1.5px] bg-stone-300/90" />
        </div>

        {/* Axis Labels */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 tracking-wide">
          + High Anxiety
        </span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 tracking-wide">
          &minus; Low Anxiety
        </span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 tracking-wide [writing-mode:vertical-rl] rotate-180">
          &minus; Low Avoidance
        </span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 tracking-wide [writing-mode:vertical-rl]">
          + High Avoidance
        </span>

        {/* Plotted User Marker (Strictly aligned within inset-6 quadrant area) */}
        <div className="absolute inset-6 pointer-events-none">
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-auto"
            style={{
              left: `${clampedX}%`,
              top: `${svgY}%`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping print:hidden" />
              <div className="w-7 h-7 rounded-full bg-rose-700 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                You
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
