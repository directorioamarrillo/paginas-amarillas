/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_OchguJay.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Condiciones Generales / Ayuda", "data-astro-cid-amf3srxu": true })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/terminos-condiciones/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/terminos-condiciones/index.astro";
const $$url = "/terminos-condiciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
