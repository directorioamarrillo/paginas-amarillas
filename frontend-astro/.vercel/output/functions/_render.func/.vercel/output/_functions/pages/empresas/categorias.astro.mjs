/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef } from 'react';
import { MdBusiness } from 'react-icons/md';
/* empty css                                    */
import { a as axiosInstance } from '../../chunks/axiosInstance_CYLkHHxf.mjs';
import { AxiosError } from 'axios';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
import fs from 'fs/promises';
import path from 'path';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const initialValue = {
  descripcion: "",
  nombre: ""
};
function ListadoCategorias({ categorias }) {
  const [list, setList] = useState(categorias);
  const [formData, setFormData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [onDeleting, setOnDeleting] = useState(null);
  const form = useRef(null);
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataUser = new FormData(e.currentTarget);
    const formDataObj = {};
    for (let [key, value] of formDataUser.entries()) {
      if (!value) continue;
      formDataObj[key] = value;
    }
    console.log(formDataObj);
    try {
      if (!isEdit) {
        const { data } = await axiosInstance(`/categorias/`, {
          method: "POST",
          data: formDataObj
        });
        setList((prev) => [...prev, data]);
      } else {
        const { data } = await axiosInstance(
          `/categorias/${formData.id_categoria}`,
          {
            method: "PUT",
            data: formDataObj
          }
        );
        const setDataById = list.map((item) => {
          if (item.id_categoria === formData.id_categoria) {
            item.descripcion = formDataObj.descripcion;
            item.nombre = formDataObj.nombre;
          }
          return item;
        });
        setList(setDataById);
        setIsEdit(false);
        setFormData(initialValue);
      }
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        error.response?.data?.detail || "Ocurrio un error inesperado.";
      }
    } finally {
      if (form.current) {
        form.current.reset();
      }
    }
  };
  const onDelete = async (id) => {
    setOnDeleting(id);
    await axiosInstance(`/categorias/${id}`, {
      method: "DELETE"
    });
    setList(list.filter((item) => item.id_categoria !== id));
    setOnDeleting(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "content-crud", children: [
    /* @__PURE__ */ jsxs("form", { className: "content-form", onSubmit, ref: form, children: [
      /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "nombre", style: { display: "flex", alignItems: "center", gap: "0.3rem" }, children: [
          /* @__PURE__ */ jsx(MdBusiness, { style: { fontSize: "1.1rem", color: "#FFC107" } }),
          " Nombre"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "nombre",
            required: true,
            id: "nombre",
            placeholder: "Nombre",
            defaultValue: formData.nombre
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "descripcion", children: "Descripción" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "descripcion",
            required: true,
            id: "descripcion",
            placeholder: "Descripcion",
            defaultValue: formData.descripcion
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "content-submit", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: isLoading, children: "Guardar" }),
        isEdit && /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "cancel-action",
            onClick: () => {
              setIsEdit(false);
              setFormData(initialValue);
              if (form.current) {
                form.current.reset();
              }
            },
            children: "Cancelar"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "table_component", children: [
      /* @__PURE__ */ jsxs("table", { children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "Nombre" }),
          /* @__PURE__ */ jsx("th", { children: "Descripción" }),
          /* @__PURE__ */ jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: !!list.length ? list.map((categoria) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { children: [
            categoria.nombre,
            " "
          ] }),
          /* @__PURE__ */ jsx("td", { children: categoria.descripcion }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "content-action-table", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setIsEdit(true);
                  setFormData(categoria);
                  if (form.current) {
                    form.current.reset();
                  }
                },
                children: /* @__PURE__ */ jsxs(
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
                    className: "lucide lucide-pencil",
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }),
                      /* @__PURE__ */ jsx("path", { d: "m15 5 4 4" })
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => onDelete(categoria.id_categoria), children: onDeleting === categoria.id_categoria ? /* @__PURE__ */ jsx(
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
            ) : /* @__PURE__ */ jsxs(
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
                className: "lucide lucide-trash",
                children: [
                  /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
                  /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
                  /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
                ]
              }
            ) })
          ] }) })
        ] }, categoria.id_categoria)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 3, children: "Sin registros" }) }) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className: "cancel-action btn-regresar",
          onClick: () => {
            history.back();
          },
          children: "Regresar"
        }
      )
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  if (!rol || rol !== "admin") {
    return Astro2.redirect("/");
  }
  let dataCategoria = [];
  try {
    const resp = await axiosInstance("/api/categorias", { method: "GET", params: { skip: 0, limit: 100 } });
    dataCategoria = resp.data;
  } catch (e) {
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "categorias.json");
      const content = await fs.readFile(mockPath, "utf-8");
      dataCategoria = JSON.parse(content);
      console.log("Fallback categorias ->", mockPath);
    } catch (me) {
      console.warn("No hay mock de categorias", me);
      dataCategoria = [];
    }
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Categorias", "data-astro-cid-5inhdleu": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="content-form-crear-empresa" data-astro-cid-5inhdleu> <section data-astro-cid-5inhdleu> <h2 data-astro-cid-5inhdleu>Categorias</h2> ${renderComponent($$result2, "ListadoCategorias", ListadoCategorias, { "categorias": dataCategoria || [], "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/ListadoCategorias", "client:component-export": "ListadoCategorias", "data-astro-cid-5inhdleu": true })} </section> </div> ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/categorias/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/categorias/index.astro";
const $$url = "/empresas/categorias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
