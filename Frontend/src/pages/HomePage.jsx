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
  faShoppingBag,
  faUser,
  faCar,
  faUtensils,
  faHouse,
  faComputer,
  faScrewdriverWrench,
  faHeartPulse,
  faGraduationCap,
  faGrip,
  faMugHot,
  faLeaf,
  faDrumstickBite,
  faFish,
  faCheese,
  faWheatAwn,
  faBreadSlice,
  faPepperHot,
  faPaw,
  faPills,
  faSpa,
  faDumbbell,
  faShirt,
  faGamepad,
  faPaperclip,
  faBroom,
  faWrench,
  faTruck,
  faPalette,
  faIceCream,
  faWineGlass,
  faMotorcycle,
  faBed,
  faBriefcase,
  faCalendarAlt,
  faBullhorn,
  faWifi,
  faShieldAlt,
  faCouch,
  faGem
} from "@fortawesome/free-solid-svg-icons";
import { MoreHorizontal, Store, ShoppingBag, User, LayoutGrid, Flame, ChevronRight, Star, MapPin, MessageCircle, Globe } from "lucide-react";
import { getCategoryIcon } from "../utils/categoryIcons";
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
      className="group cursor-pointer rounded-2xl border border-brand-gray-light bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-brand-gray-light/10 aspect-square">
        {primeraImagen ? (
          <img
            src={`${SERVER_BASE_URL}/${getImageUrl(primeraImagen)}`}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-gray-light">
            <FontAwesomeIcon icon={faStore} size="3x" />
          </div>
        )}

        {/* Image Count Badge */}
        {totalImagenes > 1 && (
          <div className="absolute top-3 left-3 rounded-xl bg-primary text-brand-dark px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur">
            <FontAwesomeIcon icon={faImage} className="mr-1 text-brand-dark" />
            {totalImagenes}
          </div>
        )}

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/95 p-2.5 shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`transition-colors duration-200 ${isFavorite ? "text-red-500" : "text-brand-gray-light hover:text-red-400"}`}
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
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-gray shadow-sm backdrop-blur">
            {categoriaNombre}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Company Name */}
        {empresaNombre ? (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-brand-dark">
              {(() => {
                const CategoryIcon = getCategoryIcon(categoriaNombre || "");
                return <CategoryIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
              })()}
            </div>
            <p className="text-xs font-medium text-brand-gray truncate">{empresaNombre}</p>
          </div>
        ) : (
          <p className="mb-2 text-xs text-brand-gray">Vendedor independiente</p>
        )}

        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-brand-dark group-hover:text-primary-hover transition-colors duration-200">
          {producto.nombre}
        </h3>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-brand-dark">{precioFormateado}</span>
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
                      : "text-brand-gray-light"
                  }
                  size="xs"
                />
              ))}
            </div>
            <span className="text-[10px] text-brand-gray font-medium ml-1">
              ({producto.total_reviews || 0})
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gray-light/10 px-2.5 py-1 text-xs font-medium text-brand-gray border border-brand-gray-light">
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

  // Variables mock para la demostración si no vienen del backend
  const rating = empresa.rating_promedio || 4.9;
  
  // Renderizado de las 5 estrellas completas
  const renderStars = () => (
    <div className="flex text-primary">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-current" />
      ))}
    </div>
  );

  return (
    <div
      className="group flex flex-col justify-between cursor-pointer rounded-2xl border border-brand-gray-light bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
      onClick={() => navigate(`/empresa/${empresa.id || empresa.id_empresa}`)}
    >
      <div>
        {/* Header with Logo and Title/Rating */}
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-brand-gray-light bg-slate-50 shadow-sm flex items-center justify-center">
            {empresa.logo_url ? (
              <img
                src={`${API_BASE_URL}/empresas/${empresa.id || empresa.id_empresa}/logo`}
                alt={`Logo de ${empresa.nombre}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fb = e.target.nextSibling;
                  if (fb) fb.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-brand-gray-light/10"
              style={{ display: empresa.logo_url ? 'none' : 'flex' }}
            >
              <FontAwesomeIcon icon={faBuilding} className="text-brand-gray-light text-xl" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Título de la empresa */}
            <h3 className="text-lg font-black text-brand-dark group-hover:text-primary-dark transition-colors truncate">
              {empresa.nombre || empresa.empresa || "Moto Repuestos Lopera"}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1 text-sm">
              <div className="text-[12px] leading-none">
                {renderStars()}
              </div>
              <span className="font-bold text-brand-dark ml-1">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Info list (Ubicación, WhatsApp, Sitio Web) */}
        <div className="mt-5 space-y-2.5 text-sm text-brand-gray font-medium">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-brand-gray" />
            <span className="truncate">{empresa.municipio?.nombre || "Sogamoso"}</span>
          </div>
          <div 
            className="flex items-center gap-3 text-green-600 hover:text-green-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </div>
          <div 
            className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-4 h-4" />
            <span>Sitio Web</span>
          </div>
        </div>
      </div>

      {/* Badges / Menú Rápido */}
      <div className="mt-6 flex flex-wrap gap-2">
        {['Productos', 'Servicios', 'Galería', 'Ubicación', 'Reseñas', 'Horarios'].map((tag) => (
          <span 
            key={tag} 
            className="rounded-lg bg-background px-2.5 py-1 text-[11px] font-bold text-brand-gray hover:text-brand-dark uppercase tracking-wide border border-brand-gray-light/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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

  const publicStats = useAsyncData(async () => {
    try {
      const { data } = await reportesApi.publicStats();
      return data;
    } catch {
      return { empresas: 0, productos: 0, usuarios: 0, categorias: 0 };
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
    <div className="min-h-screen bg-white pb-12 text-brand-dark">
      {/* Hero Section */}
      <section className="relative z-40 bg-white py-20 md:py-32 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="absolute inset-0 bg-white"></div>
        <div className="relative mx-auto max-w-5xl px-4 md:px-6 text-center">
          
          <span className="inline-block rounded-full bg-brand-dark text-primary px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border border-brand-dark/80 mb-6 shadow-xl">
            DIRECTORIO COMERCIAL & MARKETPLACE
          </span>
          
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl text-brand-dark mb-6 leading-[1.1]">
            Conecta con empresas,<br />
            <span className="text-primary-dark">productos y oportunidades</span><br />
            cerca de ti.
          </h1>
          
          <p className="mx-auto max-w-2xl text-base md:text-lg text-brand-gray mb-10">
            Descubre negocios locales, compara opciones y encuentra lo que necesitas desde un solo lugar.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative z-50 mx-auto max-w-4xl w-full">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              
              {/* Search Input Container */}
              <div className="relative flex-1 flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-brand-dark focus-within:ring-2 focus-within:ring-brand-dark/5 transition-all duration-300 hover:shadow-md">
                <div className="pl-5 text-slate-400 group-focus-within:text-brand-dark transition-colors">
                  <FontAwesomeIcon icon={faSearch} className="text-lg" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué estás buscando? (ej: restaurante, abogado...)"
                  className="w-full bg-transparent border-0 py-4 pl-3 pr-4 text-brand-dark placeholder:text-slate-400 focus:outline-none focus:ring-0 text-base font-medium"
                />
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto rounded-2xl bg-primary px-8 py-4 font-extrabold text-brand-dark transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                Buscar ahora
              </button>
            </div>
          </form>

          {/* Tendencias */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center font-bold text-brand-dark mr-1">
              <Flame className="w-5 h-5 text-brand-dark mr-1 fill-brand-dark" /> 
              <span>Tendencias:</span>
            </div>
            {['Motos', 'Restaurantes', 'Abogados', 'Tecnología', 'Ferreterías', 'Salud'].map(trend => (
              <span key={trend} onClick={() => { setSearchQuery(trend); handleSearch({preventDefault: () => {}}); }} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-gray border border-brand-gray-light shadow-sm cursor-pointer hover:bg-brand-gray-light/10 hover:text-brand-dark transition-colors">
                {trend}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 relative z-50 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white rounded-2xl border border-brand-gray-light shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-6 px-4">
          <div className="flex items-center justify-center gap-4 md:border-r border-brand-gray-light last:border-0 p-2">
            <Store className="text-brand-dark w-8 h-8 drop-shadow-sm" />
            <div className="text-left">
              <p className="text-2xl font-bold text-brand-dark leading-none">
                {publicStats.isLoading ? "..." : (publicStats.data?.empresas || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-brand-gray font-medium mt-1">Empresas Registradas</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 md:border-r border-brand-gray-light last:border-0 p-2">
            <ShoppingBag className="text-brand-dark w-8 h-8 drop-shadow-sm" />
            <div className="text-left">
              <p className="text-2xl font-bold text-brand-dark leading-none">
                {publicStats.isLoading ? "..." : (publicStats.data?.productos || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-brand-gray font-medium mt-1">Productos Publicados</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 md:border-r border-brand-gray-light last:border-0 p-2 mt-4 md:mt-0">
            <User className="text-brand-dark w-8 h-8 drop-shadow-sm" />
            <div className="text-left">
              <p className="text-2xl font-bold text-brand-dark leading-none">
                {publicStats.isLoading ? "..." : (publicStats.data?.usuarios || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-brand-gray font-medium mt-1">Usuarios Activos</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 p-2 mt-4 md:mt-0">
            <LayoutGrid className="text-brand-dark w-8 h-8 drop-shadow-sm" />
            <div className="text-left">
              <p className="text-2xl font-bold text-brand-dark leading-none">
                {publicStats.isLoading ? "..." : (publicStats.data?.categorias || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-brand-gray font-medium mt-1">Categorías Comerciales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias Grid */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-6 mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">Explora por categorías</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(() => {
            if (categorias.isLoading) {
              return <div className="col-span-full py-8 text-center text-brand-gray font-medium">Cargando categorías...</div>;
            }
            
            const realCats = (categorias.data || []).slice(0, 7);
            const items = realCats.map(cat => {
              const Icon = getCategoryIcon(cat.nombre);
              
              return { id: cat.id, name: cat.nombre, icon: Icon };
            });
            
            items.push({ id: 'more', name: 'Más categorías', icon: MoreHorizontal, link: '/categorias' });
            
            return items.map(cat => {
              const Icon = cat.icon;
              return (
              <Link 
                key={cat.id} 
                to={cat.link || `/busqueda?categoria_id=${cat.id}`} 
                className="flex flex-col items-center justify-center gap-3 bg-white border border-brand-gray-light p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-400 hover:shadow-[0_4px_20px_rgba(234,179,8,0.15)] hover:border-b-4 rounded-md group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-gray-light/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <Icon className="text-brand-dark w-8 h-8 group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-md z-10" />
                <span className="text-[11px] font-semibold text-brand-gray group-hover:text-brand-dark transition-colors text-center line-clamp-2 leading-tight z-10">{cat.name}</span>
              </Link>
            )});
          })()}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F1F1F] md:text-2xl">
              <Flame className="text-brand-dark w-6 h-6" />
              Artículos Destacados
            </h2>
            <p className="text-xs text-brand-gray mt-0.5">Los productos más nuevos y buscados en el catálogo comercial</p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-1 text-xs font-bold text-primary-dark hover:text-primary-hover"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando productos destacados..." />
        ) : productosDestacados.data?.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray-light bg-white p-12 text-center shadow-sm">
            <p className="text-brand-gray font-medium">Aún no hay productos publicados en el marketplace</p>
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
              <Store className="text-brand-dark w-6 h-6" />
              Empresas Destacadas
            </h2>
            <p className="text-xs text-brand-gray mt-0.5">Comercios locales verificados y listos para atenderte</p>
          </div>
          <Link
            to="/empresas"
            className="flex items-center gap-1 text-xs font-bold text-primary-dark hover:text-primary-hover"
          >
            Ver directorio completo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loading text="Cargando empresas destacadas..." />
        ) : empresasDestacadas.data?.length === 0 ? (
          <div className="rounded-2xl border border-brand-gray-light bg-white p-12 text-center shadow-sm">
            <p className="text-brand-gray font-medium">Aún no hay empresas registradas en el directorio</p>
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
              <Star className="text-brand-dark w-6 h-6" />
              Empresas Mejor Valoradas
            </h2>
            <p className="text-xs text-brand-gray mt-0.5">Los comercios con mejores recomendaciones de sus clientes</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(topEmpresas.data || []).map((empresa, index) => (
              <div
                key={empresa.id_empresa}
                className="product-card cursor-pointer rounded-2xl border border-brand-gray-light bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300"
                onClick={() => navigate(`/empresa/${empresa.id_empresa}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-[#1F1F1F] shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">{empresa.empresa}</h3>
                      <div className="flex items-center gap-1 text-sm text-brand-gray">
                        <FontAwesomeIcon icon={faStar} className="text-primary" size="xs" />
                        <span className="font-semibold text-brand-dark">{empresa.rating_promedio?.toFixed(1) || "0.0"}</span>
                        <span className="text-xs text-brand-gray">
                          ({empresa.total_reviews} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChartLine} className="text-brand-dark" size="lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="rounded-3xl border border-brand-gray-light bg-white p-8 text-center text-brand-dark shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">¿Eres propietario de un negocio?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-gray text-sm md:text-base">
            Crea tu perfil comercial en Directorio 2.0, publica tus productos en el marketplace y recibe contactos directos de tus clientes vía WhatsApp y correo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-primary-dark shadow-md"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/empresas"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-primary-dark shadow-md"
            >
              Explorar Directorio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
