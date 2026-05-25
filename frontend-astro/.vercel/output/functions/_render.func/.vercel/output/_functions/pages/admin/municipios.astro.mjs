/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, Fragment } from 'react/jsx-runtime';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { T as TableAdmin } from '../../chunks/TableAdmin_D6gs6DlT.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const MunicipioAdmin = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    TableAdmin,
    {
      tableName: "Munipios",
      columns: [
        { key: "id_municipio", label: "ID" },
        { key: "nombre", label: "Nombre" },
        { key: "id_departamento", label: "ID Departamento" }
      ],
      endpoint: "/api/municipios",
      primaryKey: "id_municipio",
      onCreate: () => navigate(),
      onEdit: (id) => navigate(),
      onDelete: (id) => console.log("Deleting municipios with ID:", id)
    }
  ) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Municipios" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MunicipioAdmin", MunicipioAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/municipio/MunicipioAdmin", "client:component-export": "MunicipioAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/municipios/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/municipios/index.astro";
const $$url = "/admin/municipios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
