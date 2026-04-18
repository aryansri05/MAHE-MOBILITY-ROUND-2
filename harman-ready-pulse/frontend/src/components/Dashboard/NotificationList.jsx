import React, { useMemo } from "react";
import NotificationItem from "./NotificationItem";

export default function NotificationList({ messages }) {
  // Priority 1 messages go to the top, others maintain their original relative order (which is newest first, added via unshift)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const priorityA = a.priority || 2;
      const priorityB = b.priority || 2;
      if ((priorityA === 1 || a.is_emergency) && (priorityB !== 1 && !b.is_emergency)) return -1;
      if ((priorityB === 1 || b.is_emergency) && (priorityA !== 1 && !a.is_emergency)) return 1;
      return 0;
    });
  }, [messages]);

  return (
    <div className="space-y-2 overflow-y-auto h-[60vh]">
      {sortedMessages.map((msg) => (
        <NotificationItem key={msg.id} msg={msg} />
      ))}
    </div>
  );
}