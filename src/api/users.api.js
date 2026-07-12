import { axiosClient } from "./axiosClient.js";

export const usersApi = {
  list: (search = "") => axiosClient.get("/users", { params: { search } }),
  getById: (id) => axiosClient.get(`/users/${id}`),
  update: (id, payload) => axiosClient.patch(`/users/${id}`, payload),
};
