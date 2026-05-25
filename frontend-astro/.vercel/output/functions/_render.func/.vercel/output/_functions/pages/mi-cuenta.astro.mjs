/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_OchguJay.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                 */
import { a as axiosInstance } from '../chunks/axiosInstance_CYLkHHxf.mjs';
import { AxiosError } from 'axios';
import { n as navigate } from '../chunks/router_vN4ZPF0m.mjs';
import fs from 'fs/promises';
import path from 'path';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function EditarUsuario({ defaultValues, idUser }) {
  const [statusForm, setStatusForm] = useState({
    isLoading: false,
    error: null,
    success: false
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true }));
    const formData = new FormData(e.currentTarget);
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
      if (!value) continue;
      formDataObj[key] = value;
    }
    try {
      const { data } = await axiosInstance(`/usuarios/${idUser}`, {
        method: "PUT",
        data: formDataObj
      });
      if (formDataObj.rol) {
        document.cookie = `rol=${formDataObj.rol}; path=/;`;
        const event = new CustomEvent("rolActualizado", {
          detail: { nuevoRol: formDataObj.rol }
        });
        window.dispatchEvent(event);
      }
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || "Ocurrió un error inesperado.";
        setStatusForm((prev) => ({
          ...prev,
          isLoading: false,
          error: message
        }));
      }
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "content-form", onSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "nombre", children: "Nombre" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "nombre",
          required: true,
          id: "nombre",
          placeholder: "Nombre",
          defaultValue: defaultValues.nombre
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "apellido", children: "Apellidos" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "apellido",
          required: true,
          id: "apellido",
          placeholder: "Apellidos",
          defaultValue: defaultValues.apellido
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "correo_electronico", children: "Correo electrónico" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          name: "correo",
          required: true,
          id: "correo_electronico",
          placeholder: "Correo electrónico",
          defaultValue: defaultValues.correo
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "rol", children: "Rol" }),
      /* @__PURE__ */ jsxs("select", { name: "rol", id: "rol", defaultValue: defaultValues.rol, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione" }),
        /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" }),
        /* @__PURE__ */ jsx("option", { value: "user", children: "User" })
      ] })
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: "Guardar cambios" }) })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const token = (Astro2.cookies.get("token") || {})?.value;
  if (!token) {
    return Astro2.redirect("/");
  }
  const id_usuario = (Astro2.cookies.get("id_usuario") || {})?.value || "";
  let data = null;
  try {
    const resp = await axiosInstance(`/usuarios/${id_usuario}`, { method: "GET" });
    data = resp.data;
  } catch (err) {
    const msg = err && (err.message || err.toString()) || "Error al conectar con el backend.";
    console.warn("Error al cargar usuario desde API:", msg);
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "usuarios.json");
      const content = await fs.readFile(mockPath, "utf-8");
      const all = JSON.parse(content);
      data = all.find((u) => String(u.id_usuario) === String(id_usuario)) || all[0] || null;
      console.log("Usando mock usuario ->", mockPath);
    } catch (me) {
      console.warn("No hay mock de usuarios:", me);
      data = null;
    }
  }
  console.log({ data });
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Mi cuenta", "data-astro-cid-r3ks7bnu": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="content-page" data-astro-cid-r3ks7bnu> <section data-astro-cid-r3ks7bnu> <h2 data-astro-cid-r3ks7bnu>Mi cuenta</h2> ${renderComponent($$result2, "EditarUsuario", EditarUsuario, { "defaultValues": data, "idUser": id_usuario, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/Formularios/EditarUsuario", "client:component-export": "EditarUsuario", "data-astro-cid-r3ks7bnu": true })} </section> </div> ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/mi-cuenta/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/mi-cuenta/index.astro";
const $$url = "/mi-cuenta";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
