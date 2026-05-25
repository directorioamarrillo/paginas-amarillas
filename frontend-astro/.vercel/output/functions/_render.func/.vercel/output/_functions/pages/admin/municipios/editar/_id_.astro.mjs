/* empty css                                          */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro } from '../../../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { M as MunicipioForm } from '../../../../chunks/MunicipioForm_irhoe_az.mjs';
import { $ as $$GlobalLayout } from '../../../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { params } = Astro2;
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Editar Municipio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MunicipioForm", MunicipioForm, { "id_municipio": params.id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/municipio/MunicipioForm", "client:component-export": "MunicipioForm" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/municipios/editar/[id]/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/municipios/editar/[id]/index.astro";
const $$url = "/admin/municipios/editar/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
