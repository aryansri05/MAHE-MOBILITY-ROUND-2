import React from "react";

export default function SmartSummary({ text }) {
  if (!text) return null;

  return (
    <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500 rounded-lg shadow-lg">
      <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
        <span>🤖</span> AI Smart Summary
      </h3>
      <p className="text-gray-200 text-sm">{text}</p>
    </div>
  );
}