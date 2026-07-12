import { SOCKET_URL } from "./constants.js";

/**
 * Uploaded files are served from the backend's root (e.g. /uploads/xyz.jpg),
 * not from the /api/v1 prefix. This turns that relative path into a full URL.
 */
export const resolveMediaUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SOCKET_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
