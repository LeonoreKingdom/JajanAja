"use client";

import React from "react";
import { MessageCircleHeart, Sparkles, AlertCircle, Lightbulb } from "lucide-react";
import { LevinaInsight } from "@/types/finance";

interface LevinaInsightCardProps {
  insight: LevinaInsight;
  onOpenChat?: () => void;
}

export default function LevinaInsightCard({
  insight,
  onOpenChat,
}: LevinaInsightCardProps) {
  const isWarning = insight.mood === "waspada";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-4 text-white shadow-sm">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Mascot Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Cute Mascot Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-inner">
                🦊
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-purple-700 rounded-full flex items-center justify-center">
                <Sparkles size={8} className="text-purple-900" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-wide">
                  LEVINA
                </span>
                <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider text-purple-100">
                  Teman Finansial
                </span>
              </div>
              <p className="text-[11px] text-purple-200 font-medium">
                {insight.sapaan}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenChat}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-purple-900 text-xs font-bold hover:bg-purple-50 transition active:scale-95 shadow-xs"
          >
            <MessageCircleHeart size={14} className="text-purple-600" />
            <span>Tanya LEVINA</span>
          </button>
        </div>

        {/* Bubble Pesan */}
        <div className="mt-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
          <div className="flex items-start gap-2">
            {isWarning ? (
              <AlertCircle
                size={16}
                className="text-amber-300 mt-0.5 shrink-0"
              />
            ) : (
              <Sparkles
                size={16}
                className="text-emerald-300 mt-0.5 shrink-0"
              />
            )}
            <p className="text-xs text-purple-50 leading-relaxed font-normal">
              {insight.pesan}
            </p>
          </div>

          {insight.tips && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-purple-200">
              <Lightbulb size={13} className="text-amber-300 shrink-0" />
              <span className="italic">{insight.tips}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
