"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

function CarsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    fuelTypes: [],
    seatingCapacities: [],
    priceRange: { min: 0, max: 0 }
  });
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    location: searchParams.get('location') || '',
    tripStart: searchParams.get('tripStart') || '',
    tripEnd: searchParams.get('tripEnd') || '',
    category: '',
    fuelType: '',
    seatingCapacity: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchFilterOptions();
  }, [filters.city, filters.location]);

  useEffect(() => {
    fetchVehicles();
  }, [filters.city, filters.location, filters.category, filters.fuelType, filters.seatingCapacity]);

  const fetchFilterOptions = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      
      const queryParams = new URLSearchParams({
        status: 'active'
      });
      
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.location) queryParams.append('location', filters.location);
      
      const res = await fetch(`${API_BASE}/api/vehicles/filter-options?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setFilterOptions(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      
      // Build query parameters for the search API
      const queryParams = new URLSearchParams({
        status: 'active'
      });
      
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.tripStart) queryParams.append('tripStart', filters.tripStart);
      if (filters.tripEnd) queryParams.append('tripEnd', filters.tripEnd);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.fuelType) queryParams.append('fuelType', filters.fuelType);
      if (filters.seatingCapacity) queryParams.append('seatingCapacity', filters.seatingCapacity);
      
      // Use the new search API endpoint
      const res = await fetch(`${API_BASE}/api/vehicles/search/by-location?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        // The new API returns data in result.data
        const data = result.data || result;
        setVehicles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    // Additional client-side filtering for price range
    if (filters.minPrice && vehicle.pricePerDay < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && vehicle.pricePerDay > parseInt(filters.maxPrice)) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">
            Available Cars {filters.city ? `in ${filters.city}` : ''}
          </h1>
          <p className="text-green-100">
            {filters.location && <span> {filters.location}</span>}
            {filters.location && filters.tripStart && <span> • </span>}
            {filters.tripStart && `Trip Start: ${new Date(filters.tripStart).toLocaleDateString()}`}
            {filters.tripEnd && ` • Trip End: ${new Date(filters.tripEnd).toLocaleDateString()}`}
            {!filters.city && !filters.tripStart && 'Browse our entire fleet'}
          </p>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={filters.fuelType}
                  onChange={(e) => setFilters({...filters, fuelType: e.target.value})}
                >
                  <option value="">All</option>
                  {filterOptions.fuelTypes.map(fuelType => (
                    <option key={fuelType} value={fuelType}>{fuelType}</option>
                  ))}
                </select>
              </div>

              {/* Seating Capacity Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={filters.seatingCapacity}
                  onChange={(e) => setFilters({...filters, seatingCapacity: e.target.value})}
                >
                  <option value="">All</option>
                  {filterOptions.seatingCapacities.map(capacity => (
                    <option key={capacity} value={capacity}>{capacity} Seater</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹/day)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div> */}

              <button
                onClick={() => setFilters({...filters, category: '', fuelType: '', seatingCapacity: '', minPrice: '', maxPrice: ''})}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${filteredVehicles.length} cars available`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading vehicles...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-lg">No vehicles found matching your criteria</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Try a different search
                </button>
              </div>
            ) : (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicleId || vehicle._id}
                    className="group relative bg-white rounded-2xl border border-gray-200 shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-[#F7F8FA] overflow-hidden rounded-t-2xl">
                      {vehicle.carFullPhoto ? (
                        <img
                          src={vehicle.carFullPhoto}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🚘</div>
                      )}

                      {/* Status */}
                      <span className="absolute top-4 right-4 bg-black/10 text-gray-500 text-[11px] px-3 py-1 rounded-full tracking-wide">
                        {vehicle.status || "AVAILABLE"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      {/* Title */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vehicle.carName || vehicle.registrationNumber}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18v-6a3 3 0 00-3-3H9a3 3 0 00-3 3v6M3 22h18M6 18v4M18 18v4M12 9V3M12 3L9 6M12 3l3 3" />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {vehicle.seatingCapacity || 5} Seats
                          </span>
                        </div>

                        <div className="w-px h-4 bg-gray-300" />

                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h10v12H3zM13 11h2.5l2 3v7h-1.5M16 21v-7M3 6h10M3 15h10M7.5 3v3" />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {vehicle.fuelType || "Petrol"}
                          </span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Price per day
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{vehicle.pricePerDay || 1500}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              city: searchParams.get('city') || '',
                              location: searchParams.get('location') || '',
                              tripStart: searchParams.get('tripStart') || '',
                              tripEnd: searchParams.get('tripEnd') || ''
                            });
                            router.push(`/car-details/${vehicle.vehicleId || vehicle._id}?${params.toString()}`);
                          }}
                          className="bg-[#171717] text-white px-6 py-3 rounded-xl text-sm font-semibold transition active:scale-95"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <CarsPageContent />
    </Suspense>
  );
}
