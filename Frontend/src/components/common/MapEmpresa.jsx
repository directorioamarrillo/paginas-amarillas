import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLocationDot, 
  faMap, 
  faRoute, 
  faLocationArrow, 
  faCompass, 
  faCar, 
  faBicycle, 
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";

export function MapEmpresa({ direccion, municipio, nombre }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // GPS State
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [distance, setDistance] = useState(null); // in km
  const [mapStyle, setMapStyle] = useState("streets"); // "streets" or "satellite"

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const routingLineRef = useRef(null);
  const userMarkerRef = useRef(null);

  // 1. Load Leaflet CSS and JS dynamically from CDN
  const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }

      let link = document.getElementById("leaflet-cdn-css");
      if (!link) {
        link = document.createElement("link");
        link.id = "leaflet-cdn-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("No se pudo cargar Leaflet"));
      document.body.appendChild(script);
    });
  };

  // 2. Geocode address with Nominatim
  useEffect(() => {
    let active = true;
    const geocode = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `${direccion ? direccion + ", " : ""}${municipio || ""}, Colombia`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { "Accept-Language": "es" } });
        const data = await res.json();
        
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
              displayName: data[0].display_name
            });
          } else {
            // Fallback to Municipio
            if (municipio) {
              const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(municipio + ", Colombia")}`;
              const fbRes = await fetch(fallbackUrl, { headers: { "Accept-Language": "es" } });
              const fbData = await fbRes.json();
              if (fbData && fbData.length > 0) {
                setCoords({
                  lat: parseFloat(fbData[0].lat),
                  lon: parseFloat(fbData[0].lon),
                  displayName: fbData[0].display_name,
                  isFallback: true
                });
                return;
              }
            }
            // Fallback to Colombia
            setCoords({
              lat: 4.570868,
              lon: -74.297333,
              displayName: "Colombia (Ubicación aproximada)",
              isFallback: true
            });
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setCoords({
            lat: 4.570868,
            lon: -74.297333,
            displayName: "Colombia (Ubicación aproximada)",
            isFallback: true
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    geocode();
    return () => { active = false; };
  }, [direccion, municipio]);

  // 3. Initialize map
  useEffect(() => {
    if (loading || !coords || !mapRef.current) return;

    let mapInstance = null;

    loadLeaflet()
      .then((L) => {
        if (!mapRef.current) return;

        // Clean up previous map if exists
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.remove(); } catch (e) {}
          mapInstanceRef.current = null;
        }

        // Initialize map
        mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView([coords.lat, coords.lon], coords.isFallback ? 6 : 15);

        // Tile Layers
        const streetTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap'
        });

        const satelliteTiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; Esri World Imagery'
        });

        // Store references to switch styles later
        layersRef.current = {
          streets: streetTiles,
          satellite: satelliteTiles
        };

        // Set initial style
        layersRef.current[mapStyle].addTo(mapInstance);

        // Marker Icons
        const companyIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([coords.lat, coords.lon], { icon: companyIcon }).addTo(mapInstance);
        
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 150px; padding: 2px;">
            <strong style="font-size: 14px; color: #1F1F1F; display: block; margin-bottom: 4px;">${nombre}</strong>
            <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.3;">${direccion || ""}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold; color: #d97706;">${municipio || ""}</p>
          </div>
        `;
        marker.bindPopup(popupContent).openPopup();

        mapInstanceRef.current = mapInstance;
      })
      .catch((err) => {
        setError("Error al inicializar el mapa: " + err.message);
      });

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [coords, loading, nombre]);

  // 4. Handle Map Layer Swapping
  const toggleMapStyle = () => {
    const nextStyle = mapStyle === "streets" ? "satellite" : "streets";
    setMapStyle(nextStyle);
    
    const map = mapInstanceRef.current;
    if (map && layersRef.current[mapStyle] && layersRef.current[nextStyle]) {
      map.removeLayer(layersRef.current[mapStyle]);
      layersRef.current[nextStyle].addTo(map);
    }
  };

  // 5. Geolocation Tracker (Haversine Distance & Route Polyline)
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es compatible con tu navegador.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLon = position.coords.longitude;
        setUserCoords({ lat: uLat, lon: uLon });
        setGpsLoading(false);

        // Calculate distance (Haversine formula)
        const R = 6371; // Earth's radius in km
        const dLat = ((coords.lat - uLat) * Math.PI) / 180;
        const dLon = ((coords.lon - uLon) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((uLat * Math.PI) / 180) *
            Math.cos((coords.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        setDistance(dist);

        // Update map view and markers
        const map = mapInstanceRef.current;
        if (map && window.L) {
          // Remove old user marker
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          // Create a glowing pulsing blue marker for the user
          const userIcon = window.L.divIcon({
            className: "gps-user-marker-container",
            html: '<div class="gps-user-marker-pulse"></div><div class="gps-user-marker-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          userMarkerRef.current = window.L.marker([uLat, uLon], { icon: userIcon })
            .addTo(map)
            .bindPopup("<b>Tu ubicación actual</b>")
            .openPopup();

          // Remove old polyline
          if (routingLineRef.current) {
            map.removeLayer(routingLineRef.current);
          }

          // Draw polyline connecting user and company
          routingLineRef.current = window.L.polyline(
            [
              [uLat, uLon],
              [coords.lat, coords.lon]
            ],
            {
              color: "#3b82f6",
              weight: 4,
              dashArray: "8, 12",
              opacity: 0.8
            }
          ).addTo(map);

          // Fit bounds to show both markers
          map.fitBounds([
            [uLat, uLon],
            [coords.lat, coords.lon]
          ], { padding: [40, 40] });
        }
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        alert("No se pudo obtener tu ubicación. Por favor, concede los permisos de GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Helper calculations for estimated times
  const getTravelTimes = () => {
    if (!distance) return null;
    const carTime = Math.round((distance / 50) * 60); // 50 km/h average
    const bikeTime = Math.round((distance / 15) * 60); // 15 km/h average
    
    return {
      car: carTime < 1 ? "Menos de 1 min" : carTime >= 60 ? `${Math.floor(carTime / 60)}h ${carTime % 60}m` : `${carTime} min`,
      bike: bikeTime < 1 ? "Menos de 1 min" : bikeTime >= 60 ? `${Math.floor(bikeTime / 60)}h ${bikeTime % 60}m` : `${bikeTime} min`,
      formattedDistance: distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`
    };
  };

  const travelStats = getTravelTimes();

  // Inject pulsing GPS marker styles to document head
  useEffect(() => {
    const styleId = "gps-marker-styles";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .gps-user-marker-container {
          position: relative;
        }
        .gps-user-marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
          position: absolute;
          left: 4px;
          top: 4px;
        }
        .gps-user-marker-pulse {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.4);
          position: absolute;
          left: 0;
          top: 0;
          animation: gps-pulse-anim 1.8s infinite ease-out;
        }
        @keyframes gps-pulse-anim {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-96 w-full rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
        <FontAwesomeIcon icon={faCompass} size="2x" className="animate-spin text-slate-300" />
        <span className="text-xs font-semibold">Inicializando Navegador GPS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 w-full rounded-2xl bg-red-50 flex flex-col items-center justify-center text-red-500 text-xs p-4 text-center border border-red-100">
        <span className="font-bold mb-1">Fallo de Señal GPS</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      
      {/* GPS Dashboard Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-200 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCompass} className="text-primary animate-spin" style={{ animationDuration: '8s' }} />
            Navegador GPS
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-widest">
          ONLINE
        </span>
      </div>

      {/* Interactive Map view with Floating Overlays */}
      <div className="relative h-64 w-full">
        <div ref={mapRef} className="h-full w-full z-10" />
        
        {/* Floating Controller Panel on Top-Right of Map */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
          {/* Layer switcher */}
          <button
            onClick={toggleMapStyle}
            title={mapStyle === "streets" ? "Cambiar a Vista Satélite" : "Cambiar a Vista Calles"}
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-800 active:scale-95 transition-all text-xs font-bold rounded-xl shadow-md border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <FontAwesomeIcon icon={faLayerGroup} className="text-blue-600" />
            <span>{mapStyle === "streets" ? "Satélite" : "Calles"}</span>
          </button>
          
          {/* Locate user button */}
          <button
            onClick={locateUser}
            disabled={gpsLoading}
            title="Localizar mi GPS"
            className={`h-9 px-3 active:scale-95 transition-all text-xs font-bold rounded-xl shadow-md border flex items-center justify-center gap-1.5 ${
              userCoords 
                ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700" 
                : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
            }`}
          >
            <FontAwesomeIcon icon={faLocationArrow} className={gpsLoading ? "animate-bounce" : ""} />
            <span>{gpsLoading ? "Buscando..." : userCoords ? "GPS Activo" : "Mi GPS"}</span>
          </button>
        </div>
      </div>

      {/* GPS Stats / Direction Guide */}
      {userCoords && travelStats && (
        <div className="px-5 py-4 bg-blue-50/50 border-t border-b border-blue-100 grid grid-cols-3 gap-3 text-center">
          <div className="border-r border-blue-100/80 pr-2">
            <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">Distancia</span>
            <span className="text-lg font-extrabold text-slate-800">{travelStats.formattedDistance}</span>
          </div>
          <div className="border-r border-blue-100/80 pr-2">
            <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <FontAwesomeIcon icon={faCar} />
              En Auto
            </span>
            <span className="text-lg font-extrabold text-slate-800">{travelStats.car}</span>
          </div>
          <div>
            <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <FontAwesomeIcon icon={faBicycle} />
              En Bici
            </span>
            <span className="text-lg font-extrabold text-slate-800">{travelStats.bike}</span>
          </div>
        </div>
      )}

      {/* GPS Info Footer & Shortcuts */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-primary/10 text-amber-800 rounded-xl mt-0.5">
            <FontAwesomeIcon icon={faLocationDot} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección Destino</span>
            <span className="block text-xs font-bold text-slate-800 leading-tight truncate" title={direccion || municipio}>
              {direccion || "Sin dirección exacta"}
            </span>
            <span className="block text-[10px] font-bold text-primary mt-0.5 uppercase">
              {municipio || "Colombia"}
            </span>
          </div>
        </div>

        {/* GPS coordinates readout */}
        {coords && (
          <div className="px-3 py-1.5 bg-slate-200/50 rounded-xl font-mono text-[9px] text-slate-500 flex justify-between">
            <span>LAT: {coords.lat.toFixed(6)}</span>
            <span>LON: {coords.lon.toFixed(6)}</span>
          </div>
        )}

        {/* Action Shortcuts */}
        <div className="flex gap-2 pt-1.5">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200"
          >
            <FontAwesomeIcon icon={faRoute} />
            Google Maps
          </a>
          <a
            href={`https://waze.com/ul?ll=${coords.lat},${coords.lon}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#33ccff] hover:bg-[#2bbbe9] text-slate-900 font-extrabold text-xs rounded-xl shadow-sm transition-all duration-200"
          >
            🧭 Waze
          </a>
        </div>
      </div>
    </div>
  );
}
