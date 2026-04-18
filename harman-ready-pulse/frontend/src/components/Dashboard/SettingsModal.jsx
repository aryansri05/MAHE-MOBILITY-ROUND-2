import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { MessageCircle, Hash, Users, Mail, Play, Camera, ChevronDown } from "lucide-react";

const APPS = [
  { id: "whatsapp", name: "WhatsApp", Icon: MessageCircle, color: "text-green-500" },
  { id: "gmail", name: "Gmail", Icon: Mail, color: "text-red-500" },
  { id: "slack", name: "Slack", Icon: Hash, color: "text-purple-500" },
  { id: "teams", name: "Teams", Icon: Users, color: "text-indigo-500" },
  { id: "youtube", name: "YouTube", Icon: Play, color: "text-red-400" },
  { id: "instagram", name: "Instagram", Icon: Camera, color: "text-pink-500" },
];

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [preferences, setPreferences] = useState({
    whatsapp: { basePriority: 2, timeRange: [0, 24], contactOverrides: { "Mom": 1 } },
    gmail: { basePriority: 1, timeRange: [9, 17], contactOverrides: {} },
    slack: { basePriority: 1, timeRange: [9, 17], contactOverrides: {} },
    teams: { basePriority: 1, timeRange: [9, 18], contactOverrides: {} },
    youtube: { basePriority: 3, timeRange: [0, 24], contactOverrides: {} },
    instagram: { basePriority: 3, timeRange: [0, 24], contactOverrides: {} }
  });

  const [newContact, setNewContact] = useState({ name: "", priority: 1 });

  const [expandedApp, setExpandedApp] = useState("whatsapp");

  if (!isOpen) return null;

  const handleUpdate = (appId, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: value }
    }));
  };

  const handleAddContact = (appId) => {
    if (!newContact.name.trim()) return;
    setPreferences(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        contactOverrides: {
          ...prev[appId].contactOverrides,
          [newContact.name.trim()]: newContact.priority
        }
      }
    }));
    setNewContact({ name: "", priority: 1 });
  };

  const handleRemoveContact = (appId, contactName) => {
    setPreferences(prev => {
      const updatedOverrides = { ...prev[appId].contactOverrides };
      delete updatedOverrides[contactName];
      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          contactOverrides: updatedOverrides
        }
      };
    });
  };

  const handleSave = () => {
    const formattedPrefs = {};
    Object.keys(preferences).forEach(appId => {
      formattedPrefs[appId] = {
        basePriority: preferences[appId].basePriority,
        timeWindow: {
          start: formatTime(preferences[appId].timeRange[0]),
          end: formatTime(preferences[appId].timeRange[1])
        },
        contactOverrides: preferences[appId].contactOverrides
      };
    });
    onSave(formattedPrefs);
    onClose();
  };

  const formatTime = (hour) => `${String(hour).padStart(2, '0')}:00`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-[600px] max-w-full text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">Preference Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">Configure app priorities and allowed hours</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {APPS.map((app) => {
            const isExpanded = expandedApp === app.id;
            const prefs = preferences[app.id];

            return (
              <div key={app.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300">
                {/* App Header (Clickable to expand) */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50"
                  onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                >
                  <div className="flex items-center gap-3">
                    <app.Icon className={`w-6 h-6 ${app.color}`} />
                    <span className="font-semibold text-lg">{app.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${prefs.basePriority === 1 ? 'bg-red-900/50 text-red-400' : prefs.basePriority === 2 ? 'bg-gray-700 text-gray-300' : 'bg-gray-900 text-gray-500'}`}>
                      Priority {prefs.basePriority}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-700 bg-gray-800/30 space-y-6">
                    {/* Priority Dropdown */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">Base Priority Level</label>
                      <select 
                        value={prefs.basePriority} 
                        onChange={(e) => handleUpdate(app.id, 'basePriority', parseInt(e.target.value, 10))}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 text-gray-200"
                      >
                        <option value={1}>Priority 1: High (Emergency / VIP)</option>
                        <option value={2}>Priority 2: Medium (Standard)</option>
                        <option value={3}>Priority 3: Low (Muted / Faded)</option>
                      </select>
                    </div>

                    {/* Time Range Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm text-gray-400 font-medium">Allowed Time Range</label>
                        <span className="text-sm font-mono bg-gray-900 px-2 py-1 rounded border border-gray-700">
                          {formatTime(prefs.timeRange[0])} - {formatTime(prefs.timeRange[1])}
                        </span>
                      </div>
                      <div className="px-2">
                        <Slider
                          range
                          min={0}
                          max={24}
                          value={prefs.timeRange}
                          onChange={(val) => handleUpdate(app.id, 'timeRange', val)}
                          trackStyle={[{ backgroundColor: '#3b82f6', height: 6 }]}
                          handleStyle={[
                            { borderColor: '#60a5fa', height: 16, width: 16, backgroundColor: '#1e3a8a' },
                            { borderColor: '#60a5fa', height: 16, width: 16, backgroundColor: '#1e3a8a' }
                          ]}
                          railStyle={{ backgroundColor: '#374151', height: 6 }}
                        />
                      </div>
                    </div>

                    {/* VIP Contacts Sub-menu */}
                    <div className="pt-4 border-t border-gray-700/50">
                      <label className="block text-sm text-gray-400 mb-2 font-medium">VIP Contacts (Overrides Base Priority)</label>
                      <div className="flex gap-2 mb-3">
                        <input 
                          type="text" 
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          placeholder="e.g. Mom, Boss"
                          className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-2 focus:outline-none focus:border-green-500 text-gray-200"
                        />
                        <select 
                          value={newContact.priority}
                          onChange={(e) => setNewContact({ ...newContact, priority: parseInt(e.target.value, 10) })}
                          className="w-24 bg-gray-900 border border-gray-600 rounded-lg p-2 focus:outline-none focus:border-green-500 text-gray-200"
                        >
                          <option value={1}>P1</option>
                          <option value={2}>P2</option>
                          <option value={3}>P3</option>
                        </select>
                        <button 
                          onClick={() => handleAddContact(app.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Pill List */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(prefs.contactOverrides || {}).map(([name, prio]) => (
                          <div key={name} className="flex items-center gap-1 bg-gray-900 border border-gray-600 rounded-full px-3 py-1">
                            <span className="text-sm text-gray-200 font-medium">{name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${prio === 1 ? 'bg-red-900/50 text-red-400' : prio === 2 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                              P{prio}
                            </span>
                            <button 
                              onClick={() => handleRemoveContact(app.id, name)}
                              className="ml-1 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Messages from these contacts will bypass the base priority.</p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
