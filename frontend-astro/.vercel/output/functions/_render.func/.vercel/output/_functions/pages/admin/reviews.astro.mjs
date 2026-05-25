/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, Fragment } from 'react/jsx-runtime';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { T as TableAdmin } from '../../chunks/TableAdmin_D6gs6DlT.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const ReviewAdmin = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    TableAdmin,
    {
      tableName: "Reviews",
      columns: [
        { key: "id_review", label: "ID" },
        { key: "id_empresa", label: "ID Empresa" },
        { key: "id_usuario", label: "ID Usuario" },
        { key: "comentario", label: "Comentario" },
        { key: "calificacion", label: "Calificación" },
        { key: "fecha", label: "Fecha" }
      ],
      endpoint: "/api/reviews",
      primaryKey: "id_review",
      onCreate: () => navigate(),
      onEdit: (id) => navigate(),
      onDelete: (id) => console.log("Deleting review with ID:", id)
    }
  ) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Reviews" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ReviewAdmin", ReviewAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/review/ReviewAdmin", "client:component-export": "ReviewAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/reviews/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/reviews/index.astro";
const $$url = "/admin/reviews";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
