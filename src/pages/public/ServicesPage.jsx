import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { serviceApi } from '../../api/serviceApi';
import { useBooking } from '../../context/BookingContext';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { updateDraft } = useBooking();

  useEffect(() => {
    serviceApi.getCategories().then(setCategories);
    serviceApi.getAllServices().then(setServices);
  }, []);

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          srv.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || srv.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleBookService = (srv) => {
    updateDraft({ service: srv, serviceCharge: srv.startingPrice, bookingUniqueId: undefined, provider: null, distanceKm: undefined, distanceCharge: undefined });
    navigate('/customer/select-address');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <div className="bg-slate-950 text-white py-14 border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Available Services</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">All Home & Local Services</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm">
            Transparent pricing, instant provider discovery, and guaranteed satisfaction for every job.
          </p>

          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
            <input
              type="text"
              placeholder="Search AC servicing, plumbing, switchboard repair..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-lg"
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-10 flex-1 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === 'ALL' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat.id ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.uniqueId}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-100">
                    {srv.categoryName}
                  </span>
                  <StarRating rating={srv.rating} reviewCount={srv.reviewCount} />
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{srv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.shortDescription}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Starts from</span>
                  <span className="text-xl font-extrabold text-emerald-700">₹{srv.startingPrice}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/services/${srv.uniqueId}`}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => handleBookService(srv)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
