import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuilding,
  faChartLine,
  faEnvelope,
  faHeart,
  faImage,
  faLocationDot,
  faMessage,
  faPhone,
  faStar,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { empresasApi, marketplaceApi, reviewsApi, favoritosApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";
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

const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return "";
  // remove non-digit characters and plus sign
  return String(phone).replace(/\D/g, "");
};

const openWhatsAppApp = (phone, empresa) => {
  const num = formatPhoneForWhatsApp(phone);
  if (!num) return;
  const msg = encodeURIComponent(`Hola ${empresa}, estoy interesado en sus productos.`);
  const appUrl = `whatsapp://send?phone=${num}&text=${msg}`;
  const webUrl = `https://wa.me/${num}?text=${msg}`;

  // Intentar abrir la app; si no se abre, fallback al web URL tras 700ms
  try {
    window.location.href = appUrl;
    setTimeout(() => {
      // Si no se redirigió a la app, abrir WhatsApp Web
      window.location.href = webUrl;
    }, 700);
  } catch (e) {
    window.location.href = webUrl;
  }
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
            src={`${API_BASE_URL}/${getImageUrl(primeraImagen)}`}
            alt={producto.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
        <h3 className="line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-primary-hover transition-colors duration-200">
          {producto.nombre}
        </h3>
        <p className="mt-2 text-xl font-extrabold text-slate-900">{precioFormateado}</p>
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

function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-[#1F1F1F]">
            {review.usuario?.nombre?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <span className="block font-bold text-slate-900">
              {review.usuario?.nombre || "Usuario"} {review.usuario?.apellido || ""}
            </span>
            {review.fecha && (
              <span className="text-[10px] text-slate-400">
                {new Date(review.fecha).toLocaleDateString("es-CO")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              className={
                star <= Math.round(pickNumber(review.calificacion))
                  ? "text-primary"
                  : "text-slate-200"
              }
              size="xs"
            />
          ))}
          <span className="ml-1 text-xs font-bold text-slate-800">
            {pickNumber(review.calificacion).toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed pl-1">{review.comentario || "Sin comentario"}</p>
    </div>
  );
}

export function PublicEmpresaPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState("productos");

  const idEmpresa = Number(empresaId);

  const empresa = useAsyncData(async () => {
    if (!idEmpresa) return null;
    return (await empresasApi.get(idEmpresa)).data;
  }, idEmpresa);

  const productos = useAsyncData(async () => {
    if (!idEmpresa) return [];
    return (await marketplaceApi.list({ id_empresa: idEmpresa, limit: 100, ordenar: "fecha_publicacion" })).data || [];
  }, idEmpresa);

  const reviews = useAsyncData(async () => {
    if (!idEmpresa) return [];
    return (await reviewsApi.listEmpresa(idEmpresa)).data || [];
  }, idEmpresa);

  if (empresa.loading || productos.loading || reviews.loading) {
    return <Loading text="Cargando ficha de empresa..." />;
  }

  if (!empresa.data) {
    return <EmptyState title="Empresa no encontrada" description="Verifica el enlace o intenta desde el listado de empresas." />;
  }

  const data = empresa.data;
  const productosList = Array.isArray(productos.data) ? productos.data : [];
  const reviewsList = Array.isArray(reviews.data) ? reviews.data : [];

  const promedioRating =
    reviewsList.length > 0
      ? reviewsList.reduce((acc, item) => acc + pickNumber(item.calificacion), 0) / reviewsList.length
      : 0;

  const totalClicks = productosList.reduce(
    (acc, item) => acc + pickNumber(item.total_clicks, item.clicks, item.cantidad_clicks),
    0
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-12">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-primary-hover transition">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/empresas" className="hover:text-primary-hover transition">
              Empresas
            </Link>
            <span>/</span>
            <span className="text-[#1F1F1F] font-bold">{data.nombre}</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {data.logo_url ? (
                <img
                  src={`${API_BASE_URL}/empresas/${data.id}/logo`}
                  alt={`Logo de ${data.nombre}`}
                  className="h-20 w-20 rounded-2xl border border-slate-100 object-cover shadow-sm md:h-28 md:w-28"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 shrink-0 md:h-28 md:w-28">
                  <FontAwesomeIcon icon={faBuilding} className="text-slate-400" size="2x" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-extrabold text-[#1F1F1F] md:text-3xl tracking-tight">{data.nombre}</h1>
                {data.categoria && (
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-yellow-800">
                    {data.categoria.nombre}
                  </span>
                )}
                <div className="mt-4 space-y-1.5 text-sm text-[#666666]">
                  {data.correo && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary w-4" />
                      <span>{data.correo}</span>
                    </div>
                  )}
                  {data.telefono && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="text-primary w-4" />
                      <span>{data.telefono}</span>
                    </div>
                  )}
                  {data.direccion && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="text-primary w-4" />
                      <span>{data.direccion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {data.telefono && (
                <button
                  onClick={() => openWhatsAppApp(data.telefono, data.nombre)}
                  className="flex items-center gap-2 rounded-xl bg-success px-6 py-3 font-semibold text-white transition hover:bg-green-600 shadow-md"
                  aria-label={`Contactar ${data.nombre} por WhatsApp`}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  Contactar por WhatsApp
                </button>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="flex items-center justify-center text-2xl font-extrabold text-slate-800">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-primary" />
                {promedioRating.toFixed(1)}
              </div>
              <p className="mt-1 text-xs text-[#666666]">Rating promedio</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800">{reviewsList.length}</div>
              <p className="mt-1 text-xs text-[#666666]">Reseñas</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800">{productosList.length}</div>
              <p className="mt-1 text-xs text-[#666666]">Productos</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="flex items-center justify-center text-2xl font-extrabold text-slate-800">
                <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
                {totalClicks}
              </div>
              <p className="mt-1 text-xs text-[#666666]">Clics totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("productos")}
            className={`px-5 py-3 text-sm font-bold transition-all duration-200 border-b-2 ${
              activeTab === "productos"
                ? "border-primary text-slate-900"
                : "border-transparent text-[#666666] hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faStore} className="mr-2" />
            Productos ({productosList.length})
          </button>
          <button
            onClick={() => setActiveTab("resenas")}
            className={`px-5 py-3 text-sm font-bold transition-all duration-200 border-b-2 ${
              activeTab === "resenas"
                ? "border-primary text-slate-900"
                : "border-transparent text-[#666666] hover:text-slate-900"
            }`}
          >
            <FontAwesomeIcon icon={faStar} className="mr-2" />
            Reseñas ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "productos" && (
          <div>
            {productosList.length === 0 ? (
              <EmptyState
                title="Sin productos"
                description="Esta empresa aún no tiene productos publicados"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {productosList.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "resenas" && (
          <div className="space-y-4 max-w-3xl">
            {reviewsList.length === 0 ? (
              <EmptyState
                title="Sin reseñas"
                description="Aún no hay reseñas para esta empresa"
              />
            ) : (
              reviewsList.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
