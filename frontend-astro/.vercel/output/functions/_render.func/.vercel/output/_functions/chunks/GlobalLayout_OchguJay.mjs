import { c as createComponent, r as renderTemplate, d as renderHead, a as renderComponent, e as renderSlot, b as createAstro } from './astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import 'react';
import { ShoppingCart, LogIn, UserPlus, LogOut } from 'lucide-react';

const Header = ({ title, token, rol }) => {
  return /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-8 py-4 bg-transparent border-b border-amarillo-claro", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/",
        className: "text-2xl font-bold text-amarillo rounded transition px-1 py-0.5 hover:text-amarillo-oscuro focus:outline-none focus:ring-2 focus:ring-amarillo-dorado",
        "aria-label": "Ir al inicio",
        children: title || "Páginas Amarillas 360"
      }
    ),
    /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/marketplace",
          className: "flex items-center gap-2 text-gray-700 hover:text-amber-600 transition",
          children: [
            /* @__PURE__ */ jsx(ShoppingCart, { size: 18 }),
            " Marketplace"
          ]
        }
      ),
      !token ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/iniciar-sesion",
            className: "flex items-center gap-2 text-gray-700 hover:text-amber-600 transition",
            children: [
              /* @__PURE__ */ jsx(LogIn, { size: 18 }),
              " Iniciar Sesión"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/crear-cuenta",
            className: "flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition",
            children: [
              /* @__PURE__ */ jsx(UserPlus, { size: 18 }),
              " Crear Cuenta"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "rol=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/";
          },
          className: "flex items-center gap-2 text-red-600 hover:text-red-800 transition",
          children: [
            /* @__PURE__ */ jsx(LogOut, { size: 18 }),
            " Cerrar Sesión ",
            rol ? `(${rol})` : ""
          ]
        }
      )
    ] })
  ] });
};

const $$Astro = createAstro();
const $$GlobalLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GlobalLayout;
  const { title, auth = false } = Astro2.props;
  const token = Astro2.cookies.get("token")?.value;
  const rol = Astro2.cookies.get("rol")?.value;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderHead()}</head> <body class="bg-fondo-crema min-h-screen flex flex-col"> ${renderComponent($$result, "Header", Header, { "title": "P\xE1ginas Amarillas 360", "token": token, "rol": rol, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/commons/Header", "client:component-export": "default" })} ${auth ? renderTemplate`<main class="flex-1 flex justify-center items-center"> ${renderSlot($$result, $$slots["default"])} </main>` : renderTemplate`<main class="flex-1"> ${renderSlot($$result, $$slots["default"])} </main>`} </body></html>`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/layout/GlobalLayout.astro", void 0);

export { $$GlobalLayout as $ };
