import React, { useState } from "react";

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [appName, setAppName] = useState("WhatsApp");
  const [priority, setPriority] = useState(2);
  const [timeRange, setTimeRange] = useState(9); // Just a simple slider value for start time as an example, or range

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      app_name: appName,
      priority_level: parseInt(priority, 10),
      time_range: `${String(timeRange).padStart(2, "0")}:00 to 17:00` // Simplified time range logic
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-96 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Preference Dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">App Name</label>
            <select 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Slack">Slack</option>
              <option value="Teams">Teams</option>
              <option value="Messages">Messages</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Priority Level</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none"
            >
              <option value={1}>1: High (Emergency / VIP)</option>
              <option value={2}>2: Medium (Standard)</option>
              <option value={3}>3: Low (Muted / Faded)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Time Range (Start: {String(timeRange).padStart(2, "0")}:00, End: 17:00)
            </label>
            <input 
              type="range" 
              min="0" max="16" 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 font-bold">Save Config</button>
        </div>
      </div>
    </div>
  );
}
