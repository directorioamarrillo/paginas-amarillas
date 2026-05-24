import React, { useState, useEffect } from "react";
import { axiosInstance as api } from "../../../utils/axiosInstance";
import { navigate } from "astro:transitions/client";
import { ForeignKeySelect } from "../commons/ForeignKeySelect";

// MapEditor se carga dinámicamente dentro del componente para evitar SSR
const useDynamicMapEditor = () => {
  const [Comp, setComp] = React.useState<null | React.ComponentType<any>>(null);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    (async () => {
      try {
        const mod = await import("./MapEditor");
        if (mounted) setComp(() => mod.default || mod.MapEditor || mod);
      } catch (e) {
        console.error("Error loading MapEditor:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return Comp;
};

interface EmpresaFormProps {
  id_empresa?: string;
}

class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Error in EmpresaFormInner:", error, info);
    try {
      // @ts-ignore
      this.setState({ error: { message: error?.message || String(error), stack: error?.stack || info?.componentStack } });
    } catch (e) {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto mt-6 p-4 card">
          <div className="px-6 py-4">
            <h1 className="text-lg font-semibold text-heading mb-4">Error al mostrar el formulario</h1>
            <div className="text-sm text-red-600">Ocurrió un error al renderizar el formulario. A continuación aparecen detalles:</div>
            <div className="mt-3 p-3 bg-red-50 rounded">
              <strong className="text-sm">Mensaje:</strong>
              <div className="text-sm text-red-700">{this.state.error?.message ?? 'Sin mensaje'}</div>
              <details className="mt-2 text-xs text-gray-600">
                <summary>Mostrar stack</summary>
                <pre className="whitespace-pre-wrap text-xs">{this.state.error?.stack ?? 'Sin stack'}</pre>
              </details>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const EmpresaFormInner: React.FC<EmpresaFormProps> = ({ id_empresa }) => {
  const [nombre, setNombre] = useState<string>("");
  const [nit, setNit] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [id_categoria, setIdCategoria] = useState<number>(0);
  const [id_municipio, setIdMunicipio] = useState<number>(0);
  const [logo, setLogo] = useState<string>("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  useEffect(() => {
    if (id_empresa) {
      fetchEmpresa();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_empresa]);

  const fetchEmpresa = async (): Promise<void> => {
    try {
      const response = await api.get(`/api/empresas/${id_empresa}`);
      const data = response.data;
      setNombre(data.nombre || "");
      setNit(data.nit || "");
      setCorreo(data.correo || "");
      setDireccion(data.direccion || "");
      setTelefono(data.telefono || "");
      setIdCategoria(data.id_categoria || 0);
      setIdMunicipio(data.id_municipio || 0);
      setLogo(data.logo || "");
      setLat(data.lat || null);
      setLon(data.lon || null);
    } catch (error) {
      console.error("Error fetching empresa:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const data = { nombre, nit, correo, direccion, telefono, id_categoria, id_municipio, logo, lat, lon };
    try {
      if (id_empresa) {
        await api.put(`/api/empresas/${id_empresa}`, data);
      } else {
        await api.post("/api/empresas/", data);
      }
      navigate("/admin/empresas");
    } catch (error) {
      console.error("Error saving empresa:", error);
      try {
        const isNetworkError = (error as any)?.code === 'ECONNREFUSED' || (error as any)?.message?.toLowerCase?.().includes('connect');
        if (isNetworkError) {
          const existing = JSON.parse(localStorage.getItem('mock_empresas') || '[]');
          const mockItem = { id_empresa: Date.now(), ...data };
          existing.push(mockItem);
          localStorage.setItem('mock_empresas', JSON.stringify(existing));
          alert('Guardado en modo demo (mock). La empresa se añadirá a la lista local.');
          navigate('/admin/empresas');
          return;
        }
      } catch (e) {
        console.error('Error saving mock empresa:', e);
      }
      alert('Error al guardar la empresa. Revisa la consola.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto mt-6 p-4 card">
        <div className="px-6 py-4">
          <h1 className="text-lg font-semibold text-heading mb-4">{id_empresa ? "Editar Empresa" : "Crear Empresa"}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre:</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="nit" className="block text-sm font-medium text-gray-700">NIT:</label>
              <input type="text" id="nit" value={nit} onChange={(e) => setNit(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo:</label>
              <input type="email" id="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección:</label>
              <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono:</label>
              <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoría:</label>
              <ForeignKeySelect endpoint="/api/categorias" value={id_categoria} onChange={(v) => setIdCategoria(Number(v))} labelKey="nombre" valueKey="id_categoria" placeholder="Seleccione una categoría" />
            </div>
            <div>
              <label htmlFor="id_municipio" className="block text-sm font-medium text-gray-700">Municipio:</label>
              <ForeignKeySelect endpoint="/api/municipios" value={id_municipio} onChange={(v) => setIdMunicipio(Number(v))} labelKey="nombre" valueKey="id_municipio" placeholder="Seleccione un municipio" />
            </div>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Logo (URL):</label>
              <input type="text" id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} required className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación (mapa)</label>
              <div className="mt-2">
                {(() => {
                  const MapEditorComp = useDynamicMapEditor();
                  if (!MapEditorComp) return <div className="text-sm text-gray-500">Cargando mapa...</div>;
                  const C = MapEditorComp as any;
                  return <C lat={lat ?? undefined} lon={lon ?? undefined} onChange={(nlat: number, nlon: number) => { setLat(nlat); setLon(nlon); }} />;
                })()}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2"><input type="text" readOnly value={lat ?? ''} placeholder="Lat" className="px-3 py-1 rounded border" /><input type="text" readOnly value={lon ?? ''} placeholder="Lon" className="px-3 py-1 rounded border" /></div>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => navigate("/admin/empresas")} className="px-3 py-1 text-sm font-medium bg-red-500 text-white border rounded-md hover:bg-red-600">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EmpresaFormInner;
