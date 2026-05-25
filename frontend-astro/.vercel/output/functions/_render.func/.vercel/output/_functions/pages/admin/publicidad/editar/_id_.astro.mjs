/* empty css                                          */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro } from '../../../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { P as PublicidadForm } from '../../../../chunks/PublicidadForm_CkQTVBmm.mjs';
import { $ as $$GlobalLayout } from '../../../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { params } = Astro2;
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Editar Publicidad" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PublicidadForm", PublicidadForm, { "id_publicidad": params.id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/publicidad/PublicidadForm", "client:component-export": "PublicidadForm" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/editar/[id]/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/editar/[id]/index.astro";
const $$url = "/admin/publicidad/editar/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
