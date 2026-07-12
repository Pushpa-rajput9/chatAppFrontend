import { useCallback, useEffect, useState } from "react";
import { messagesApi } from "../api/messages.api.js";
import { useSocket } from "./useSocket.js";

/**
 * Loads and streams the messages for a single conversation. Joins/leaves
 * the matching socket room automatically as the conversation changes.
 */
export const useMessages = (conversationId) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!conversationId) return undefined;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await messagesApi.listByConversation(conversationId);
        if (!cancelled) setMessages(res.data.messages || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          // A 404 here means the conversation no longer exists server-side
          // (e.g. the other participant deleted it) - surface that distinctly
          // so the UI can clean up the stale sidebar entry.
          if (err.message?.toLowerCase().includes("not found"))
            setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    socket.emit("joinRoom", conversationId);

    const handleNewMessage = (message) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message],
      );
    };

    const handleSeen = ({ conversationId: convoId, messageId, seenBy }) => {
      if (convoId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, seenBy: [...new Set([...(m.seenBy || []), seenBy])] }
            : m,
        ),
      );
    };

    const handleEdited = ({ message }) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m)),
      );
    };

    const handleDeleted = ({ conversationId: convoId, messageIds }) => {
      if (convoId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id)
            ? {
                ...m,
                isDeleted: true,
                text: "",
                mediaUrl: null,
                mediaType: null,
              }
            : m,
        ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleSeen);
    socket.on("messageEdited", handleEdited);
    socket.on("messagesDeleted", handleDeleted);

    return () => {
      socket.emit("leaveRoom", conversationId);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleSeen);
      socket.off("messageEdited", handleEdited);
      socket.off("messagesDeleted", handleDeleted);
    };
  }, [socket, conversationId]);

  const sendMessage = useCallback(
    async (text, media) => {
      const res = await messagesApi.send({
        conversationId,
        text,
        mediaUrl: media?.url,
        mediaType: media?.type,
      });
      setMessages((prev) =>
        prev.some((m) => m._id === res.data.message._id)
          ? prev
          : [...prev, res.data.message],
      );
      return res.data.message;
    },
    [conversationId],
  );

  const markSeen = useCallback(
    (messageId) => messagesApi.markSeen(messageId),
    [],
  );

  const editMessage = useCallback(async (messageId, text) => {
    const res = await messagesApi.edit(messageId, text);
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? res.data.message : m)),
    );
    return res.data.message;
  }, []);

  const deleteMessage = useCallback(async (messageId) => {
    await messagesApi.remove(messageId);
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, text: "", mediaUrl: null, mediaType: null }
          : m,
      ),
    );
  }, []);

  const deleteMessages = useCallback(async (messageIds) => {
    await messagesApi.bulkRemove(messageIds);
    setMessages((prev) =>
      prev.map((m) =>
        messageIds.includes(m._id)
          ? { ...m, isDeleted: true, text: "", mediaUrl: null, mediaType: null }
          : m,
      ),
    );
  }, []);

  return {
    messages,
    loading,
    error,
    notFound,
    sendMessage,
    markSeen,
    editMessage,
    deleteMessage,
    deleteMessages,
  };
};
