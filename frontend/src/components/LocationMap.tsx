import { useEffect, useMemo, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatTemperature } from './format';
import { CloseIcon, LocationIcon } from './icons';
import type { Location } from '../types';

interface LocationMapProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198];

function MapViewport({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      map.setView(SINGAPORE_CENTER, 11);
      return;
    }

    const bounds: LatLngBoundsExpression = locations.map((location) => [
      location.latitude,
      location.longitude,
    ]);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [locations, map]);

  return null;
}

function markerIcon(location: Location, selected: boolean) {
  const temperature = formatTemperature(location.weather.temperature_c);
  return L.divIcon({
    className: 'weather-map-marker-wrapper',
    html: `<div class="weather-map-marker${selected ? ' is-selected' : ''}">
      <span class="weather-map-marker-dot"></span>
      <span class="weather-map-marker-label">${temperature}</span>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 35],
  });
}

function MapSurface({
  locations,
  selectedId,
  onSelect,
  expanded,
}: LocationMapProps & { expanded: boolean }) {
  return (
    <MapContainer
      className={expanded ? 'weather-map weather-map-expanded' : 'weather-map'}
      center={SINGAPORE_CENTER}
      zoom={11}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport locations={locations} />
      {locations.map((location) => {
        const selected = location.id === selectedId;
        const area =
          location.weather.area ||
          `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;
        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={markerIcon(location, selected)}
            eventHandlers={{ click: () => onSelect(location.id) }}
          >
            <Tooltip permanent direction="top" offset={[0, -30]} className="weather-map-tooltip">
              {area}
            </Tooltip>
            <Popup>
              <strong>{area}</strong>
              <br />
              {formatTemperature(location.weather.temperature_c)}
              {location.weather.condition ? ` · ${location.weather.condition}` : ''}
            </Popup>
          </Marker>
        );
      })}
      {locations.length === 0 && (
        <CircleMarker center={SINGAPORE_CENTER} radius={8} pathOptions={{ color: '#fff' }} />
      )}
    </MapContainer>
  );
}

export function LocationMap({ locations, selectedId, onSelect }: LocationMapProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  const title = useMemo(
    () => (locations.length === 1 ? '1 saved location' : `${locations.length} saved locations`),
    [locations.length],
  );

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
            <LocationIcon className="h-3.5 w-3.5" />
            <span>Locations</span>
            <span className="text-white/40">·</span>
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs text-white/80 hover:bg-white/[0.16]"
          >
            Expand
          </button>
        </header>
        <MapSurface
          locations={locations}
          selectedId={selectedId}
          onSelect={onSelect}
          expanded={false}
        />
      </section>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-3 backdrop-blur-md sm:p-6">
          <div className="relative h-full overflow-hidden rounded-2xl border border-white/20 bg-slate-800 shadow-2xl">
            <button
              type="button"
              aria-label="Close expanded map"
              onClick={() => setExpanded(false)}
              className="absolute right-4 top-4 z-[1000] rounded-full border border-white/20 bg-slate-900/80 p-2 text-white/80 hover:bg-slate-900"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <MapSurface
              locations={locations}
              selectedId={selectedId}
              onSelect={onSelect}
              expanded
            />
          </div>
        </div>
      )}
    </>
  );
}
