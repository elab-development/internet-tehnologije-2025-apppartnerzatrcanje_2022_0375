"use client";

import { useEffect, useMemo, useRef } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

type MarkerItem = {
  id: number | string;
  lat: number;
  lng: number;
  label: string;
};

type LeafletMap = {
  setView: (latLng: [number, number], zoom: number) => LeafletMap;
  on: (eventName: string, handler: (event: { latlng: LatLng }) => void) => void;
  remove: () => void;
  getZoom: () => number;
  invalidateSize: () => void;
};

type LeafletMarker = {
  addTo: (mapOrLayer: unknown) => LeafletMarker;
  bindPopup: (text: string) => LeafletMarker;
  remove: () => void;
};

type LeafletCircleMarker = {
  addTo: (mapOrLayer: unknown) => LeafletCircleMarker;
  bindPopup: (text: string) => LeafletCircleMarker;
  remove: () => void;
};

type LeafletLayerGroup = {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
};

type LeafletCircle = {
  addTo: (map: LeafletMap) => LeafletCircle;
  remove: () => void;
};

type LeafletGlobal = {
  map: (element: HTMLElement) => LeafletMap;
  tileLayer: (url: string, options: { attribution: string }) => { addTo: (map: LeafletMap) => void };
  marker: (latLng: [number, number]) => LeafletMarker;
  circleMarker: (
    latLng: [number, number],
    options: { radius: number; color: string; fillColor: string; fillOpacity: number; weight: number }
  ) => LeafletCircleMarker;
  layerGroup: () => LeafletLayerGroup;
  circle: (
    latLng: [number, number],
    options: { radius: number; color: string; fillColor: string; fillOpacity: number }
  ) => LeafletCircle;
};

declare global {
  interface Window {
    L?: LeafletGlobal;
  }
}

const DEFAULT_CENTER: LatLng = { lat: 44.8125, lng: 20.4612 };
let leafletLoadPromise: Promise<void> | null = null;

async function ensureLeaflet() {
  if (window.L) {
    return;
  }

  if (!document.querySelector("link[data-leaflet='true']")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "true";
    document.head.appendChild(link);
  }

  if (!leafletLoadPromise) {
    leafletLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>("script[data-leaflet='true']");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Leaflet script error")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.defer = true;
      script.dataset.leaflet = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Leaflet script error"));
      document.head.appendChild(script);
    });
  }

  await leafletLoadPromise;
}

export function StartPinPicker({
  value,
  onChange,
  className = "h-72",
}: {
  value: LatLng | null;
  onChange: (point: LatLng | null) => void;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletCircleMarker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!mapRef.current) {
        return;
      }
      await ensureLeaflet();
      if (cancelled || !window.L || !mapRef.current) {
        return;
      }

      mapInstanceRef.current = window.L.map(mapRef.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on("click", (event) => {
        onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
      });

      // Leaflet can render offset when container size settles after first paint.
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 0);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onResize = () => mapInstanceRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) {
      return;
    }

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (value) {
      markerRef.current = window.L
        .circleMarker([value.lat, value.lng], {
          radius: 8,
          color: "#14532d",
          fillColor: "#16a34a",
          fillOpacity: 0.8,
          weight: 2,
        })
        .addTo(mapInstanceRef.current);
      mapInstanceRef.current.setView([value.lat, value.lng], Math.max(mapInstanceRef.current.getZoom(), 13));
    }
  }, [value]);

  return (
    <div className={`overflow-hidden rounded-xl border border-[var(--color-line)] ${className}`}>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}

export function RunsRadiusMap({
  markers,
  radiusKm,
  selectedCenter,
  onSelectedCenterChange,
  className = "h-[520px]",
}: {
  markers: MarkerItem[];
  radiusKm: number;
  selectedCenter: LatLng | null;
  onSelectedCenterChange: (value: LatLng | null) => void;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const selectedCenterRef = useRef<LatLng | null>(selectedCenter);

  useEffect(() => {
    selectedCenterRef.current = selectedCenter;
  }, [selectedCenter]);
  const filteredMarkers = useMemo(() => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const distance = (a: LatLng, b: LatLng) => {
      const earthKm = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const h =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      return 2 * earthKm * Math.asin(Math.sqrt(h));
    };
    if (!selectedCenter) {
      return markers;
    }
    return markers.filter((marker) => distance(selectedCenter, { lat: marker.lat, lng: marker.lng }) <= radiusKm);
  }, [markers, radiusKm, selectedCenter]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!mapRef.current) {
        return;
      }
      await ensureLeaflet();
      if (cancelled || !window.L || !mapRef.current) {
        return;
      }

      mapInstanceRef.current = window.L.map(mapRef.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 12);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
      mapInstanceRef.current.on("click", (event) => {
        if (selectedCenterRef.current) {
          onSelectedCenterChange(null);
        } else {
          onSelectedCenterChange({ lat: event.latlng.lat, lng: event.latlng.lng });
        }
      });
      markerLayerRef.current = window.L.layerGroup().addTo(mapInstanceRef.current);

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 0);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectedCenterChange]);

  useEffect(() => {
    const onResize = () => mapInstanceRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !markerLayerRef.current) {
      return;
    }

    if (selectedCenter) {
      mapInstanceRef.current.setView([selectedCenter.lat, selectedCenter.lng], mapInstanceRef.current.getZoom());
    }
    markerLayerRef.current.clearLayers();
    if (circleRef.current) {
      circleRef.current.remove();
    }

    if (selectedCenter) {
      circleRef.current = window.L
        .circle([selectedCenter.lat, selectedCenter.lng], {
          radius: radiusKm * 1000,
          color: "#2f7f66",
          fillColor: "#74c69d",
          fillOpacity: 0.15,
        })
        .addTo(mapInstanceRef.current);

      window.L
        .circleMarker([selectedCenter.lat, selectedCenter.lng], {
          radius: 7,
          color: "#1d4ed8",
          fillColor: "#60a5fa",
          fillOpacity: 0.8,
          weight: 2,
        })
        .addTo(markerLayerRef.current)
        .bindPopup("Centar pretrage");
    }
    for (const marker of filteredMarkers) {
      window.L
        .circleMarker([marker.lat, marker.lng], {
          radius: 7,
          color: "#7c2d12",
          fillColor: "#fb923c",
          fillOpacity: 0.85,
          weight: 2,
        })
        .addTo(markerLayerRef.current)
        .bindPopup(marker.label);
    }
  }, [filteredMarkers, radiusKm, selectedCenter]);

  return (
    <div className="space-y-2">
      <div className={`overflow-hidden rounded-xl border border-[var(--color-line)] ${className}`}>
        <div ref={mapRef} className="h-full w-full" />
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Klik na mapu postavlja centar i radius filter. Ako centar vec postoji, sledeci klik ga uklanja.
      </p>
    </div>
  );
}
