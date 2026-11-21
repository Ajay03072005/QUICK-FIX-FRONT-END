import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, CheckCircle2, List, Map as MapIcon, ChevronRight, LocateFixed } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LeafletMapComponent from '../../components/map/LeafletMapComponent';
import StarRating from '../../components/common/StarRating';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { providerApi } from '../../api/providerApi';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';
import { useNotification } from '../../context/NotificationContext';
import { getCurrentCoordinates, reverseGeocodeCoordinates } from '../../utils/addressGeocoding';

export default function FindNearbyPage() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service') || searchParams.get('category') || searchParams.get('query') || '';
  const requestedServiceType = normalizeServiceType(requestedService);
  const initialLocation = searchParams.get('location') || 'your current location';

  const { updateDraft, bookingDraft } = useBooking();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationSource, setLocationSource] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState({ lat: '', lng: '' });
  const [addressDraft, setAddressDraft] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mobileViewTab, setMobileViewTab] = useState('LIST'); // 'LIST' | 'MAP'
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  const [locationCenter, setLocationCenter] = useState(() => {
    const queryLat = Number(searchParams.get('lat'));
    const queryLng = Number(searchParams.get('lng'));
    const hasQueryCoordinates = searchParams.has('lat') && searchParams.has('lng') && Number.isFinite(queryLat) && Number.isFinite(queryLng);
    if (hasQueryCoordinates) return { lat: queryLat, lng: queryLng, name: initialLocation, resolved: true };
    return { lat: null, lng: null, name: initialLocation, resolved: false };
  });

  useEffect(() => {
    serviceApi.getAllServices().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!locationCenter.resolved) return undefined;
    const controller = new AbortController();
    setResolvingAddress(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(locationCenter.lat)}&lon=${encodeURIComponent(locationCenter.lng)}&zoom=18&addressdetails=1`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Reverse geocoding failed with status ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setLocationAddress(data.display_name || '');
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError' && !controller.signal.aborted) setLocationAddress('');
      })
      .finally(() => {
        if (!controller.signal.aborted) setResolvingAddress(false);
      });
    return () => controller.abort();
  }, [locationCenter.lat, locationCenter.lng, locationCenter.resolved]);

  useEffect(() => {
    if (locationCenter.resolved) return undefined;
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support current location. Allow location access or provide an address first.');
      return undefined;
    }

    setLoading(true);
    setLocationError('');
    getCurrentCoordinates().then((coords) => {
        setLocationSource('device GPS');
        setLocationAccuracy(coords.accuracy);
        setLocationCenter({
          lat: coords.latitude,
          lng: coords.longitude,
          name: 'your current location',
          resolved: true
        });
        reverseGeocodeCoordinates(coords.latitude, coords.longitude)
          .then((address) => setLocationAddress(address.displayName || ''))
          .catch(() => setLocationAddress(''));
      }).catch((error) => {
        setLoading(false);
        setLocationCenter({ lat: null, lng: null, name: 'location unavailable', resolved: false });
        setLocationError(error.message.includes('accuracy')
          ? 'Your device returned an inaccurate location. Enable Windows/browser location services or use Edit location to confirm your address.'
          : 'Location access was blocked. Allow location access to find providers near you.');
        setEditingLocation(true);
      });
    return undefined;
  }, [locationCenter.resolved]);

  useEffect(() => {
    let active = true;
    if (!locationCenter.resolved) {
      setProviders([]);
      setSelectedProvider(null);
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setLoadError('');
    providerApi.getNearbyProviders({ latitude: locationCenter.lat, longitude: locationCenter.lng, radiusKm: 25, serviceType: requestedServiceType })
      .then(async (data) => {
        if (!active) return;
        if (data.length > 0) {
          setSearchRadius(25);
          return data;
        }
        const expandedData = await providerApi.getNearbyProviders({
          latitude: locationCenter.lat,
          longitude: locationCenter.lng,
          radiusKm: 50,
          serviceType: requestedServiceType
        });
        if (active) setSearchRadius(expandedData.length > 0 ? 50 : 25);
        return expandedData;
      })
      .then((data) => {
        if (!active || !data) return;
        setProviders(data);
        setSelectedProvider(data[0] || null);
      })
      .catch(() => { if (active) setLoadError('Could not load nearby providers. Check the connection and try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [locationCenter, requestedServiceType]);

  const selectedService = catalog.find((service) => normalizeServiceType(service.categoryId) === requestedServiceType);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support current location.');
      return;
    }
    setLocationError('');
    getCurrentCoordinates().then((coords) => {
        setLocationSource('device GPS');
        setLocationAccuracy(coords.accuracy);
        setLocationCenter({
          lat: coords.latitude,
          lng: coords.longitude,
          name: 'your current location',
          resolved: true
        });
        reverseGeocodeCoordinates(coords.latitude, coords.longitude)
          .then((address) => setLocationAddress(address.displayName || ''))
          .catch(() => setLocationAddress(''));
      }).catch((error) => {
        setLocationCenter({ lat: null, lng: null, name: 'location unavailable', resolved: false });
        setProviders([]);
        setLocationError(error.message.includes('accuracy')
          ? 'Your device returned an inaccurate location. Enable Windows/browser location services or use Edit location to confirm your address.'
          : 'Location access was blocked. Allow location access to find providers near you.');
        setEditingLocation(true);
      });
  };

  const startEditingLocation = () => {
    setLocationDraft({
      lat: locationCenter.lat == null ? '' : String(locationCenter.lat),
      lng: locationCenter.lng == null ? '' : String(locationCenter.lng)
    });
    setAddressDraft(locationAddress || locationCenter.name || '');
    setEditingLocation(true);
  };

  const applyEditedLocation = async () => {
    if (addressDraft.trim() && addressDraft.trim() !== locationAddress) {
      setSavingAddress(true);
      setLocationError('');
      try {
        const normalizedAddress = addressDraft.trim()
          .replace(/\bTamilnadu\b/gi, 'Tamil Nadu')
          .replace(/\bTuticorin\b/gi, 'Thoothukudi');
        const postalCode = normalizedAddress.match(/\b\d{6}\b/)?.[0];
        const city = normalizedAddress.match(/Thoothukudi/i)?.[0] || '';
        const queries = [
          normalizedAddress,
          city ? `${city}, Tamil Nadu, India` : '',
          postalCode && city ? `${postalCode}, ${city}, Tamil Nadu, India` : '',
          postalCode ? `${postalCode}, Tamil Nadu, India` : ''
        ].filter((query, index, all) => query && all.indexOf(query) === index);
        let result = null;
        for (const query of queries) {
          const params = new URLSearchParams({
            format: 'jsonv2',
            limit: '1',
            countrycodes: 'in',
            addressdetails: '1',
            q: query
          });
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error(`Address lookup failed with status ${response.status}`);
          const results = await response.json();
          if (results[0]) {
            result = results[0];
            break;
          }
        }
        if (!result) {
          setLocationError('Address not found. Try including the PIN code and city, or edit the coordinates.');
          return;
        }
        setLocationAccuracy(null);
        setLocationAddress(result.display_name || addressDraft.trim());
        setLocationCenter({
          lat: Number(result.lat),
          lng: Number(result.lon),
          name: result.display_name || addressDraft.trim(),
          resolved: true
        });
        setEditingLocation(false);
        return;
      } catch {
        setLocationError('Could not look up that address. Check your connection or edit the coordinates.');
        return;
      } finally {
        setSavingAddress(false);
      }
    }

    const lat = Number(locationDraft.lat);
    const lng = Number(locationDraft.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setLocationError('Enter valid coordinates: latitude -90 to 90 and longitude -180 to 180.');
      return;
    }
    setLocationError('');
    setLocationAccuracy(null);
    setLocationCenter({ lat, lng, name: 'edited location', resolved: true });
    setEditingLocation(false);
  };

  const handleSelectProviderForBooking = (prov) => {
    if (!selectedService) {
      showToast('Choose a service before selecting a provider.', 'error');
      navigate('/customer/find-service');
      return;
    }
    const distanceCharge = calculateDistanceCharge(prov.distance);
    updateDraft({
      service: selectedService,
      provider: prov,
      distanceKm: prov.distance,
      serviceCharge: selectedService.startingPrice,
      distanceCharge
    });
    navigate('/customer/select-address');
  };

  const filteredProviders = providers.filter(p => {
    if (filterAvailability === 'NOW') return p.availability === 'AVAILABLE_NOW';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Top Search Bar Header */}
      <section className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Location-First Discovery</span>
              <h1 className="text-2xl font-extrabold text-white">Find Nearby Service Providers</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>
                  Near {resolvingAddress ? 'resolving address...' : locationAddress || locationCenter.name || initialLocation}
                </span>
              </div>
              <button onClick={useCurrentLocation} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"><LocateFixed className="h-4 w-4"/>Use my location</button>
              <button onClick={startEditingLocation} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700">Edit location</button>
              <button
                onClick={() => setFilterAvailability(filterAvailability === 'NOW' ? 'ALL' : 'NOW')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filterAvailability === 'NOW'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Available Now Only
              </button>
            </div>
          </div>
          {locationError && (
            <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
              {locationError}
            </p>
          )}
          {locationAccuracy != null && !editingLocation && (
            <p className="mt-2 text-xs text-slate-400">
              Location from {locationSource || 'your device'} · accuracy approximately ±{Math.round(locationAccuracy)} m. If this is wrong, choose <button type="button" onClick={startEditingLocation} className="font-bold text-indigo-300 underline">Edit location</button>.
            </p>
          )}
          {editingLocation && (
            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
              <label className="w-full text-xs font-semibold text-slate-300">
                Address
                <input type="text" value={addressDraft} onChange={(event) => setAddressDraft(event.target.value)} placeholder="Enter area, city, state or postal code" className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white" />
              </label>
              <button onClick={applyEditedLocation} disabled={savingAddress} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50">{savingAddress ? 'Finding address...' : 'Apply address'}</button>
              <span className="w-full text-xs text-slate-400">Or edit coordinates:</span>
              <label className="text-xs font-semibold text-slate-300">
                Latitude
                <input type="number" step="any" value={locationDraft.lat} onChange={(event) => setLocationDraft((current) => ({ ...current, lat: event.target.value }))} className="mt-1 block w-36 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">
                Longitude
                <input type="number" step="any" value={locationDraft.lng} onChange={(event) => setLocationDraft((current) => ({ ...current, lng: event.target.value }))} className="mt-1 block w-36 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white" />
              </label>
              <button onClick={() => {
                const lat = Number(locationDraft.lat);
                const lng = Number(locationDraft.lng);
                if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
                  setLocationError('Enter valid coordinates: latitude -90 to 90 and longitude -180 to 180.');
                  return;
                }
                setLocationError('');
                setLocationAccuracy(null);
                setLocationCenter({ lat, lng, name: 'edited location', resolved: true });
                setEditingLocation(false);
              }} className="rounded-lg border border-indigo-400 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-900">Apply coordinates</button>
              <button onClick={() => setEditingLocation(false)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
            </div>
          )}
        </div>
      </section>

      {/* Mobile View Toggle Buttons */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex gap-2 sticky top-18 z-30">
        <button
          onClick={() => setMobileViewTab('LIST')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
            mobileViewTab === 'LIST' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <List className="w-4 h-4" /> Provider List ({filteredProviders.length})
        </button>
        <button
          onClick={() => setMobileViewTab('MAP')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
            mobileViewTab === 'MAP' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <MapIcon className="w-4 h-4" /> Live Map
        </button>
      </div>

      {/* Main Map + Provider List Side-by-Side Split View */}
      <main className="container mx-auto px-4 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Provider Cards List (Col 7 on Desktop) */}
          <div className={`md:col-span-6 lg:col-span-5 space-y-4 ${mobileViewTab === 'MAP' ? 'hidden md:block' : 'block'}`}>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredProviders.length} Nearby Providers
              </span>
              <span className="text-xs font-semibold text-slate-500">Within {searchRadius} km · nearest first</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <p className="text-sm font-bold text-slate-700">No nearby providers available right now.</p>
                <p className="text-xs text-slate-500">No providers with a service location were found within 50 km. Try using your current location or another search area.</p>
              </div>
            ) : (
              filteredProviders.map((prov) => {
                const isSelected = selectedProvider?.providerUniqueId === prov.providerUniqueId;

                return (
                  <div
                    key={prov.providerUniqueId}
                    onClick={() => setSelectedProvider(prov)}
                    className={`bg-white rounded-2xl border transition-all p-5 space-y-4 cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md bg-indigo-50/20'
                        : 'border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    {/* Recommendation Badge */}
                    {prov.recommended && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                        ⭐ Recommended for You
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={prov.avatar}
                          alt={prov.providerName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug">{prov.providerName}</h3>
                          <p className="text-xs text-slate-500 font-medium">{prov.contactPerson}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={prov.rating} reviewCount={prov.reviewCount} />
                            <span className="text-xs font-bold text-indigo-600">{prov.distance} km away</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border shrink-0 ${
                          (prov.availabilityStatus || prov.availability) === 'AVAILABLE_NOW'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {(prov.availabilityStatus || prov.availability) === 'AVAILABLE_NOW' ? 'Available Now' : 'Available soon'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{prov.bio}</p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Est. Starting Fare</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{selectedService?.startingPrice ?? '—'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/providers/${prov.providerUniqueId}`);
                          }}
                          className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProviderForBooking(prov);
                          }}
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1"
                        >
                          Select Provider <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Leaflet Map Interactive View (Col 6/7 on Desktop) */}
          <div className={`md:col-span-6 lg:col-span-7 sticky top-24 ${mobileViewTab === 'LIST' ? 'hidden md:block' : 'block'}`}>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Interactive Provider Map
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">Click pins to inspect details</span>
              </div>
              <LeafletMapComponent
                customerLocation={{ lat: locationCenter.lat, lng: locationCenter.lng, name: locationCenter.name || initialLocation }}
                providers={filteredProviders}
                selectedProviderId={selectedProvider?.providerUniqueId}
                onSelectProvider={(prov) => setSelectedProvider(prov)}
                height="620px"
              />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function normalizeServiceType(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function calculateDistanceCharge(distance) {
  if (distance <= 2) return 30;
  if (distance <= 5) return 50;
  if (distance <= 10) return 100;
  return 150;
}
