import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FileSpreadsheet,
  BookOpen,
  BarChart3,
  Rocket,
  Laptop,
  Landmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Search,
} from "lucide-react";

/* ──────────────── DATA ──────────────── */

const sections = [
  {
    id: "plantillas",
    title: "Plantillas Empresariales",
    icon: FileSpreadsheet,
    color: "primary",
    items: [
      {
        name: "Flujo de Caja — Bancolombia",
        desc: "Herramienta gratuita para controlar ingresos y gastos empresariales.",
        url: "https://www.bancolombia.com/negocios/herramientas/flujo-caja",
        tag: "Excel",
      },
      {
        name: "Flujo de Caja Real y Presupuestado — Actualícese",
        desc: "Plantilla Excel con gráficos y alertas.",
        url: "https://actualicese.com/formato-de-flujo-de-caja-real-y-presupuestado/",
        tag: "Excel",
      },
      {
        name: "Plantillas Excel para Pymes — Holded",
        desc: "Inventario, facturación, gastos, contabilidad y más.",
        url: "https://www.holded.com/es/blog/plantillas-de-excel-gratis",
        tag: "Pack",
      },
      {
        name: "Plantilla Flujo de Caja — Quipu",
        desc: "Descarga gratuita de plantillas de flujo de caja.",
        url: "https://getquipu.com/blog/plantillas-excel-de-flujo-de-caja-descarga-gratis/",
        tag: "Excel",
      },
    ],
  },
  {
    id: "guias",
    title: "Guías de Digitalización",
    icon: BookOpen,
    color: "secondary",
    items: [
      {
        name: "Plan de Digitalización de MiPyme — MinTIC",
        desc: "Incluye: página web, geolocalización, herramientas digitales.",
        url: "https://mintic.gov.co/portal/715/w3-article-198870.html",
        tag: "Gobierno",
      },
      {
        name: "Hacia la Transformación Digital de las MiPymes",
        desc: "Publicación oficial CCCE.",
        url: "https://ccce.org.co/noticias/hacia-la-transformacion-digital-de-las-mipymes-en-colombia/",
        tag: "CCCE",
      },
      {
        name: "Transformación Digital para MiPymes Colombia",
        desc: "Guía empresarial completa.",
        url: "https://finnovec.co/transformacion-digital-mipymes-colombia/",
        tag: "Guía",
      },
    ],
  },
  {
    id: "estudios",
    title: "Estudios y Estadísticas",
    icon: BarChart3,
    color: "violet",
    items: [
      {
        name: "Oportunidades y Desafíos para la Digitalización de las MiPymes",
        desc: "Investigación académica colombiana.",
        url: "https://www.scielo.org.co/scielo.php?pid=S1657-62762024000200128&script=sci_arttext",
        tag: "Académico",
      },
      {
        name: "Estrategia Nacional Digital Colombia",
        desc: "Documento oficial DNP 2023-2026.",
        url: "https://dnp.gov.co/Prensa_/Noticias/Paginas/gobierno-del-cambio-presenta-estrategia-nacional-digital-2023-2026.aspx",
        tag: "DNP",
      },
    ],
  },
  {
    id: "convocatorias",
    title: "Convocatorias y Programas",
    icon: Rocket,
    color: "emerald",
    items: [
      {
        name: "MiPyMES Colombia — Portal oficial",
        desc: "Portal oficial del gobierno para micro, pequeñas y medianas empresas.",
        url: "https://www.mipymes.gov.co/",
        tag: "Portal",
      },
      {
        name: "Programas para fortalecer MiPymes — MinCIT",
        desc: "Programas: ZASCA, ALDEA, EnCadena.",
        url: "https://www.mincit.gov.co/prensa/noticias/industria/programas-para-potenciar-productividad-mipymes",
        tag: "MinCIT",
      },
      {
        name: "Fondo de Modernización e Innovación MiPyME",
        desc: "Fondo para modernización e innovación empresarial.",
        url: "https://www.mincit.gov.co/servicio-ciudadano/preguntas-frecuentes/mipymes",
        tag: "Fondo",
      },
      {
        name: "Tu Negocio en Línea — MinTIC",
        desc: "Incluye: tienda virtual, dominio, hosting, capacitación.",
        url: "https://tunegocioenlinea.mintic.gov.co/",
        tag: "MinTIC",
      },
    ],
  },
  {
    id: "herramientas",
    title: "Herramientas Digitales",
    icon: Laptop,
    color: "sky",
    items: [
      {
        name: "Google Business Profile",
        desc: "Administra tu presencia en Google: Maps, búsqueda y reseñas.",
        url: "https://www.google.com/business/",
        tag: "Gratis",
      },
      {
        name: "WhatsApp Business",
        desc: "Comunicación directa con clientes, catálogos y respuestas automáticas.",
        url: "https://www.whatsapp.com/business/",
        tag: "Gratis",
      },
      {
        name: "Canva para Empresas",
        desc: "Diseño gráfico profesional sin conocimientos técnicos.",
        url: "https://www.canva.com/",
        tag: "Freemium",
      },
      {
        name: "Meta Business Suite",
        desc: "Gestiona Facebook e Instagram desde un solo lugar.",
        url: "https://business.facebook.com/",
        tag: "Gratis",
      },
    ],
  },
  {
    id: "entidades",
    title: "Entidades Oficiales",
    icon: Landmark,
    color: "amber",
    items: [
      {
        name: "MinTIC",
        desc: "Ministerio de Tecnologías de la Información y las Comunicaciones.",
        url: "https://mintic.gov.co",
        tag: "Gobierno",
      },
      {
        name: "MinCIT",
        desc: "Ministerio de Comercio, Industria y Turismo.",
        url: "https://www.mincit.gov.co",
        tag: "Gobierno",
      },
      {
        name: "Colombia Productiva",
        desc: "Entidad para la productividad y competitividad empresarial.",
        url: "https://www.colombiaproductiva.com",
        tag: "Gobierno",
      },
      {
        name: "SENA",
        desc: "Servicio Nacional de Aprendizaje — formación gratuita.",
        url: "https://www.sena.edu.co",
        tag: "Formación",
      },
      {
        name: "Cámara Colombiana de Comercio Electrónico",
        desc: "Gremio del comercio electrónico en Colombia.",
        url: "https://ccce.org.co",
        tag: "Gremio",
      },
      {
        name: "DIAN",
        desc: "Dirección de Impuestos y Aduanas Nacionales.",
        url: "https://www.dian.gov.co",
        tag: "Impuestos",
      },
    ],
  },
];

/* ──── color map for each section ──── */
const colorMap = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary-dark",
    icon: "text-brand-dark",
    tag: "bg-primary/15 text-primary-dark",
    hover: "hover:border-primary/40",
  },
  secondary: {
    bg: "bg-secondary-50",
    border: "border-secondary-200",
    text: "text-secondary-700",
    icon: "text-brand-dark",
    tag: "bg-secondary-100 text-secondary-700",
    hover: "hover:border-secondary-400",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: "text-brand-dark",
    tag: "bg-violet-100 text-violet-700",
    hover: "hover:border-violet-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: "text-brand-dark",
    tag: "bg-emerald-100 text-emerald-700",
    hover: "hover:border-emerald-400",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    icon: "text-brand-dark",
    tag: "bg-sky-100 text-sky-700",
    hover: "hover:border-sky-400",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-brand-dark",
    tag: "bg-amber-100 text-amber-700",
    hover: "hover:border-amber-400",
  },
};

/* ──────────────── COMPONENT ──────────────── */

export function RecursosPage() {
  const [expandedSections, setExpandedSections] = useState(
    () => new Set(sections.map((s) => s.id))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Auto-scroll to section when arriving with #hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setExpandedSections((prev) => new Set([...prev, id]));
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  const toggleSection = (id) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tag.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const totalResources = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="w-full bg-white font-sans text-brand-dark pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ── */}
        <div className="mb-12">
          <span className="inline-block bg-primary/10 text-primary-dark font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-6">
            Centro de recursos
          </span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 text-brand-dark">
            Recursos para <br/>
            <span className="text-primary">tu Negocio</span>
          </h1>
          <p className="text-brand-gray text-lg mb-8 max-w-lg">
            {totalResources} herramientas, plantillas, guías y programas curados para impulsar y digitalizar tu empresa.
          </p>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gray-light">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar recursos, herramientas, guías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-gray-light text-brand-dark rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:border-primary transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-brand-gray-light"
            />
          </div>
        </div>

        {/* ── Quick Nav Pills ── */}
        <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-brand-gray-light">
          {sections.map((section) => {
            const colors = colorMap[section.color];
            return (
              <button
                key={section.id}
                onClick={() => {
                  document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setExpandedSections((prev) => new Set([...prev, section.id]));
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm ${colors.bg} ${colors.border} ${colors.text} ${colors.hover} hover:shadow-md`}
              >
                {(() => { const Icon = section.icon; return <Icon className="w-4 h-4" />; })()}
                {section.title}
              </button>
            );
          })}
        </div>

        {/* ── No results ── */}
        {filteredSections.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-brand-gray-light mb-4" />
            <p className="text-lg font-bold text-brand-gray">No se encontraron recursos</p>
            <p className="text-sm text-brand-gray-light mt-1">Intenta con otros términos de búsqueda</p>
          </div>
        )}

        {/* ── Sections ── */}
        <div className="flex flex-col gap-8">
          {filteredSections.map((section) => {
            const colors = colorMap[section.color];
            const isExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-brand-gray-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden scroll-mt-6"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-brand-gray-light/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} ${colors.icon}`}>
                      {(() => { const Icon = section.icon; return <Icon className="w-5 h-5" />; })()}
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-black text-brand-dark">
                        {section.title}
                      </h2>
                      <p className="text-[11px] text-brand-gray mt-0.5 font-medium">
                        {section.items.length} {section.items.length === 1 ? "recurso" : "recursos"}
                      </p>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-brand-gray-light" />
                    : <ChevronDown className="w-5 h-5 text-brand-gray-light" />
                  }
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="border-t border-brand-gray-light/50 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {section.items.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group flex flex-col justify-between rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all duration-200 ${colors.hover} hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-sm font-bold text-brand-dark leading-snug group-hover:text-primary-dark transition-colors">
                                {item.name}
                              </h3>
                              <ExternalLink className="w-3.5 h-3.5 text-brand-gray-light group-hover:text-brand-gray flex-shrink-0 mt-1 transition-colors" />
                            </div>
                            <p className="text-xs text-brand-gray leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                          <div className="mt-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${colors.tag}`}
                            >
                              {item.tag}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer tip ── */}
        <div className="mt-12 flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <Star className="w-5 h-5 text-brand-dark mt-0.5 flex-shrink-0" />
          <p className="text-sm text-brand-gray leading-relaxed">
            <span className="font-bold text-brand-dark">¿Conoces un recurso útil?</span>{" "}
            Si tienes alguna herramienta, guía o programa que crees que debería estar aquí,
            contáctanos a través del módulo de <span className="font-bold text-primary-dark">Soporte Técnico</span> para sugerirlo.
          </p>
        </div>

      </div>
    </div>
  );
}
