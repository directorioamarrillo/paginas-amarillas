import axios from "axios";
import { getCookie, deleteCookie } from "./cookies";

const DEFAULT_BACKEND = "http://127.0.0.1:8000";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.PUBLIC_BACKEND_URL || DEFAULT_BACKEND,
  timeout: 10000,
});

// Request interceptor: attach Authorization header if token cookie exists (client only)
axiosInstance.interceptors.request.use((config) => {
  try {
    if (typeof document !== "undefined") {
      const token = getCookie("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// Response interceptor: handle 401 centrally (client-side redirect and cookie cleanup)
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      try {
        if (typeof document !== "undefined") {
          deleteCookie("token");
          deleteCookie("rol");
          deleteCookie("id_usuario");
          window.location.href = "/iniciar-sesion";
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);
