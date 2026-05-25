import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapEditorProps {
  lat?: number | null;
  lon?: number | null;
  onChange?: (lat: number, lon: number) => void;
}

const MapEditor: React.FC<MapEditorProps> = ({ lat, lon, onChange }) => {
  const [LeafletComponents, setLeafletComponents] = useState<null | any>(null);
  const [pos, setPos] = useState<[number, number] | null>(lat && lon ? [lat, lon] : null);

  useEffect(() => {
    if (lat && lon) setPos([lat, lon]);
  }, [lat, lon]);

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
        });
        // @ts-ignore
        L.Marker.prototype.options.icon = defaultIcon;

        if (mounted) {
          setLeafletComponents({
            MapContainer: (RL as any).MapContainer,
            TileLayer: (RL as any).TileLayer,
            Marker: (RL as any).Marker,
            Popup: (RL as any).Popup,
            L,
          });
        }
      } catch (e) {
        console.error('Error loading leaflet/react-leaflet', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (typeof window === 'undefined' || !LeafletComponents) {
    return <div className="h-64 w-full rounded bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
  }

  const { MapContainer, TileLayer, Marker } = LeafletComponents;

  const handleClick = (e: any) => {
    const { lat: clicLat, lng: clicLng } = e.latlng;
    setPos([clicLat, clicLng]);
    onChange?.(clicLat, clicLng);
  };

  return (
    <div className="h-64 w-full rounded overflow-hidden">
      <MapContainer
        center={pos || [4.7110, -74.0721]}
        zoom={pos ? 15 : 6}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map: any) => { map.on('click', handleClick); }}
      >
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pos && (
          <Marker position={pos as any} draggable={true} eventHandlers={{ dragend: (ev: any) => { const m = ev.target; const p = m.getLatLng(); setPos([p.lat, p.lng]); onChange?.(p.lat, p.lng); } }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapEditor;
