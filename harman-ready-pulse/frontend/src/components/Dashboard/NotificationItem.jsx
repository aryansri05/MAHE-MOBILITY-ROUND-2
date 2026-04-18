import React from "react";
import { MessageCircle, Users, Hash, Bell, Mail, Play, Camera } from "lucide-react";

// Helper to determine app metadata based on the app name field
const getAppMetadata = (appName) => {
  switch (appName) {
    case "WhatsApp":
      return { title: "WhatsApp", Icon: MessageCircle, color: "text-green-400" };
    case "Gmail":
      return { title: "Gmail", Icon: Mail, color: "text-red-400" };
    case "Teams":
      return { title: "Teams", Icon: Users, color: "text-indigo-400" };
    case "Slack":
      return { title: "Slack", Icon: Hash, color: "text-purple-400" };
    case "YouTube":
      return { title: "YouTube", Icon: Play, color: "text-red-500" };
    case "Instagram":
      return { title: "Instagram", Icon: Camera, color: "text-pink-400" };
    default:
      return { title: appName || "Notification", Icon: Bell, color: "text-gray-400" };
  }
};

// Priority badge styles
const getPriorityBadge = (priority, isEmergency) => {
  if (isEmergency) {
    return { text: "Emergency", className: "bg-red-500 text-white animate-pulse" };
  }
  switch (priority) {
    case 1:
      return { text: "High", className: "bg-red-900/60 text-red-400 border border-red-700/50" };
    case 2:
      return { text: "Medium", className: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50" };
    case 3:
      return { text: "Low", className: "bg-gray-800 text-gray-500 border border-gray-700" };
    default:
      return { text: "Normal", className: "bg-gray-800 text-gray-500 border border-gray-700" };
  }
};

const NotificationItem = React.memo(({ msg }) => {
  const priority = msg.priority || 2;
  const { title, Icon, color } = getAppMetadata(msg.app);
  const badge = getPriorityBadge(priority, msg.is_emergency);

  // Clean time display: "12:10 PM" format
  const displayTime = msg.displayTime || (
    typeof msg.timestamp === "number"
      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : msg.timestamp
  );

  let containerClass = "bg-gray-800/80 border-gray-700";
  let textClass = "text-gray-200 text-sm mt-2";
  let opacityClass = "opacity-100";

  if (priority === 1 || msg.is_emergency) {
    containerClass = "bg-red-900/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
    textClass = "text-white font-medium text-sm mt-2";
  } else if (priority === 3) {
    containerClass = "bg-gray-800/40 border-gray-800";
    textClass = "text-gray-400 text-xs mt-2";
    opacityClass = "opacity-70";
  }

  return (
    <div className={`p-4 rounded-xl border mb-3 ${containerClass} ${opacityClass} transition-all duration-300`}>
      {/* Header Row */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="font-bold text-gray-300 tracking-wide text-sm uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badge.className}`}>
            {badge.text}
          </span>
          <span className="text-xs text-gray-500 font-mono">{displayTime}</span>
        </div>
      </div>

      {/* Sender */}
      <div className="flex justify-between items-center mt-1">
        <span className="font-semibold text-gray-400 text-xs">{msg.sender}</span>
      </div>

      {/* Content */}
      <p className={textClass}>{msg.text}</p>
    </div>
  );
});

export default NotificationItem;
