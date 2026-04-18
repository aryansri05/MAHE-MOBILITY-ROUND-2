import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  MessageCircle, Hash, Users, Mail, Play, Camera,
  ChevronDown, Plus, X, UserPlus, Trash2
} from "lucide-react";

/* ── Available Apps Catalog ── */
const APP_CATALOG = [
  { id: "whatsapp",  name: "WhatsApp",  Icon: MessageCircle, color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)" },
  { id: "gmail",     name: "Gmail",     Icon: Mail,          color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)" },
  { id: "slack",     name: "Slack",     Icon: Hash,          color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)" },
  { id: "teams",     name: "Teams",     Icon: Users,         color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)" },
  { id: "youtube",   name: "YouTube",   Icon: Play,          color: "#f87171", bg: "rgba(248,113,113,0.1)",border: "rgba(248,113,113,0.3)" },
  { id: "instagram", name: "Instagram", Icon: Camera,        color: "#ec4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.3)" },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "P1 · Critical", color: "#dc2626", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.5)", glow: "0 0 12px rgba(220,38,38,0.4)" },
  { value: 2, label: "P2 · Standard", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", glow: "0 0 12px rgba(245,158,11,0.3)" },
  { value: 3, label: "P3 · Low",      color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.4)", glow: "none" },
];

const DEFAULT_PREFS = {
  whatsapp:  { priority: 2, timeRange: [0, 24], contacts: ["Mom"] },
  gmail:     { priority: 1, timeRange: [9, 17], contacts: [] },
  slack:     { priority: 1, timeRange: [9, 17], contacts: [] },
  teams:     { priority: 1, timeRange: [9, 18], contacts: [] },
};

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [addedApps, setAddedApps] = useState(["whatsapp", "gmail", "slack", "teams"]);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);
  const [expandedApp, setExpandedApp] = useState("whatsapp");
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [newContact, setNewContact] = useState({});

  if (!isOpen) return null;

  const availableToAdd = APP_CATALOG.filter(a => !addedApps.includes(a.id));

  const handleAddApp = (appId) => {
    setAddedApps(prev => [...prev, appId]);
    setPreferences(prev => ({
      ...prev,
      [appId]: { priority: 2, timeRange: [0, 24], contacts: [] }
    }));
    setExpandedApp(appId);
    setShowAppPicker(false);
  };

  const handleRemoveApp = (appId) => {
    setAddedApps(prev => prev.filter(id => id !== appId));
    setPreferences(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
    if (expandedApp === appId) setExpandedApp(null);
  };

  const handleUpdate = (appId, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: value }
    }));
  };

  const handleAddContact = (appId) => {
    const name = (newContact[appId] || "").trim();
    if (!name) return;
    const current = preferences[appId]?.contacts || [];
    if (!current.includes(name)) {
      handleUpdate(appId, "contacts", [...current, name]);
    }
    setNewContact(prev => ({ ...prev, [appId]: "" }));
  };

  const handleRemoveContact = (appId, contact) => {
    const current = preferences[appId]?.contacts || [];
    handleUpdate(appId, "contacts", current.filter(c => c !== contact));
  };

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const formatTime = (hour) => `${String(hour).padStart(2, "0")}:00`;

  /* ─────────────────────── STYLES ─────────────────────── */
  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const modalStyle = {
    background: "linear-gradient(145deg, #0f1420 0%, #0a0e18 100%)",
    border: "1px solid rgba(55,65,81,0.5)",
    borderRadius: 20, width: 640, maxWidth: "95vw",
    color: "#f3f4f6", boxShadow: "0 25px 80px rgba(0,0,0,0.8)",
    display: "flex", flexDirection: "column", maxHeight: "90vh",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const headerStyle = {
    padding: "24px 28px 20px", borderBottom: "1px solid rgba(55,65,81,0.4)",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  };

  const bodyStyle = {
    flex: 1, overflowY: "auto", padding: "20px 28px",
    display: "flex", flexDirection: "column", gap: 12,
  };

  const footerStyle = {
    padding: "16px 28px", borderTop: "1px solid rgba(55,65,81,0.4)",
    display: "flex", justifyContent: "flex-end", gap: 12,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "0.02em" }}>
              Preferences
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
              Configure app priorities, allowed hours & VIP contacts
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(107,114,128,0.15)", border: "1px solid rgba(107,114,128,0.3)",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#9ca3af", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(107,114,128,0.15)"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={bodyStyle}>

          {/* Add App Button */}
          <div style={{ position: "relative", marginBottom: 4 }}>
            <button
              onClick={() => setShowAppPicker(!showAppPicker)}
              disabled={availableToAdd.length === 0}
              style={{
                width: "100%", padding: "12px 16px",
                background: availableToAdd.length > 0 ? "rgba(59,130,246,0.08)" : "rgba(55,65,81,0.2)",
                border: `1px dashed ${availableToAdd.length > 0 ? "rgba(59,130,246,0.4)" : "rgba(55,65,81,0.3)"}`,
                borderRadius: 14, cursor: availableToAdd.length > 0 ? "pointer" : "default",
                color: availableToAdd.length > 0 ? "#60a5fa" : "#4b5563",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (availableToAdd.length > 0) e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = availableToAdd.length > 0 ? "rgba(59,130,246,0.08)" : "rgba(55,65,81,0.2)"; }}
            >
              <Plus size={18} />
              {availableToAdd.length > 0 ? "Add App" : "All apps added"}
            </button>

            {/* App Picker Dropdown */}
            {showAppPicker && availableToAdd.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10,
                background: "#111827", border: "1px solid rgba(55,65,81,0.6)",
                borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              }}>
                {availableToAdd.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAddApp(app.id)}
                    style={{
                      width: "100%", padding: "12px 16px", border: "none", cursor: "pointer",
                      background: "transparent", color: "#d1d5db",
                      display: "flex", alignItems: "center", gap: 12,
                      fontSize: 14, fontWeight: 500, transition: "background 0.15s",
                      borderBottom: "1px solid rgba(55,65,81,0.3)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <app.Icon size={20} color={app.color} />
                    {app.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── APP CARDS ── */}
          {addedApps.map(appId => {
            const app = APP_CATALOG.find(a => a.id === appId);
            if (!app) return null;
            const prefs = preferences[appId];
            if (!prefs) return null;
            const isExpanded = expandedApp === appId;
            const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === prefs.priority);

            return (
              <div
                key={appId}
                style={{
                  background: isExpanded ? "rgba(17,24,39,0.8)" : "rgba(17,24,39,0.4)",
                  border: `1px solid ${isExpanded ? app.border : "rgba(55,65,81,0.3)"}`,
                  borderRadius: 16, overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Card Header */}
                <div
                  onClick={() => setExpandedApp(isExpanded ? null : appId)}
                  style={{
                    padding: "14px 18px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(55,65,81,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: app.bg, border: `1px solid ${app.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <app.Icon size={20} color={app.color} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{app.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Priority badge */}
                    <span style={{
                      padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: priorityInfo.bg, border: `1px solid ${priorityInfo.border}`,
                      color: priorityInfo.color, letterSpacing: "0.03em",
                    }}>
                      P{prefs.priority}
                    </span>
                    {/* Contact count */}
                    {prefs.contacts?.length > 0 && (
                      <span style={{
                        padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                        color: "#60a5fa",
                      }}>
                        {prefs.contacts.length} VIP
                      </span>
                    )}
                    <ChevronDown
                      size={18}
                      color="#6b7280"
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{
                    padding: "4px 18px 18px",
                    borderTop: `1px solid rgba(55,65,81,0.3)`,
                    display: "flex", flexDirection: "column", gap: 20,
                  }}>

                    {/* ── PRIORITY TOGGLE BUTTONS ── */}
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10, marginTop: 14 }}>
                        Priority Level
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {PRIORITY_OPTIONS.map(opt => {
                          const isActive = prefs.priority === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleUpdate(appId, "priority", opt.value)}
                              style={{
                                flex: 1, padding: "10px 8px", borderRadius: 10,
                                border: `1.5px solid ${isActive ? opt.border : "rgba(55,65,81,0.4)"}`,
                                background: isActive ? opt.bg : "rgba(17,24,39,0.5)",
                                color: isActive ? opt.color : "#6b7280",
                                fontSize: 13, fontWeight: 700, cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: isActive ? opt.glow : "none",
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = opt.border; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "rgba(55,65,81,0.4)"; }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── TIME RANGE SLIDER ── */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Allowed Hours
                        </label>
                        <span style={{
                          fontSize: 12, fontFamily: "monospace",
                          background: "rgba(17,24,39,0.8)", border: "1px solid rgba(55,65,81,0.4)",
                          padding: "3px 10px", borderRadius: 6, color: "#9ca3af",
                        }}>
                          {formatTime(prefs.timeRange[0])} – {formatTime(prefs.timeRange[1])}
                        </span>
                      </div>
                      <div style={{ padding: "0 6px" }}>
                        <Slider
                          range
                          min={0} max={24}
                          value={prefs.timeRange}
                          onChange={(val) => handleUpdate(appId, "timeRange", val)}
                          trackStyle={[{ backgroundColor: app.color, height: 6, borderRadius: 3 }]}
                          handleStyle={[
                            { borderColor: app.color, height: 18, width: 18, backgroundColor: "#111827", borderWidth: 2, marginTop: -6, boxShadow: `0 0 8px ${app.border}` },
                            { borderColor: app.color, height: 18, width: 18, backgroundColor: "#111827", borderWidth: 2, marginTop: -6, boxShadow: `0 0 8px ${app.border}` },
                          ]}
                          railStyle={{ backgroundColor: "rgba(55,65,81,0.5)", height: 6, borderRadius: 3 }}
                        />
                      </div>
                    </div>

                    {/* ── VIP CONTACTS ── */}
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                        VIP Contacts
                        <span style={{ fontSize: 10, fontWeight: 500, color: "#4b5563", marginLeft: 8, textTransform: "none", letterSpacing: "normal" }}>
                          Always treated as P1
                        </span>
                      </label>

                      {/* Contact Chips */}
                      {prefs.contacts?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                          {prefs.contacts.map(contact => (
                            <span
                              key={contact}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                                borderRadius: 8, padding: "5px 10px",
                                fontSize: 13, fontWeight: 600, color: "#fca5a5",
                              }}
                            >
                              {contact}
                              <button
                                onClick={() => handleRemoveContact(appId, contact)}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: "#ef4444", display: "flex", padding: 0,
                                  transition: "color 0.15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = "#fca5a5"}
                                onMouseLeave={e => e.currentTarget.style.color = "#ef4444"}
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add Contact Input */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={newContact[appId] || ""}
                          onChange={(e) => setNewContact(prev => ({ ...prev, [appId]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddContact(appId); }}
                          placeholder="e.g. Mom, Boss..."
                          style={{
                            flex: 1, padding: "9px 14px", borderRadius: 10,
                            background: "rgba(17,24,39,0.6)", border: "1px solid rgba(55,65,81,0.4)",
                            color: "#d1d5db", fontSize: 13, outline: "none",
                            transition: "border-color 0.2s",
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = app.color}
                          onBlur={e => e.currentTarget.style.borderColor = "rgba(55,65,81,0.4)"}
                        />
                        <button
                          onClick={() => handleAddContact(appId)}
                          style={{
                            padding: "9px 14px", borderRadius: 10,
                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                            color: "#60a5fa", fontSize: 13, fontWeight: 600,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                        >
                          <UserPlus size={14} />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* ── REMOVE APP ── */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveApp(appId); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)",
                        color: "#6b7280", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(220,38,38,0.12)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.15)"; }}
                    >
                      <Trash2 size={14} />
                      Remove {app.name}
                    </button>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 22px", borderRadius: 10,
              background: "transparent", border: "1px solid rgba(55,65,81,0.4)",
              color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(55,65,81,0.3)"; e.currentTarget.style.color = "#f3f4f6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "1px solid rgba(59,130,246,0.5)",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 0 20px rgba(37,99,235,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(37,99,235,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(37,99,235,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
