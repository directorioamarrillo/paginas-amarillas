/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_OchguJay.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                 */
import axios from 'axios';
import { a as axiosInstance } from '../chunks/axiosInstance_CYLkHHxf.mjs';
export { renderers } from '../renderers.mjs';

function InicioSesion() {
  const [statusForm, setStatusForm] = useState({
    isLoading: false,
    error: null,
    success: false
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true, error: null }));
    const formData = new FormData(e.currentTarget);
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }
    if (!formDataObj.correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formDataObj.correo)) {
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: "Por favor ingresa un correo válido." }));
      return;
    }
    if (!formDataObj.password || formDataObj.password.length < 6) {
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: "La contraseña debe tener al menos 6 caracteres." }));
      return;
    }
    try {
      const { data } = await axiosInstance("/api/signin", {
        method: "POST",
        data: formDataObj
      });
      console.log({ data });
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      try {
        const setCookieFn = (await import('../chunks/axiosInstance_CYLkHHxf.mjs').then(n => n.c)).setCookie;
        setCookieFn("token", data.access_token, 7);
        setCookieFn("rol", data.rol, 7);
        setCookieFn("id_usuario", String(data.id_usuario), 7);
      } catch (e2) {
        document.cookie = `token=${data.access_token}; path=/; SameSite=Strict`;
        document.cookie = `rol=${data.rol}; path=/; SameSite=Strict`;
        document.cookie = `id_usuario=${data.id_usuario}; path=/; SameSite=Strict`;
      }
      window.location.href = "/";
    } catch (error) {
      console.error("InicioSesion error:", error);
      const isDev = import.meta?.env?.DEV ?? false;
      const forceDemo = isDev || import.meta?.env?.PUBLIC_FORCE_DEMO === "true";
      const isAxios = axios.isAxiosError(error);
      const noResponse = isAxios ? !error.response : true;
      if (noResponse && forceDemo) {
        const fakeData = {
          access_token: "fake-token-12345",
          rol: "user",
          id_usuario: 9999
        };
        try {
          const setCookieFn = (await import('../chunks/axiosInstance_CYLkHHxf.mjs').then(n => n.c)).setCookie;
          setCookieFn("token", fakeData.access_token, 7);
          setCookieFn("rol", fakeData.rol, 7);
          setCookieFn("id_usuario", String(fakeData.id_usuario), 7);
        } catch (e2) {
          document.cookie = `token=${fakeData.access_token}; path=/; SameSite=Strict`;
          document.cookie = `rol=${fakeData.rol}; path=/; SameSite=Strict`;
          document.cookie = `id_usuario=${fakeData.id_usuario}; path=/; SameSite=Strict`;
        }
        setStatusForm((prev) => ({ ...prev, isLoading: false, success: true, error: null }));
        window.location.href = "/";
        return;
      }
      if (isAxios && error.response) {
        const message = error.response?.data?.detail || error.message || "Ocurrió un error inesperado.";
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: message }));
        return;
      }
      if (noResponse && !forceDemo) {
        setStatusForm((prev) => ({ ...prev, isLoading: false, error: "No hay conexión con el backend. Inicia el servidor API o activa el modo demo." }));
        return;
      }
      const genericMsg = error?.message || "Ocurrió un error inesperado.";
      setStatusForm((prev) => ({ ...prev, isLoading: false, error: genericMsg }));
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "content-form", onSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "correo_electronico", children: "Correo electrónico" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          name: "correo",
          required: true,
          id: "correo_electronico",
          placeholder: "ejemplo@correo.com"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "contrasenia", children: "Contraseña" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          name: "password",
          required: true,
          id: "contrasenia",
          placeholder: "Ingresa tu contraseña"
        }
      )
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    statusForm.success && /* @__PURE__ */ jsx("span", { className: "success-form", children: "¡Inicio de sesión exitoso! Redirigiendo..." }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: statusForm.isLoading ? "Iniciando sesión..." : "Iniciar sesión" }) }),
    /* @__PURE__ */ jsxs("div", { className: "content-login-link", children: [
      /* @__PURE__ */ jsx("span", { children: "¿No tienes una cuenta?" }),
      /* @__PURE__ */ jsx("a", { href: "/crear-cuenta", children: "Crear cuenta" })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Iniciar sesi\xF3n", "auth": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="flex flex-col items-center justify-center py-12"> <h2 class="text-2xl font-bold mb-6">Iniciar sesión</h2> ${renderComponent($$result2, "InicioSesion", InicioSesion, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/Formularios/InicioSesion", "client:component-export": "InicioSesion" })} </section> ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/iniciar-sesion/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/iniciar-sesion/index.astro";
const $$url = "/iniciar-sesion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
