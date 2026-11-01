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

export default function FindNearbyPage() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service') || searchParams.get('category') || 'AC_REPAIR';
  const requestedServiceType = normalizeServiceType(requestedService);
  const initialLocation = searchParams.get('location') || 'Coimbatore, Tamil Nadu';

  const { updateDraft, bookingDraft } = useBooking();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mobileViewTab, setMobileViewTab] = useState('LIST'); // 'LIST' | 'MAP'
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  const [locationCenter, setLocationCenter] = useState(() => {
    const queryLat = Number(searchParams.get('lat'));
    const queryLng = Number(searchParams.get('lng'));
    const address = bookingDraft.address;
    const hasQueryCoordinates = searchParams.has('lat') && searchParams.has('lng') && Number.isFinite(queryLat) && Number.isFinite(queryLng);
    const hasAddressCoordinates = address?.latitude != null && address?.longitude != null
      && Number.isFinite(Number(address.latitude)) && Number.isFinite(Number(address.longitude));
    if (hasQueryCoordinates) return { lat: queryLat, lng: queryLng, name: initialLocation, resolved: true };
    if (hasAddressCoordinates) return { lat: Number(address.latitude), lng: Number(address.longitude), name: address.label || initialLocation, resolved: true };
    if (/coimbatore/i.test(initialLocation)) return { lat: 11.0125, lng: 76.9515, name: initialLocation, resolved: true };
    return { lat: 11.0125, lng: 76.9515, name: initialLocation, resolved: false };
  });

  useEffect(() => {
    serviceApi.getAllServices().then(setCatalog).catch(() => setCatalog([]));
  }, []);

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
      .then((data) => {
        if (!active) return;
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
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocationCenter({ lat: coords.latitude, lng: coords.longitude, name: 'your current location', resolved: true }),
      () => setLocationError('Location access was blocked. Allow location access or search Coimbatore.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
                <span>Near {locationCenter.name || initialLocation}</span>
              </div>
              <button onClick={useCurrentLocation} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"><LocateFixed className="h-4 w-4"/>Use my location</button>
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
              <span className="text-xs font-semibold text-slate-500">Within 25 km · nearest first</span>
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
                <p className="text-xs text-slate-500">No providers with a service location were found within 25 km. Try using your current location or another search area.</p>
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
                          prov.availability === 'AVAILABLE_NOW'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {prov.availability === 'AVAILABLE_NOW' ? 'Available Now' : 'Available in 30m'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{prov.bio}</p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Est. Starting Fare</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{prov.estimatedPrice}</span>
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
