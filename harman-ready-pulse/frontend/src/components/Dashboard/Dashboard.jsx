import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";

import NotificationList from "./NotificationList";
import MetricsPanel from "./MetricsPanel";
import PredictiveBar from "./PredictiveBar";
import SmartSummary from "./SmartSummary";
import SettingsModal from "./SettingsModal";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [queueCount, setQueueCount] = useState(0);
  const [network, setNetwork] = useState("5G");
  const [summary, setSummary] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const queueThrottleRef = useRef(null);
  const latestQueueCountRef = useRef(0);

  useEffect(() => {
    // 📩 Live Messages
    const handleMessage = (msg) => {
      setMessages((prev) => [msg, ...prev]);
    };

    // 📦 Queue Count (number)
    const handleQueue = (count) => {
      latestQueueCountRef.current = count;
      if (!queueThrottleRef.current) {
        setQueueCount(count);
        queueThrottleRef.current = setTimeout(() => {
          setQueueCount(latestQueueCountRef.current);
          queueThrottleRef.current = null;
        }, 500);
      }
    };

    // 📡 Network State
    const handleNetwork = (state) => {
      setNetwork(state);
    };

    // 🧠 AI Summary (object: { text })
    const handleSummary = (data) => {
      const text = data.text;

      console.log("🤖 AI Summary Received:", text);
      setSummary(text);

      // 🔊 Text-to-Speech
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // stop previous speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        window.speechSynthesis.speak(utterance);
      }
    };

    // 🎧 Attach listeners
    socket.on("receive_live_message", handleMessage);
    socket.on("queue_updated", handleQueue);
    socket.on("network_state_changed", handleNetwork);
    socket.on("ai_summary_generated", handleSummary);

    // 🧹 Cleanup
    return () => {
      socket.off("receive_live_message", handleMessage);
      socket.off("queue_updated", handleQueue);
      socket.off("network_state_changed", handleNetwork);
      socket.off("ai_summary_generated", handleSummary);
    };
  }, []);

  return (
    <div
      className={`p-6 h-screen text-white transition-all duration-500 ${
        network === "DEAD_ZONE"
          ? "bg-black border-8 border-red-600 shadow-[inset_0_0_50px_rgba(220,38,38,0.5)]"
          : "bg-black"
      }`}
    >
      {/* 🔷 HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl text-gray-400 font-semibold tracking-widest uppercase">
          Controller Pit
        </h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2"
        >
          <span>⚙️</span> Preferences
        </button>
      </div>

      {/* 📶 NETWORK BAR */}
      <PredictiveBar network={network} />

      {/* ⚠️ QUEUE WARNING */}
      {queueCount > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 p-3 mb-4 rounded font-bold animate-pulse">
          ⚠️ Network Interrupted: {queueCount} alerts deferred to prevent distraction.
        </div>
      )}

      {/* 🧩 MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Notifications */}
        <div className="col-span-2">
          <NotificationList messages={messages} />
        </div>

        {/* RIGHT: Metrics */}
        <div>
          <MetricsPanel queueCount={queueCount} />
        </div>
      </div>

      {/* 🔊 AI VOICE (now visible component) */}
      <SmartSummary text={summary} />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(config) => {
          socket.emit("update_preferences", config);
        }}
      />
    </div>
  );
}