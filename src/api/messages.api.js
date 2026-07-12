import { axiosClient } from "./axiosClient.js";

export const messagesApi = {
  listByConversation: (conversationId) =>
    axiosClient.get(`/messages/${conversationId}`),
  send: (payload) => axiosClient.post("/messages", payload),
  markSeen: (messageId) => axiosClient.patch(`/messages/${messageId}/seen`),
  edit: (messageId, text) =>
    axiosClient.patch(`/messages/${messageId}`, { text }),
  remove: (messageId) => axiosClient.delete(`/messages/${messageId}`),
  bulkRemove: (messageIds) =>
    axiosClient.post("/messages/bulk-delete", { messageIds }),
};
