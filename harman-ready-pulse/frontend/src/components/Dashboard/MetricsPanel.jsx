import React from "react";
import { Clock, Database } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MetricsPanel({ stats = {} }) {
  const { deferredCount = 0, bytesSaved = 0 } = stats;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Deferred */}
      <div className="glass rounded-lg px-2.5 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Clock className="w-3 h-3 text-yellow-500" />
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Deferred</p>
        </div>
        <p className="text-sm font-bold text-white">{deferredCount}</p>
      </div>

      {/* Data Saved */}
      <div className="glass rounded-lg px-2.5 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Database className="w-3 h-3 text-green-400" />
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Saved</p>
        </div>
        <p className="text-sm font-bold text-white">{formatBytes(bytesSaved)}</p>
      </div>
    </div>
  );
}