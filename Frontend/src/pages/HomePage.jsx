import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faChartLine,
  faChevronRight,
  faChevronDown,
  faFire,
  faHeart,
  faImage,
  faMapMarkerAlt,
  faSearch,
  faStar,
  faStore,
  faTags,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, empresasApi, marketplaceApi, reportesApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { API_BASE_URL, SERVER_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";
import { favoritosApi } from "../services/api";
import { useToast } from "../context/ToastContext";

const pickNumber = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return 0;
};

function ProductCard({ producto }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      pushToast({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para agregar favoritos",
        type: "info",
      });
      navigate(`/login?next=/producto/${producto.id}`);
      return;
    }

    try {
      if (isFavorite) {
        await favoritosApi.eliminar(producto.id);
        setIsFavorite(false);
        pushToast({ title: "Eliminado", message: "Producto eliminado de favoritos", type: "success" });
      } else {
        await favoritosApi.agregar(producto.id);
        setIsFavorite(true);
        pushToast({ title: "Agregado", message: "Producto agregado a favoritos", type: "success" });
      }
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo actualizar favoritos",
        type: "error",
      });
    }
  };

  const empresaNombre = producto.empresa?.nombre || null;
  const categoriaNombre = producto.categoria?.nombre || null;
  const estadoNombre = producto.estado?.nombre || null;
  const imagenes = producto.imagenes || [];
  const totalImagenes = imagenes.length;
  const precio = producto.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

  const esSinStock = estadoNombre?.toLowerCase().includes("sin stock") || estadoNombre?.toLowerCase().includes("inactivo") || producto.stock === 0;

  // Get first image URL
  const primeraImagen = imagenes.length > 0 ? imagenes[0] : null;
  const getImageUrl = (img) => {
    if (!img) return "";
    const url = typeof img === "string" ? img : img.imagen_url || img.url || "";
    return url.startsWith("/") ? url.slice(1) : url;
  };

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-slate-50 aspect-square">
        {primeraImagen ? (
          <img
            src={`${SERVER_BASE_URL}/${getImageUrl(primeraImagen)}`}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faStore} size="3x" />
          </div>
        )}

        {/* Image Count Badge */}
        {totalImagenes > 1 && (
          <div className="absolute top-3 left-3 rounded-xl bg-[#212121]/80 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur">
            <FontAwesomeIcon icon={faImage} className="mr-1 text-primary" />
            {totalImagenes}
          </div>
        )}

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/95 p-2.5 shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`transition-colors duration-200 ${isFavorite ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          />
        </button>

        {esSinStock && (
          <div className="absolute top-3 left-3 rounded-xl bg-danger px-3 py-1.5 text-xs font-bold text-white shadow">
            Sin stock
          </div>
        )}

        {/* Stock badge */}
        {!esSinStock && producto.stock > 0 && producto.stock <= 5 && (
          <div className="absolute top-3 left-3 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow">
            ¡Últimos {producto.stock}!
          </div>
        )}

        {/* Category Badge */}
        {categoriaNombre && (
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            {categoriaNombre}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Company Name */}
        {empresaNombre ? (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-[#1F1F1F]">
              {empresaNombre[0].toUpperCase()}
            </div>
            <p className="text-xs font-medium text-slate-600 truncate">{empresaNombre}</p>
          </div>
        ) : (
          <p className="mb-2 text-xs text-slate-500">Vendedor independiente</p>
        )}

        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-primary-hover transition-colors duration-200">
          {producto.nombre}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-slate-900">{precioFormateado}</span>
        </div>

        {producto.rating_promedio && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={
                    star <= Math.round(pickNumber(producto.rating_promedio))
                      ? "text-primary"
                      : "text-slate-200"
                  }
                  size="xs"
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-medium ml-1">
              ({producto.total_reviews || 0})
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-100">
            <div className={`h-1.5 w-1.5 rounded-full ${esSinStock ? "bg-red-500" : producto.stock > 10 ? "bg-success" : "bg-orange-500"}`} />
            {producto.stock > 0 ? `${Math.floor(producto.stock)} disponibles` : "Agotado"}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmpresaCard({ empresa }) {
  const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20"
      onClick={() => navigate(`/empresa/${empresa.id}`)}
    >
      <div className="flex items-start gap-4">
        {empresa.logo_url ? (
          <img
            src={`${API_BASE_URL}/empresas/${empresa.id}/logo`}
            alt={`Logo de ${empresa.nombre}`}
            className="h-16 w-16 rounded-xl border border-slate-100 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 shrink-0">
            <FontAwesomeIcon icon={faBuilding} className="text-slate-400" size="lg" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-primary-hover transition-colors duration-200">
            {empresa.nombre}
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-500">{empresa.correo}</p>
          {empresa.categoria && (
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-yellow-800">
              {empresa.categoria.nombre}
            </span>
          )}
        </div>
      </div>

      {empresa.municipio && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100/50 px-3 py-2 text-xs text-slate-600">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
          <span className="font-semibold">{empresa.municipio.nombre}</span>
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

  const categorias = useAsyncData(async () => {
    const { data } = await categoriasApi.list({ limit: 100 });
    return data || [];
  });

  const productosDestacados = useAsyncData(async () => {
    const { data } = await marketplaceApi.list({ limit: 12, ordenar: "fecha_publicacion" });
    return data || [];
  });

  const empresasDestacadas = useAsyncData(async () => {
    const { data } = await empresasApi.list({ limit: 8 });
    return data || [];
  });

  const topEmpresas = useAsyncData(async () => {
    try {
      const { data } = await reportesApi.topEmpresasRating({ limit: 6 });
      return data.items || [];
    } catch {
      return [];
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let url = `/busqueda?q=${encodeURIComponent(searchQuery)}`;
      if (selectedCategoria) url += `&categoria_id=${selectedCategoria}`;
      navigate(url);
    }
  };

  const loading = productosDestacados.loading || empresasDestacadas.loading;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1F1F1F] py-16 md:py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,193,7,0.12)_0%,_transparent_55%)]"></div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary tracking-wide uppercase border border-primary/20">
              Directorio Comercial & Marketplace
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">
              Páginas Amarillas
              <span className="block text-primary mt-1">Directorio Local</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-neutral-300">
              Encuentra rápidamente empresas locales, servicios profesionales y los artículos más populares del marketplace.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-3xl pt-6">
              <div className="relative flex flex-col sm:flex-row items-center rounded-3xl sm:rounded-full bg-white/10 p-2 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-500 group">
                
                {/* Search Input */}
                <div className="relative flex-1 flex items-center w-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/5 ml-2 text-primary shadow-inner group-focus-within:bg-primary group-focus-within:text-[#1F1F1F] transition-colors duration-300">
                    <FontAwesomeIcon icon={faSearch} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué estás buscando? (ej: restaurantes, ferreterías)"
                    className="w-full bg-transparent border-0 py-4 pl-4 pr-4 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-0 text-base md:text-lg"
                  />
                </div>

                {/* Divider (Hidden on Mobile) */}
                <div className="hidden sm:block w-px h-10 bg-white/20 mx-2"></div>

                {/* Category Selector */}
                <div className="relative w-full sm:w-[220px] flex items-center mt-2 sm:mt-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <select
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className="w-full appearance-none bg-transparent border-0 py-4 pl-4 pr-10 text-neutral-300 hover:text-white focus:text-white text-base focus:ring-0 cursor-pointer outline-none transition-colors"
                  >
                    <option value="" className="text-slate-800">Todas las categorías</option>
                    {(categorias.data || []).map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-slate-800">
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="absolute right-4 text-neutral-400 pointer-events-none text-sm" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto mt-3 sm:mt-0 rounded-full bg-gradient-to-r from-primary to-[#ffb300] px-8 py-4 font-extrabold text-[#1F1F1F] transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faSearch} className="sm:hidden" />
                  Buscar ahora
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Link
                to="/empresas"
                className="group flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-semibold text-white border border-white/20 backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 shadow-sm"
              >
                <FontAwesomeIcon icon={faStore} className="text-primary group-hover:scale-110 transition-transform" />
                Ver Directorio
              </Link>
              <Link
                to="/marketplace"
                className="group flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-semibold text-white border border-white/20 backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 shadow-sm"
              >
                <FontAwesomeIcon icon={faTags} className="text-primary group-hover:scale-110 transition-transform" />
                Ver Artículos
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-bold text-[#1F1F1F] transition-all hover:bg-primary-hover hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,193,7,0.3)]"
              >
                <FontAwesomeIcon icon={faUserPlus} className="group-hover:scale-110 transition-transform" />
                Registrar Negocio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F1F1F] md:text-2xl">
              <FontAwesomeIcon icon={faFire} className="text-orange-500" />
              Artículos Destacados
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Los productos más nuevos y buscados en el catálogo comercial</p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-hover"
          >
            Ver todos
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando productos destacados..." />
        ) : productosDestacados.data?.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">Aún no hay productos publicados en el marketplace</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {(productosDestacados.data || []).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Companies */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F1F1F] md:text-2xl">
              <FontAwesomeIcon icon={faStore} className="text-primary" />
              Empresas Destacadas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Comercios locales verificados y listos para atenderte</p>
          </div>
          <Link
            to="/empresas"
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-hover"
          >
            Ver directorio completo
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando empresas destacadas..." />
        ) : empresasDestacadas.data?.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">Aún no hay empresas registradas en el directorio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(empresasDestacadas.data || []).map((empresa) => (
              <EmpresaCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated Companies */}
      {topEmpresas.data?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F1F1F] md:text-2xl">
              <FontAwesomeIcon icon={faStar} className="text-primary" />
              Empresas Mejor Valoradas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Los comercios con mejores recomendaciones de sus clientes</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(topEmpresas.data || []).map((empresa, index) => (
              <div
                key={empresa.id_empresa}
                className="product-card cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300"
                onClick={() => navigate(`/empresa/${empresa.id_empresa}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-[#1F1F1F] shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{empresa.empresa}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FontAwesomeIcon icon={faStar} className="text-primary" size="xs" />
                        <span className="font-semibold text-slate-800">{empresa.rating_promedio?.toFixed(1) || "0.0"}</span>
                        <span className="text-xs text-slate-500">
                          ({empresa.total_reviews} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChartLine} className="text-primary" size="lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-r from-[#1F1F1F] via-[#2A2A2A] to-[#1F1F1F] p-8 text-center text-white shadow-xl md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">¿Eres propietario de un negocio?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-300 text-sm md:text-base">
            Crea tu perfil comercial en Páginas Amarillas, publica tus productos en el marketplace y recibe contactos directos de tus clientes vía WhatsApp y correo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-primary-hover shadow-md"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/empresas"
              className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold text-white hover:bg-neutral-800 transition"
            >
              Explorar Directorio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
