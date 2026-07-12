import { useContext } from "react";
import { ConversationsContext } from "../context/conversationsContext.js";

export const useConversations = () => {
  const ctx = useContext(ConversationsContext);
  if (!ctx)
    throw new Error(
      "useConversations must be used within a ConversationsProvider",
    );
  return ctx;
};
