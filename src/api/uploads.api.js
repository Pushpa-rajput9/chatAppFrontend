import { axiosClient } from "./axiosClient.js";

export const uploadsApi = {
  /** Uploads a single File/Blob and returns { url, mediaType, ... } */
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
  },
};
