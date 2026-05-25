/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, Fragment } from 'react/jsx-runtime';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { T as TableAdmin } from '../../chunks/TableAdmin_D6gs6DlT.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const DepartamentoAdmin = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    TableAdmin,
    {
      tableName: "Departamentos",
      columns: [
        { key: "id_departamento", label: "ID" },
        { key: "nombre", label: "Nombre" }
      ],
      endpoint: "/api/departamentos",
      primaryKey: "id_departamento",
      onCreate: () => navigate(),
      onEdit: (id) => navigate(),
      onDelete: (id) => console.log("Deleting department with ID:", id)
    }
  ) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Departamentos" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DepartamentoAdmin", DepartamentoAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/departamento/DepartamentoAdmin", "client:component-export": "DepartamentoAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/departamentos/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/departamentos/index.astro";
const $$url = "/admin/departamentos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
