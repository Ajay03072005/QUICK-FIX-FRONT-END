import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import StarRating from '../common/StarRating';

// Custom Marker Icons using Leaflet L.divIcon for modern CSS design
const createCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-customer-pin',
    html: `
      <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); border: 3px solid white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

const createProviderIcon = (isRecommended = false, isSelected = false) => {
  const bg = isSelected ? '#4f46e5' : isRecommended ? '#0d9488' : '#1e293b';
  const scale = isSelected || isRecommended ? '1.15' : '1.0';
  return L.divIcon({
    className: 'custom-provider-pin',
    html: `
      <div style="transform: scale(${scale}); background-color: ${bg}; color: white; padding: 6px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25); border: 2px solid white; font-weight: bold; font-size: 11px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        ${isRecommended ? '⭐ Top' : 'Pro'}
      </div>
    `,
    iconSize: [60, 32],
    iconAnchor: [30, 16],
    popupAnchor: [0, -18]
  });
};

// Component to dynamically re-center map when location changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function LeafletMapComponent({
  customerLocation = null,
  providers = [],
  selectedProviderId = null,
  onSelectProvider = () => {},
  providerLocation = null,
  route = [],
  height = "500px"
}) {
  const customerLat = Number(customerLocation.lat);
  const customerLng = Number(customerLocation.lng);
  const centerPos = [customerLat, customerLng];
  if (!Number.isFinite(customerLat) || !Number.isFinite(customerLng)) return null;

  return (
    <div style={{ height }} className="w-full relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={centerPos}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={centerPos} />

        {/* Customer Location Pin */}
        <Marker position={centerPos} icon={createCustomerIcon()}>
          <Popup>
            <div className="p-1 space-y-1 text-slate-800">
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Your Location</span>
              <p className="text-xs font-semibold">{customerLocation.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Provider Location Pins */}
        {providers.map((prov) => {
          const lat = Number(prov.coordinates?.lat ?? prov.latitude);
          const lng = Number(prov.coordinates?.lng ?? prov.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          const isSelected = selectedProviderId === prov.providerUniqueId;

          return (
            <Marker
              key={prov.providerUniqueId}
              position={[lat, lng]}
              icon={createProviderIcon(prov.recommended, isSelected)}
              eventHandlers={{
                click: () => onSelectProvider(prov)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 max-w-xs">
                  {prov.recommended && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ⭐ Recommended for You
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{prov.providerName}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <StarRating rating={prov.rating} />
                    <span className="font-semibold text-slate-800">{prov.distance} km away</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs font-bold text-indigo-600">₹{prov.estimatedPrice} est.</span>
                    <button
                      onClick={() => onSelectProvider(prov)}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                    >
                      Select Provider
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {providerLocation?.lat != null && providerLocation?.lng != null && (
          <Marker position={[providerLocation.lat, providerLocation.lng]} icon={createProviderIcon(false, true)}>
            <Popup><span className="text-xs font-semibold">Assigned provider</span></Popup>
          </Marker>
        )}
        {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#4f46e5', weight: 5, opacity: 0.75 }} />}
      </MapContainer>
    </div>
  );
}
