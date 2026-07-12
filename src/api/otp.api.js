import { axiosClient } from "./axiosClient.js";

export const otpApi = {
  send: (identifier) => axiosClient.post("/otp/send", { identifier }),
  verify: (identifier, otp) => axiosClient.post("/otp/verify", { identifier, otp }),
};
