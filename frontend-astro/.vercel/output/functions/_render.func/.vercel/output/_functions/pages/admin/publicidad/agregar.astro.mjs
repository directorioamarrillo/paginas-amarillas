/* empty css                                       */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { P as PublicidadForm } from '../../../chunks/PublicidadForm_CkQTVBmm.mjs';
import { $ as $$GlobalLayout } from '../../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Agregar Publicidad" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PublicidadForm", PublicidadForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/publicidad/PublicidadForm", "client:component-export": "PublicidadForm" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/agregar/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/publicidad/agregar/index.astro";
const $$url = "/admin/publicidad/agregar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
