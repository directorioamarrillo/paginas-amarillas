/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, Fragment } from 'react/jsx-runtime';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { T as TableAdmin } from '../../chunks/TableAdmin_D6gs6DlT.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const PublicidadAdmin = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    TableAdmin,
    {
      tableName: "Publicidad",
      columns: [
        { key: "id_publicidad", label: "ID Publicidad" },
        { key: "id_empresa", label: "ID Empresa" },
        { key: "tipo_anuncio", label: "Tipo de Anuncio" },
        { key: "descripcion", label: "Descripción" },
        { key: "duracion", label: "Duración" },
        { key: "fecha_inicio", label: "Fecha de Inicio" },
        { key: "fecha_fin", label: "Fecha de Fin" }
      ],
      endpoint: "/api/publicidades",
      primaryKey: "id_publicidad",
      onCreate: () => navigate(),
      onEdit: (id) => navigate(),
      onDelete: (id) => console.log("Deleting publicidad with ID:", id)
    }
  ) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Publicidad" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PublicidadAdmin", PublicidadAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/publicidad/PublicidadAdmin", "client:component-export": "PublicidadAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/index.astro";
const $$url = "/admin/publicidad";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
