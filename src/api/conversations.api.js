import { axiosClient } from "./axiosClient.js";

export const conversationsApi = {
  list: () => axiosClient.get("/conversations"),
  create: (payload) => axiosClient.post("/conversations", payload),
  remove: (id) => axiosClient.delete(`/conversations/${id}`),
};
