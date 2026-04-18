import React from "react";
import { Sparkles } from "lucide-react";

export default function SmartSummary({ text }) {
  if (!text) return null;

  return (
    <div className="bg-purple-950/40 border border-purple-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">AI Summary</span>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">{text}</p>
    </div>
  );
}