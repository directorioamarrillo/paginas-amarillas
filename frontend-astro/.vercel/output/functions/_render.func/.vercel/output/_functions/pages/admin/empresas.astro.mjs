/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, Fragment } from 'react/jsx-runtime';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { T as TableAdmin } from '../../chunks/TableAdmin_D6gs6DlT.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const EmpresaAdmin = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    TableAdmin,
    {
      tableName: "Empresas",
      columns: [
        { key: "id_empresa", label: "ID" },
        { key: "nombre", label: "Nombre" },
        { key: "nit", label: "NIT" },
        { key: "correo", label: "Correo" },
        { key: "direccion", label: "Dirección" },
        { key: "telefono", label: "Teléfono" },
        { key: "id_categoria", label: "ID Categoría" },
        { key: "id_municipio", label: "ID Municipio" },
        { key: "logo", label: "Logo" }
      ],
      endpoint: "/api/empresas",
      primaryKey: "id_empresa",
      onCreate: () => navigate(),
      onEdit: (id) => navigate(),
      onDelete: (id) => console.log("Deleting empresa with ID:", id)
    }
  ) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Empresas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EmpresaAdmin", EmpresaAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/empresa/EmpresaAdmin", "client:component-export": "EmpresaAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/empresas/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/empresas/index.astro";
const $$url = "/admin/empresas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
