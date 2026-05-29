import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { busquedaApi, categoriasApi } from "../services/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { useToast } from "../context/ToastContext";
import Select from "react-select";

export function BusquedaPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategoria = searchParams.get("categoria_id") || "";

  const [query, setQuery] = useState(initialQuery);
  const [categoriaId, setCategoriaId] = useState(initialCategoria);
  
  const [result, setResult] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minWidth: '240px',
      height: '46px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#eab308' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(234, 179, 8, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#eab308' : '#94a3b8'
      },
      cursor: 'pointer',
      fontSize: '0.875rem' // text-sm
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#eab308' : state.isFocused ? '#fefce8' : 'white',
      color: state.isSelected ? '#fff' : '#334155',
      cursor: 'pointer',
      padding: '10px 14px',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s ease'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 50
    }),
    menuList: (base) => ({
      ...base,
      padding: 0
    }),
    singleValue: (base) => ({
      ...base,
      color: '#334155'
    })
  };

  const categorias = useAsyncData(async () => {
    const { data } = await categoriasApi.list({ limit: 100 });
    return data || [];
  });

  const buscar = async (q = query, cat = categoriaId) => {
    if (!q || q.length < 2) {
      pushToast({ title: "Dato requerido", message: "Ingresa mínimo 2 caracteres", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const params = { query: q, limit: 50 };
      if (cat) params.categoria_id = cat;
      const { data } = await busquedaApi.global(params);
      setResult(data);
      setHasSearched(true);
      
      // Update URL without reloading
      setSearchParams(cat ? { q, categoria_id: cat } : { q }, { replace: true });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo buscar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !hasSearched) {
      buscar(initialQuery, initialCategoria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const run = async () => {
        if (!query || query.length < 1) {
          setSugerencias([]);
          return;
        }
        try {
          const { data } = await busquedaApi.sugerencias({ query, limit: 10 });
          setSugerencias(data.sugerencias || []);
        } catch {
          setSugerencias([]);
        }
      };
      run();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1F1F1F]">Búsqueda global</h3>
        <div className="mt-3 flex gap-2">
          <div className="flex-shrink-0 z-50 relative">
            <Select
              styles={customStyles}
              options={[
                { value: "", label: "Todas las categorías" },
                ...(categorias.data || []).map((cat) => ({ value: cat.id, label: cat.nombre }))
              ]}
              value={
                categoriaId 
                  ? { value: categoriaId, label: categorias.data?.find(c => c.id === categoriaId)?.nombre || "Cargando..." }
                  : { value: "", label: "Todas las categorías" }
              }
              onChange={(selected) => setCategoriaId(selected.value)}
              placeholder="Categoría"
              isSearchable={true}
              noOptionsMessage={() => "No se encontraron categorías"}
            />
          </div>
          <input 
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200" 
            placeholder="Buscar en empresas y productos" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          <button 
            className="rounded-xl bg-[#212121] px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition shadow" 
            onClick={() => buscar(query, categoriaId)}
          >
            Buscar
          </button>
        </div>
        {sugerencias.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {sugerencias.map((item) => (
              <button 
                key={item} 
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary/10 hover:text-yellow-800 transition duration-200" 
                onClick={() => {
                  setQuery(item);
                  buscar(item, categoriaId);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-slate-500 font-medium">Consultando el directorio...</p> : null}
      {!loading && result && (result.empresas?.length || 0) === 0 && (result.productos?.length || 0) === 0 ? (
        <EmptyState title="Sin coincidencias" description="Intenta con otro término de búsqueda." />
      ) : null}

      {result?.empresas?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3 px-2">Empresas encontradas</h4>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "nombre", label: "Empresa" },
              { key: "correo", label: "Correo" },
              {
                key: "acciones",
                label: "Ir",
                render: () => (
                  <button 
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-primary-hover transition shadow-sm" 
                    onClick={() => navigate(`/empresas?search=${encodeURIComponent(query)}`)}
                  >
                    Ver empresas
                  </button>
                ),
              },
            ]}
            rows={result.empresas}
          />
        </div>
      ) : null}

      {result?.productos?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3 px-2">Productos encontrados</h4>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "nombre", label: "Producto" },
              { key: "precio", label: "Precio" },
              {
                key: "acciones",
                label: "Ir",
                render: () => (
                  <button 
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-primary-hover transition shadow-sm" 
                    onClick={() => navigate(`/marketplace?search=${encodeURIComponent(query)}`)}
                  >
                    Ver marketplace
                  </button>
                ),
              },
            ]}
            rows={result.productos}
          />
        </div>
      ) : null}
    </section>
  );
}
