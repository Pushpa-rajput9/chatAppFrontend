import { useCallback, useEffect, useState } from "react";
import { useSocket } from "./useSocket.js";

export const useKiss = (conversationId) => {
  const { socket } = useSocket();
  const [incomingKiss, setIncomingKiss] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveKiss = (payload) => {
      if (payload.conversationId !== conversationId) return;
      setIncomingKiss(payload);
    };

    socket.on("receiveKiss", handleReceiveKiss);
    return () => socket.off("receiveKiss", handleReceiveKiss);
  }, [socket, conversationId]);

  const sendKiss = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit("sendKiss", { conversationId });
  }, [socket, conversationId]);

  const clearKiss = useCallback(() => setIncomingKiss(null), []);

  return { incomingKiss, sendKiss, clearKiss };
};
