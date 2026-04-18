import { useEffect, useState } from "react";
import { socket } from "../../socket";

import NotificationList from "./NotificationList";
import MetricsPanel from "./MetricsPanel";
import PredictiveBar from "./PredictiveBar";
import SmartSummary from "./SmartSummary";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [queueCount, setQueueCount] = useState(0);
  const [network, setNetwork] = useState("5G");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    // 📩 Live Messages (Standard)
    const handleMessage = (msg) => {
      setMessages((prev) => [msg, ...prev]);
    };

    // 🚨 EMERGENCY OVERRIDE (The Winning Move)
    const handleEmergency = (msg) => {
      console.log("🚨 EMERGENCY DETECTED:", msg.text);
      
      // 1. Add to the list immediately
      setMessages((prev) => [msg, ...prev]);

      // 2. Immediate Voice Interrupt
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // STOPS any boring summary currently playing

        const utterance = new SpeechSynthesisUtterance(`Emergency Alert: ${msg.text}`);
        utterance.rate = 1.2; // Fast and urgent
        utterance.pitch = 1.3; // Higher tone for alertness
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
      }
    };

    // 📦 Queue Count
    const handleQueue = (count) => {
      setQueueCount(count);
    };

    // 📡 Network State
    const handleNetwork = (state) => {
      setNetwork(state);
    };

    // 🧠 AI Summary
    const handleSummary = (data) => {
      const text = data.text;
      console.log("🤖 AI Summary Received:", text);
      setSummary(text);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    // 🎧 Attach listeners
    socket.on("receive_live_message", handleMessage);
    socket.on("emergency_alert", handleEmergency); // NEW LISTENER
    socket.on("queue_updated", handleQueue);
    socket.on("network_state_changed", handleNetwork);
    socket.on("ai_summary_generated", handleSummary);

    // 🧹 Cleanup
    return () => {
      socket.off("receive_live_message", handleMessage);
      socket.off("emergency_alert", handleEmergency);
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
      <h1 className="text-xl mb-4 text-gray-400 font-semibold tracking-widest uppercase">
        Harman Ready-Pulse Dashboard
      </h1>

      <PredictiveBar network={network} />

      {queueCount > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 p-3 mb-4 rounded font-bold animate-pulse">
          ⚠️ Network Interrupted: {queueCount} alerts deferred to prevent distraction.
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <NotificationList messages={messages} />
        </div>
        <div>
          <MetricsPanel queueCount={queueCount} />
        </div>
      </div>

      {summary && <SmartSummary text={summary} />}
    </div>
  );
}