import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Flame, 
  UtensilsCrossed, 
  Car, 
  HeartPulse, 
  ShoppingBag, 
  Briefcase, 
  MapPin, 
  MoreHorizontal,
  Store
} from "lucide-react";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { getCategoryIcon } from "../utils/categoryIcons";

const GROUP_CONFIG = [
  {
    id: "alimentos",
    title: "Alimentos y Bebidas",
    icon: UtensilsCrossed,
    keywords: ["café", "cafetería", "restauran", "comida", "fruta", "verdura", "carne", "pollo", "pescado", "marisco", "lácteo", "huevo", "grano", "abarrote", "panadería", "repostería", "condimento", "especia", "helad", "postre", "bar", "licor"]
  },
  {
    id: "automotriz",
    title: "Automotriz",
    icon: Car,
    keywords: ["auto", "moto", "vehículo", "transporte"]
  },
  {
    id: "salud",
    title: "Salud y Bienestar",
    icon: HeartPulse,
    keywords: ["farmacia", "droguería", "salud", "médic", "medic", "maquillaje", "belleza", "estética", "deporte", "fitness", "mascota", "animal"]
  },
  {
    id: "comercio",
    title: "Comercio y Retail",
    icon: ShoppingBag,
    keywords: ["moda", "accesorio", "ropa", "tecnolog", "comput", "celular", "papelería", "oficina", "ferretería", "hogar", "limpieza", "mueble", "decoración", "joyería", "regalo"]
  },
  {
    id: "servicios",
    title: "Servicios",
    icon: Briefcase,
    keywords: ["reparac", "mantenimiento", "inmobiliaria", "profesional", "empresa", "negocio", "publicidad", "marketing", "telecomunicacion", "internet", "seguridad", "vigilancia", "logístic"]
  },
  {
    id: "turismo",
    title: "Turismo y Comunidad",
    icon: MapPin,
    keywords: ["hotel", "hospedaje", "educac", "capacitación", "colegio", "universidad", "evento", "entretenimiento", "artesanía"]
  },
  {
    id: "otros",
    title: "Otros",
    icon: MoreHorizontal,
    keywords: [] // Fallback
  }
];

export function PublicCategoriasPage() {
  const categorias = useAsyncData(async () => {
    const { data } = await categoriasApi.list({ limit: 100 });
    return data || [];
  });
  const [searchTerm, setSearchTerm] = useState("");

  const allCategories = categorias.data || [];

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return allCategories;
    return allCategories.filter(cat => 
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCategories, searchTerm]);

  // Grouping logic
  const groupedCategories = useMemo(() => {
    const groups = GROUP_CONFIG.map(g => ({ ...g, items: [] }));
    
    filteredCategories.forEach(cat => {
      const nameLower = cat.nombre.toLowerCase();
      let matched = false;
      
      for (let i = 0; i < GROUP_CONFIG.length - 1; i++) {
        if (GROUP_CONFIG[i].keywords.some(kw => nameLower.includes(kw))) {
          groups[i].items.push(cat);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        groups[groups.length - 1].items.push(cat);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [filteredCategories]);

  // Popular categories (mocked by picking some specific ones or just the first 4)
  const popularCategories = useMemo(() => {
    const popularNames = ["Restaurantes", "Tecnología", "Salud", "Hogar", "Motos", "Cafetería"];
    const pop = allCategories.filter(c => popularNames.some(pn => c.nombre.toLowerCase().includes(pn.toLowerCase()))).slice(0, 4);
    if (pop.length < 4) return allCategories.slice(0, 4);
    return pop;
  }, [allCategories]);

  if (categorias.isLoading) {
    return <Loading label="Cargando categorías..." />;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-60 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Explora todas <br className="hidden md:block"/>
              las <span className="text-primary-dark">categorías</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              Encuentra empresas, productos, servicios y lugares de interés organizados por categoría en tu ciudad.
            </p>
            
            <div className="mt-8 relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-400 w-5 h-5" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-base transition-shadow shadow-sm hover:shadow-md"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="hidden lg:flex flex-1 justify-center items-center opacity-10">
             <Search className="w-64 h-64 text-slate-900 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-20">
        
        {/* Popular Categories */}
        {!searchTerm && popularCategories.length > 0 && (
          <div className="mb-16 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Flame className="text-brand-dark w-6 h-6" />
                Categorías populares
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map(cat => {
                const Icon = getCategoryIcon(cat.nombre);
                return (
                  <Link
                    key={`pop-${cat.id}`}
                    to={`/busqueda?categoria_id=${cat.id}`}
                    className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 transition-all duration-300 hover:bg-white hover:border-primary hover:shadow-[0_4px_20px_rgba(244,181,30,0.15)] hover:border-b-4 rounded-md group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-md bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:border-primary-light z-10">
                      <Icon className="text-brand-dark w-6 h-6 group-hover:drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-primary-dark transition-colors line-clamp-1">{cat.nombre}</h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Explorar directorio</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Grouped Categories */}
        <div className="space-y-12 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Todas las categorías</h2>
          
          {groupedCategories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-700">No se encontraron categorías</p>
              <p className="text-slate-500 mt-2">Intenta con otros términos de búsqueda.</p>
            </div>
          ) : (
            groupedCategories.map(group => {
              const GroupIcon = group.icon;
              return (
              <div key={group.id} className="pt-4">
                <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GroupIcon className="text-brand-dark w-5 h-5" />
                    {group.title}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
                  {group.items.map(cat => {
                    const Icon = getCategoryIcon(cat.nombre);
                    return (
                      <Link
                        key={cat.id}
                        to={`/busqueda?categoria_id=${cat.id}`}
                        className="flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_4px_20px_rgba(244,181,30,0.15)] hover:border-b-4 rounded-md group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <Icon className="text-brand-dark w-8 h-8 group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-md z-10" />
                        <div className="text-center w-full z-10">
                          <span className="block text-[13px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-2 leading-tight">
                            {cat.nombre}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-medium mt-1">Ver negocios</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )})
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-slate-900 via-[#1E293B] to-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md hidden md:flex flex-shrink-0">
              <Store className="text-brand-dark w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2.5 uppercase tracking-wide">¿No encuentras la categoría que buscas?</h3>
              <p className="text-slate-300 max-w-xl leading-relaxed text-sm">
                Registra tu negocio o servicio hoy mismo y ayúdanos a expandir el directorio comercial de tu ciudad.
              </p>
            </div>
          </div>
          
          <div className="z-10 w-full md:w-auto">
            <Link 
              to="/empresas-panel" 
              className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary-dark text-brand-dark font-black py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20 uppercase tracking-wider text-xs whitespace-nowrap cursor-pointer"
            >
              + Registrar Negocio
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
