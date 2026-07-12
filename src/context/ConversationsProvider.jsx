import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationsContext } from "./conversationsContext.js";
import { conversationsApi } from "../api/conversations.api.js";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Single shared conversation list for the whole app. Previously each
 * screen that needed conversations (sidebar, chat window) called its own
 * copy of this logic, so deleting/creating a chat in one place didn't
 * update the other - this Provider fixes that by being the one source
 * of truth, consumed everywhere via useConversations().
 */
export const ConversationsProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await conversationsApi.list();
      setConversations(res.data.conversations || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // Bump a conversation to the top and refresh its preview when a message arrives.
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === message.conversationId);
        if (idx === -1) {
          refresh();
          return prev;
        }
        const updated = {
          ...prev[idx],
          lastMessageInfo: message,
          updatedAt: message.createdAt,
        };
        const next = [...prev];
        next.splice(idx, 1);
        return [updated, ...next];
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, refresh]);

  const createConversation = useCallback(
    async (participantIds, options = {}) => {
      const res = await conversationsApi.create({ participantIds, ...options });
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === res.data.conversation._id);
        return exists ? prev : [res.data.conversation, ...prev];
      });
      return res.data.conversation;
    },
    [],
  );

  const removeConversation = useCallback(async (id) => {
    await conversationsApi.remove(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  /**
   * Drops a conversation from local state without calling the delete API -
   * used when we discover a conversation no longer exists server-side
   * (e.g. the other participant deleted it), so the sidebar stops showing
   * a dead entry.
   */
  const purgeMissingConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      loading,
      error,
      refresh,
      createConversation,
      removeConversation,
      purgeMissingConversation,
      currentUserId: user?.id,
    }),
    [
      conversations,
      loading,
      error,
      refresh,
      createConversation,
      removeConversation,
      purgeMissingConversation,
      user?.id,
    ],
  );

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};
