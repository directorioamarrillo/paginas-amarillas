/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
import { a as axiosInstance } from '../../chunks/axiosInstance_CYLkHHxf.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                    */
import { AxiosError } from 'axios';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import dayjs from 'dayjs';
/* empty css                                    */
import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../renderers.mjs';

function EnviarCalificacion({ id_usuario, id_empresa }) {
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
      formDataObj[key] = value;
    }
    try {
      const { data } = await axiosInstance("/api/reviews", {
        method: "POST",
        data: {
          ...formDataObj,
          calificacion: +formDataObj.calificacion,
          id_empresa,
          id_usuario
        }
      });
      console.log(data);
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || "Ocurrio un error inesperado.";
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
      /* @__PURE__ */ jsx("label", { htmlFor: "calificacion", children: "Calificación" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          name: "calificacion",
          required: true,
          id: "calificacion",
          min: 1,
          max: 5,
          placeholder: "Calificación"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "comentario", children: "Comentario" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          name: "comentario",
          required: true,
          id: "comentario",
          placeholder: "Comentario",
          rows: 4
        }
      )
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: "Enviar" }) })
  ] });
}

function BotonEliminarEmpresa({ id }) {
  const [isLoading, setIsLoading] = useState(false);
  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axiosInstance(`/empresas/${id}`, {
        method: "DELETE"
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("button", { className: "btn-delete", onClick: onDelete, disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "lucide lucide-loader-circle spinner",
      children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
    }
  ) : "Eliminar" });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { id } = Astro2.params;
  const id_usuario = (Astro2.cookies.get("id_usuario") || {})?.value;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  const token = (Astro2.cookies.get("token") || {})?.value;
  let empresa = null;
  let reviews = [];
  let error = null;
  let promedio = null;
  try {
    const { data } = await axiosInstance.get(`/api/empresas/${id}`);
    empresa = data;
  } catch (err) {
    const msg = err && (err.message || err.toString()) || "Error al conectar con el backend.";
    console.warn("Error al cargar empresa desde API:", msg);
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "empresas.json");
      const content = await fs.readFile(mockPath, "utf-8");
      const all = JSON.parse(content);
      empresa = all.find((it) => String(it.id_empresa) === String(id)) || null;
      if (!empresa) {
        error = "Empresa no encontrada (mock)";
      }
      console.log("Usando mock empresa:", mockPath);
    } catch (me) {
      console.error("No se pudo cargar mock de empresa:", me);
      error = err.message || "Error al cargar empresa";
    }
  }
  try {
    const { data: dataReview } = await axiosInstance.get(`/api/reviews/${id}`);
    reviews = dataReview;
  } catch (err) {
    const msg = err && (err.message || err.toString()) || "Error al conectar con el backend.";
    console.warn("Error al cargar reviews desde API:", msg);
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", `reviews_${id}.json`);
      const content = await fs.readFile(mockPath, "utf-8");
      reviews = JSON.parse(content);
      console.log("Usando mock reviews:", mockPath);
    } catch (me) {
      console.warn("No hay mock de reviews para esta empresa, se usa lista vac\xEDa", me);
      reviews = [];
    }
  }
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.calificacion || 0), 0);
    promedio = (sum / reviews.length).toFixed(1);
  }
  let puedeComentar = false;
  if (!!id_usuario && !reviews.find((review) => review.id_usuario.toString() === id_usuario))
    puedeComentar = true;
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": empresa?.nombre || "Empresa" }, { "default": ($$result2) => renderTemplate`${error ? renderTemplate`${maybeRenderHead()}<div class="max-w-4xl mx-auto py-12 px-6"> <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"> <p class="text-red-600 text-lg">Error: ${error}</p> <a href="/" class="inline-block mt-4 text-blue-600 hover:underline">Volver al inicio</a> </div> </div>` : empresa ? renderTemplate`<div class="max-w-6xl mx-auto py-12 px-6"> <!-- Botones de admin --> ${rol === "admin" && renderTemplate`<div class="flex justify-end gap-3 mb-6"> <a${addAttribute(`/admin/empresas/editar/${id}`, "href")} class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
✏️ Editar
</a> ${renderComponent($$result2, "BotonEliminarEmpresa", BotonEliminarEmpresa, { "id": id || "", "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/commons/BotonEliminarEmpresa", "client:component-export": "BotonEliminarEmpresa" })} </div>`} <!-- Hero de empresa --> <div class="bg-gradient-to-br from-amarillo-claro to-amarillo-medio rounded-2xl shadow-xl overflow-hidden mb-8"> <div class="grid md:grid-cols-2 gap-8 p-8"> <!-- Imagen --> <div class="flex items-center justify-center"> ${empresa.logo ? renderTemplate`<img${addAttribute(empresa.logo, "src")}${addAttribute(empresa.nombre, "alt")} class="w-full max-w-md h-80 object-cover rounded-xl shadow-lg">` : renderTemplate`<div class="w-full max-w-md h-80 bg-gray-200 rounded-xl flex items-center justify-center"> <span class="text-8xl">🏢</span> </div>`} </div> <!-- Información principal --> <div class="flex flex-col justify-center"> <h1 class="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3"> ${empresa.nombre} ${promedio && renderTemplate`<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 text-sm font-semibold">
⭐ ${promedio} </span>`} </h1> ${promedio && renderTemplate`<p class="text-sm text-gray-500 mb-4">Promedio de ${reviews.length} reseña(s)</p>`} <div class="space-y-3"> <div class="flex items-start gap-3"> <span class="text-2xl">🏷️</span> <div> <p class="text-sm text-gray-500 font-medium">NIT</p> <p class="text-lg text-gray-800">${empresa.nit}</p> </div> </div> <div class="flex items-start gap-3"> <span class="text-2xl">📧</span> <div> <p class="text-sm text-gray-500 font-medium">Correo</p> <a${addAttribute(`mailto:${empresa.correo}`, "href")} class="text-lg text-blue-600 hover:underline"> ${empresa.correo} </a> </div> </div> <div class="flex items-start gap-3"> <span class="text-2xl">📞</span> <div> <p class="text-sm text-gray-500 font-medium">Teléfono</p> <a${addAttribute(`tel:${empresa.telefono}`, "href")} class="text-lg text-blue-600 hover:underline"> ${empresa.telefono} </a> </div> </div> <div class="flex items-start gap-3"> <span class="text-2xl">📍</span> <div> <p class="text-sm text-gray-500 font-medium">Dirección</p> <p class="text-lg text-gray-800">${empresa.direccion}</p> </div> </div> <div class="flex gap-3 mt-4"> ${empresa.categoria && renderTemplate`<a${addAttribute(`/marketplace?categoria=${empresa.id_categoria}`, "href")} class="inline-flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium transition">
🏷️ ${empresa.categoria.nombre} </a>`} ${empresa.municipio && renderTemplate`<a${addAttribute(`/marketplace?municipio=${empresa.id_municipio}`, "href")} class="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition">
📍 ${empresa.municipio.nombre} </a>`} </div> </div> </div> </div> </div> <!-- Mapa de geolocalización --> <div class="mb-10"> <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">🗺️ Ubicación</h2> ${renderComponent($$result2, "MapEmpresa", null, { "direccion": empresa.direccion, "municipio": empresa.municipio?.nombre, "nombre": empresa.nombre, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/commons/MapEmpresa", "client:component-export": "default" })} <p class="text-xs text-gray-400 mt-2">Fuente: OpenStreetMap / Nominatim</p> <div class="mt-4 flex flex-wrap gap-3"> <a${addAttribute(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.direccion + " " + (empresa.municipio?.nombre || "") + " Colombia")}`, "href")} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
📍 Ver en Google Maps
</a> </div> </div> <!-- Sección de reseñas --> <div class="bg-white rounded-2xl shadow-lg p-8 mb-8"> <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
⭐ Calificaciones y Reseñas
</h2> ${reviews.length > 0 ? renderTemplate`<div class="grid md:grid-cols-2 gap-6"> ${reviews.map((review) => renderTemplate`<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"> <div class="flex items-center justify-between mb-3"> <h3 class="font-bold text-lg text-gray-900"> ${review.id_usuario.toString() === id_usuario ? "T\xFA" : review.usuario.nombre} </h3> <div class="flex items-center gap-1"> ${[...Array(5)].map((_, i) => renderTemplate`<span${addAttribute(i < review.calificacion ? "text-yellow-400" : "text-gray-300", "class")}>
★
</span>`)} <span class="ml-2 text-sm font-semibold text-gray-700"> ${review.calificacion}/5
</span> </div> </div> <p class="text-sm text-gray-500 mb-3">
📅 ${dayjs(review.fecha).subtract(5, "hours").format("DD/MM/YYYY HH:mm")} </p> <p class="text-gray-700 leading-relaxed"> ${review.comentario} </p> </div>`)} </div>` : renderTemplate`<div class="text-center py-12 bg-gray-50 rounded-xl"> <span class="text-6xl block mb-4">💬</span> <p class="text-gray-500 text-lg">Aún no hay calificaciones para esta empresa</p> <p class="text-gray-400 text-sm mt-2">¡Sé el primero en dejar una reseña!</p> </div>`} </div> <!-- Formulario de calificación --> ${puedeComentar && renderTemplate`<div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8"> <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
✍️ Deja tu calificación
</h2> ${renderComponent($$result2, "EnviarCalificacion", EnviarCalificacion, { "id_usuario": id_usuario, "id_empresa": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/Formularios/EnviarCalificacion", "client:component-export": "EnviarCalificacion" })} </div>`} ${!token && renderTemplate`<div class="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center"> <span class="text-5xl block mb-4">🔐</span> <p class="text-gray-700 text-lg mb-6">
Inicia sesión para dejar una calificación y compartir tu experiencia
</p> <a href="/iniciar-sesion" class="inline-block px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-md">
Iniciar Sesión
</a> </div>`} </div>` : null}` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/[id]/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/[id]/index.astro";
const $$url = "/empresas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
