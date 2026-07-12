import { axiosClient } from "./axiosClient.js";

export const statusesApi = {
  list: () => axiosClient.get("/statuses"),
  create: (payload) => axiosClient.post("/statuses", payload),
  markViewed: (id) => axiosClient.patch(`/statuses/${id}/view`),
  remove: (id) => axiosClient.delete(`/statuses/${id}`),
};
