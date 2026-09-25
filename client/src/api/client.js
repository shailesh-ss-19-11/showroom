import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
    return Promise.reject(err);
  }
);

export function resolveImage(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${UPLOADS_URL}${url}`;
}

export default api;
