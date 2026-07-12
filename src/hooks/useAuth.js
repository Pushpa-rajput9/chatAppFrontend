import { useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";

export const useAuth = () => {
  const ctx = useContext(AuthContext); // ✅ the actual context object
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
