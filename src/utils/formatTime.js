import { format, isToday, isYesterday } from "date-fns";

/** Short timestamp for a message bubble, e.g. "3:45 PM" */
export const formatMessageTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "h:mm a");
};

/** Friendly label for a conversation list item's last-message time. */
export const formatConversationTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd/MM/yyyy");
};

/** "Last seen ..." label for presence. */
export const formatLastSeen = (date) => {
  if (!date) return "Offline";
  const d = new Date(date);
  if (isToday(d)) return `Last seen today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Last seen yesterday at ${format(d, "h:mm a")}`;
  return `Last seen ${format(d, "dd MMM yyyy")}`;
};
