import { useContext } from "react";
import { SocketContext } from "../context/SocketContext.jsx";

export const useSocket = () => {
  const ctx = useContext(SocketContext); // ✅ not SocketProvider
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};
