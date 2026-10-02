import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  height?: string;
  zoom?: number;
}

// Leaflet custom marker icon using SVG
const customMarkerIcon = new L.DivIcon({
  className: 'custom-map-marker',
  html: `
    <div style="
      background-color: #059669;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map clicks
function LocationMarker({
  position,
  setPosition,
  readOnly,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  readOnly?: boolean;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (!readOnly) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return <Marker position={position} icon={customMarkerIcon} />;
}

// Helper to pan map when center changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
  height = '300px',
  zoom = 13,
}) => {
  // Default coordinates (Springfield IL or coordinates provided)
  const defaultPos: [number, number] = [39.7817, -89.6501];
  const initialPos: [number, number] =
    latitude && longitude ? [latitude, longitude] : defaultPos;

  const [position, setPosition] = useState<[number, number]>(initialPos);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    if (onChange) {
      onChange(newPos[0], newPos[1]);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        handlePositionChange(newPos);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          err.code === 1
            ? 'Location permission denied. You can click on the map to choose your pickup spot.'
            : 'Unable to retrieve location.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-charcoal-700 bg-slate-100 dark:bg-charcoal-800 shadow-sm">
      <div style={{ height }}>
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={handlePositionChange}
            readOnly={readOnly}
          />
          <RecenterMap position={position} />
        </MapContainer>
      </div>

      {/* Floating Controls for Interactive Mode */}
      {!readOnly && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-charcoal-900 text-charcoal-800 dark:text-slate-100 text-xs font-semibold rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 transition-all disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>
      )}

      {/* Helper Bar */}
      <div className="px-3 py-2 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-charcoal-800 flex items-center justify-between text-xs text-charcoal-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </span>
        </div>
        {!readOnly && (
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
            Click map to adjust pin
          </span>
        )}
      </div>

      {/* Geolocation Notice */}
      {geoError && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs border-t border-amber-200 dark:border-amber-800/40 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}
    </div>
  );
};
