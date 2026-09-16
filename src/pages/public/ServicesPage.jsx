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
    updateDraft({ service: srv, serviceCharge: srv.startingPrice });
    navigate('/customer/select-address');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-4">
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
              className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-lg"
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
              selectedCat === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                    {srv.categoryName}
                  </span>
                  <StarRating rating={srv.rating} reviewCount={srv.reviewCount} />
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{srv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.shortDescription}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Starting From</span>
                  <span className="text-xl font-extrabold text-indigo-600">₹{srv.startingPrice}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookService(srv)}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1"
                  >
                    Book Now <ChevronRight className="w-4 h-4" />
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
