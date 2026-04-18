import React, { createContext, useState, useEffect } from 'react';
import { socket } from '../socket';

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    "emergency services": { priority: 1, timeRange: [0, 24] },
    "google maps": { priority: 1, timeRange: [0, 24] },
    "weather": { priority: 1, timeRange: [0, 24] },
    "whatsapp": { priority: 2, timeRange: [0, 24] }
  });

  const [contactPriorities, setContactPriorities] = useState([
    { id: "mom", name: "Mom" },
    { id: "boss", name: "Boss" },
    { id: "john", name: "John Doe" },
  ]);

  const updatePreference = (appId, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: value }
    }));
  };

  const addContact = (name) => {
    if (!name.trim()) return;
    const newId = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!contactPriorities.some(c => c.id === newId)) {
      setContactPriorities([...contactPriorities, { id: newId, name }]);
    }
  };

  const formatTime = (hour) => `${String(hour).padStart(2, '0')}:00`;

  const savePreferences = () => {
    const formattedPrefs = {};
    
    // Map contact priorities to a dictionary based on rank
    // Rank 0, 1 -> Priority 1. Others -> Priority 2
    const contactOverridesMap = {};
    contactPriorities.forEach((contact, index) => {
      contactOverridesMap[contact.name] = index <= 1 ? 1 : 2;
    });

    Object.keys(preferences).forEach(appId => {
      formattedPrefs[appId] = {
        basePriority: preferences[appId].priority,
        timeWindow: {
          start: formatTime(preferences[appId].timeRange[0]),
          end: formatTime(preferences[appId].timeRange[1])
        },
        contactOverrides: appId === 'whatsapp' ? contactOverridesMap : {}
      };
    });

    socket.emit("update_preferences", formattedPrefs);
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      setPreferences,
      updatePreference,
      contactPriorities,
      setContactPriorities,
      addContact,
      savePreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}
