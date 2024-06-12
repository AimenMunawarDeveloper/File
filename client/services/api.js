import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:8080/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const uploadFile = (fileData) =>
  api.post("/files/upload", fileData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchFiles = () => api.get("/files");

export const deleteFile = (id) => api.delete(`/files/${id}`);

export const updateFile = (id, data) => api.put(`/files/${id}`, data);
