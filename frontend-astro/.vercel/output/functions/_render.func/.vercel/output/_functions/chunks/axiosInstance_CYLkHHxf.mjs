import axios from 'axios';

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Strict`;
}
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

const cookies = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  deleteCookie,
  getCookie,
  setCookie
}, Symbol.toStringTag, { value: 'Module' }));

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1e4
});
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
  }
  return config;
});
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
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance as a, cookies as c };
