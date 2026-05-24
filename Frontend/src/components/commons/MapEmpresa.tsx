import React, { useEffect, useState } from 'react';
// Leaflet CSS can be loaded; actual JS imports must be client-only
import 'leaflet/dist/leaflet.css';

// Tip: cargamos leaflet y react-leaflet dinámicamente en cliente

interface MapEmpresaProps {
  direccion: string;
  municipio?: string;
  nombre: string;
}

const MapEmpresa: React.FC<MapEmpresaProps> = ({ direccion, municipio, nombre }) => {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para componentes cargados dinámicamente
  const [LeafletComponents, setLeafletComponents] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
    L: any;
  }>(null);

  // Cargar librerías solo en cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;
    (async () => {
      try {
        const [Lmod, RL] = await Promise.all([import('leaflet'), import('react-leaflet')]);
        const L = Lmod?.default || Lmod;

        const defaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -34],
          shadowSize: [41, 41]
        });
        // @ts-ignore
        L.Marker.prototype.options.icon = defaultIcon;

        if (mounted) {
          setLeafletComponents({
            MapContainer: (RL as any).MapContainer,
            TileLayer: (RL as any).TileLayer,
            Marker: (RL as any).Marker,
            Popup: (RL as any).Popup,
            L
          });
        }
      } catch (e) {
        console.error('Error loading leaflet', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const fetchGeocode = async () => {
      try {
        const query = encodeURIComponent(`${direccion}, ${municipio || ''}, Colombia`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'es' }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        } else {
          setError('No se encontró ubicación');
        }
      } catch (e: any) {
        setError('Error al geocodificar');
      } finally {
        setLoading(false);
      }
    };
    if (direccion) fetchGeocode();
  }, [direccion, municipio]);

  // Si estamos en SSR o no tenemos componentes/capacidad, mostrar placeholder
  if (typeof window === 'undefined' || !LeafletComponents) {
    return (
      <div className="h-80 w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Cargando mapa...
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando mapa...</div>;
  }
  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }
  if (!coords) return null;

  const { MapContainer, TileLayer, Marker, Popup } = LeafletComponents as any;

  return (
    <div className="h-80 w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={[coords.lat, coords.lon]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.lat, coords.lon]}>
          <Popup>
            <strong>{nombre}</strong><br />{direccion}<br />{municipio}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapEmpresa;
