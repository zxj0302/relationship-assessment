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

      <div className="relative w-full aspect-square max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-4 shadow-inner">
        {/* Quadrant Background Zones */}
        <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-1 pointer-events-none opacity-40">
          {/* Top-Left: High Anxiety, Low Avoidance = Anxious-Preoccupied */}
          <div className="bg-rose-50 rounded-tl-xl p-3 flex flex-col justify-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Anxious-Preoccupied
            </span>
          </div>

          {/* Top-Right: High Anxiety, High Avoidance = Fearful-Avoidant */}
          <div className="bg-purple-50 rounded-tr-xl p-3 flex flex-col justify-start items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
              Fearful-Avoidant
            </span>
          </div>

          {/* Bottom-Left: Low Anxiety, Low Avoidance = Secure */}
          <div className="bg-emerald-50 rounded-bl-xl p-3 flex flex-col justify-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Secure
            </span>
          </div>

          {/* Bottom-Right: Low Anxiety, High Avoidance = Dismissive-Avoidant */}
          <div className="bg-sky-50 rounded-br-xl p-3 flex flex-col justify-end items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
              Dismissive-Avoidant
            </span>
          </div>
        </div>

        {/* Center Crosshairs */}
        <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-stone-300" />
        </div>
        <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1px] bg-stone-300" />
        </div>

        {/* Axis Labels */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 bg-white/80 px-2 rounded">
          + High Anxiety
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-500 bg-white/80 px-2 rounded">
          - Low Anxiety
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 bg-white/80 px-1 rounded rotate-[-90deg]">
          Low Avoidance
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-500 bg-white/80 px-1 rounded rotate-[90deg]">
          High Avoidance
        </span>

        {/* Plotted User Marker (Strictly aligned within inset-4 quadrant area) */}
        <div className="absolute inset-4 pointer-events-none">
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-auto"
            style={{
              left: `${clampedX}%`,
              top: `${svgY}%`,
            }}
          >
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping print:hidden" />
              <div className="w-6 h-6 rounded-full bg-rose-700 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                You
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
