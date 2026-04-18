import React from "react";

const NotificationItem = React.memo(({ msg }) => {
  // Determine styling based on priority
  // Default to priority 2 if not provided
  const priority = msg.priority || 2; 

  let borderClass = "";
  let textClass = "text-sm";
  let opacityClass = "";

  if (priority === 1 || msg.is_emergency) {
    borderClass = "border-2 border-red-500";
  } else if (priority === 3) {
    borderClass = "border border-gray-700";
    textClass = "text-xs text-gray-500";
    opacityClass = "opacity-50";
  }

  return (
    <div className={`bg-gray-800 p-3 rounded mb-2 ${borderClass} ${opacityClass}`}>
      <div className="flex justify-between">
        <span className="font-bold">{msg.sender}</span>
        {msg.is_emergency && <span className="text-red-500">⚠️</span>}
      </div>
      <p className={textClass}>{msg.text}</p>
      <p className="text-xs text-gray-400">{msg.timestamp}</p>
    </div>
  );
});

export default NotificationItem;
