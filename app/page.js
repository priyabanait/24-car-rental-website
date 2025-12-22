"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './components/Header'
import Footer from './components/Footer'

function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: '',
    location: '',
    tripStart: '',
    tripEnd: '',
    delivery: false
  });

  const [activeTab, setActiveTab] = useState('daily');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [cityAddresses, setCityAddresses] = useState([]);
  const [showAddresses, setShowAddresses] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
        const res = await fetch(`${API_BASE}/api/cities?isActive=true`);
        if (res.ok) {
          const data = await res.json();
          setCities(data);
          // Set first city as default if available
          if (data.length > 0 && !formData.city) {
            setFormData(prev => ({ ...prev, city: data[0].name }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch addresses when city changes
  useEffect(() => {
    if (formData.city && cities.length > 0) {
      const selectedCity = cities.find(c => c.name === formData.city);
      if (selectedCity && selectedCity.addresses && selectedCity.addresses.length > 0) {
        setCityAddresses(selectedCity.addresses);
        // Auto-fill primary address or clear location when city changes
        const primaryAddress = selectedCity.addresses.find(addr => addr.isPrimary);
        if (primaryAddress) {
          setFormData(prev => ({ ...prev, location: primaryAddress.address }));
        } else {
          // If no primary, clear location so user can select
          setFormData(prev => ({ ...prev, location: '' }));
        }
      } else {
        setCityAddresses([]);
        setFormData(prev => ({ ...prev, location: '' }));
      }
    } else {
      setCityAddresses([]);
      setFormData(prev => ({ ...prev, location: '' }));
    }
  }, [formData.city, cities]);

  // Get current location
  const getCurrentLocation = () => {
    setFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            setFormData(prev => ({ ...prev, location: address }));
          } catch (err) {
            console.error('Failed to get address:', err);
            setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
          } finally {
            setFetchingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
          setFetchingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setFetchingLocation(false);
    }
  };

  // Fetch vehicles from Bangalore
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
        const res = await fetch(`${API_BASE}/api/vehicles?city=Bangalore&status=active&limit=100`);
        if (res.ok) {
          const data = await res.json();
          console.log('Vehicles data:', data);
          // Handle both array response and paginated response with data property
          let vehiclesArray = [];
          if (Array.isArray(data)) {
            vehiclesArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            vehiclesArray = data.data;
          } else if (data.vehicles && Array.isArray(data.vehicles)) {
            vehiclesArray = data.vehicles;
          }
          setVehicles(vehiclesArray);
        } else {
          console.error('Failed to fetch vehicles:', res.status, res.statusText);
          setVehicles([]);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  const popularCars = [
    { name: 'Swift Dzire', type: 'Sedan', price: '₹1,800', period: 'day', rating: 4.8, trips: 1250, fuel: 'Petrol', seats: 5, transmission: 'Manual', color: 'from-blue-400 to-blue-600' },
    { name: 'Honda City', type: 'Sedan', price: '₹2,200', period: 'day', rating: 4.9, trips: 980, fuel: 'Petrol', seats: 5, transmission: 'Automatic', color: 'from-gray-400 to-gray-600' },
    { name: 'Mahindra XUV500', type: 'SUV', price: '₹3,500', period: 'day', rating: 4.7, trips: 850, fuel: 'Diesel', seats: 7, transmission: 'Manual', color: 'from-red-400 to-red-600' },
    { name: 'Hyundai Creta', type: 'SUV', price: '₹2,800', period: 'day', rating: 4.8, trips: 1100, fuel: 'Diesel', seats: 5, transmission: 'Automatic', color: 'from-white to-gray-300' },
    { name: 'Maruti Ertiga', type: 'MUV', price: '₹2,000', period: 'day', rating: 4.6, trips: 920, fuel: 'Petrol', seats: 7, transmission: 'Manual', color: 'from-teal-400 to-teal-600' },
    { name: 'Toyota Innova', type: 'MUV', price: '₹3,200', period: 'day', rating: 4.9, trips: 1500, fuel: 'Diesel', seats: 7, transmission: 'Automatic', color: 'from-purple-400 to-purple-600' },
  ];

  const features = [
    { icon: '🛡️', title: 'Safe & Secure', description: 'All vehicles are sanitized and regularly maintained', gradient: 'from-blue-500 to-blue-600' },
    { icon: '💎', title: 'Best Prices', description: 'Competitive pricing with no hidden charges', gradient: 'from-green-500 to-green-600' },
    { icon: '⚡', title: 'Easy Booking', description: 'Book your ride in just a few clicks', gradient: 'from-yellow-500 to-orange-500' },
    { icon: '🎯', title: '24/7 Support', description: 'Round the clock customer assistance', gradient: 'from-purple-500 to-pink-500' },
  ];

  const testimonials = [
    { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent service! The car was clean and well-maintained.', location: 'Chennai' },
    { name: 'Priya Sharma', rating: 5, comment: 'Smooth booking process and great customer support.', location: 'Mumbai' },
    { name: 'Amit Patel', rating: 4, comment: 'Good experience overall. Will definitely book again.', location: 'Bangalore' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.city) {
      alert('Please select a city');
      return;
    }
    if (!formData.tripStart) {
      alert('Please select trip start date');
      return;
    }
    
    // Build query string with all search parameters including trip dates
    const params = new URLSearchParams({
      city: formData.city,
      location: formData.location || '',
      tripStart: formData.tripStart,
      tripEnd: formData.tripEnd || '',
      status: 'active'
    });
    
    // Navigate to cars page with search params
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 overflow-hidden">
        {/* White Dots Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`,
          backgroundSize: '30px 30px',
          opacity: 0.4
        }}></div>
        
        <div className="max-w-7xl px-4 py-12 md:py-16 relative z-10 lg:ml-20">
         <div className="grid lg:grid-cols-2 gap-8 lg:gap-60 items-center">
            {/* Left Side - Booking Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                {/* Tabs */}
                {/* <div className="flex border-b border-gray-200 mb-6">
                  <button 
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 pb-4 text-center font-semibold transition-all relative ${
                      activeTab === 'daily' 
                        ? 'text-teal-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="text-sm md:text-base">Daily Drives</div>
                    <div className="text-xs text-gray-500">Upto 7 days</div>
                    {activeTab === 'daily' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700"></div>}
                  </button>
                  <button 
                    ononSubmit={handleSearch} Click={() => setActiveTab('subscription')}
                    className={`flex-1 pb-4 text-center font-semibold transition-all relative ${
                      activeTab === 'subscription' 
                        ? 'text-teal-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="text-sm md:text-base flex items-center justify-center gap-2">
                      Subscription 
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-sm">New</span>
                    </div>
                    <div className="text-xs text-gray-500">7 day+ rides</div>
                    {activeTab === 'subscription' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700"></div>}
                  </button>
                </div> */}
                
                {/* Form Header */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Looking for Best Car Rentals?</p>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Book Self-Drive Car Rentals Across India
                  </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSearch} className="space-y-2">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      disabled={loadingCities}
                    >
                      {loadingCities ? (
                        <option>Loading cities...</option>
                      ) : cities.length === 0 ? (
                        <option>No cities available</option>
                      ) : (
                        <>
                          <option value="">Select a city</option>
                          {cities.map((city) => (
                            <option key={city._id} value={city.name}>
                              {city.name}, {city.state}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          placeholder={cityAddresses.length > 0 ? "Click to select address or enter manually" : "Enter your location or use current location"}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          onFocus={() => cityAddresses.length > 0 && setShowAddresses(true)}
                          onBlur={() => setTimeout(() => setShowAddresses(false), 200)}
                        />
                        
                        {/* Address Dropdown */}
                        {showAddresses && cityAddresses.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {cityAddresses.map((addr, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setFormData({...formData, location: addr.address});
                                  setShowAddresses(false);
                                }}
                                className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-start gap-2">
                                  {addr.isPrimary && (
                                    <span className="text-green-600 font-semibold text-sm mt-0.5">★</span>
                                  )}
                                  <div className="flex-1">
                                    {addr.label && (
                                      <div className="text-xs font-semibold text-gray-700 mb-1">
                                        {addr.label}
                                        {addr.isPrimary && <span className="text-green-600 ml-1">(Primary)</span>}
                                      </div>
                                    )}
                                    <div className="text-sm text-gray-900">{addr.address}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={fetchingLocation}
                        className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Use current location"
                      >
                        {fetchingLocation ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <span>📍</span>
                        )}
                      </button> */}
                    </div>
                  </div>

                  {/* Trip Dates */}
                 <div className="grid grid-cols-2 gap-4">
  {/* Trip Start Date */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Trip Start Date
    </label>
    <input
      type="date"
      className="w-full px-4 py-3 border border-gray-300 rounded-md 
                 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      value={formData.tripStart}
      min={new Date().toISOString().split("T")[0]}
      onChange={(e) =>
        setFormData({
          ...formData,
          tripStart: e.target.value,
          tripEnd: "" // reset end date when start changes
        })
      }
    />
  </div>

  {/* Trip End Date */}
  {/* <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Trip End Date
    </label>
    <input
      type="date"
      className="w-full px-4 py-3 border border-gray-300 rounded-md 
                 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      value={formData.tripEnd}
      min={formData.tripStart || new Date().toISOString().split("T")[0]}
      disabled={!formData.tripStart}
      onChange={(e) =>
        setFormData({
          ...formData,
          tripEnd: e.target.value
        })
      }
    />
  </div> */}
</div>


                  {/* Delivery Checkbox */}
                  {/* <div className="flex items-center">
                    <input 
                      type="checkbox"
                      id="delivery"
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      checked={formData.delivery}
                      onChange={(e) => setFormData({...formData, delivery: e.target.checked})}
                    />
                    <label htmlFor="delivery" className="ml-2 text-sm text-gray-700">
                      Delivery & Pick-up, from anywhere
                    </label>
                  </div> */}

                  {/* Search Button */}
                  <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-md transition-colors duration-200"
                  >
                    SEARCH
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side - Hero Text */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-block mb-6">
                <div className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">⚡ #1 Self-Drive Platform</span>
                </div>
              </div>

              {/* Main Heading */}
            <h1 className="flex items-center gap-6 md:gap-10 text-white mb-6">
  {/* LEFT SIDE */}
  <div className="text-5xl md:text-6xl lg:text-7xl font-black">
    DRIVE
  </div>

  {/* RIGHT SIDE */}
  <div className="flex flex-col">
    <div className="text-2xl lg:text-5xl font-black bg-gradient-to-r from-white to-yellow-50 bg-clip-text text-transparent">
      ANYTIME
    </div>

    <div className="my-3">
      <div className="border-t-4 border-dashed border-white/60 w-32 lg:w-78"></div>
    </div>

    <div className="text-2xl lg:text-5xl font-black">
      ANYWHERE
    </div>
  </div>
</h1>

              {/* Slogan */}
              <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-4">
                Your Journey, Your Freedom, Your Car
              </p>
              
              {/* Description */}
              <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Experience the freedom of self-drive with unlimited options, zero commitment, and seamless booking. Your road to adventure starts here!
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="bg-white/90 backdrop-blur-sm rounded-md p-4 text-center transform hover:scale-105 transition-transform shadow-lg">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">500+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Premium Cars</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-md p-4 text-center transform hover:scale-105 transition-transform shadow-lg">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">50k+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Happy Drivers</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-md p-4 text-center transform hover:scale-105 transition-transform shadow-lg">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">25+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Cities</div>
                </div>
              </div>

              {/* Car Illustration */}
              <div className="mt-10 relative">
                <div className="flex justify-center lg:justify-start items-end space-x-4">
                  <div className="transform hover:scale-110 transition-transform hover:-translate-y-2 duration-300">
                    <div className="text-5xl md:text-6xl filter drop-shadow-2xl">🚙</div>
                  </div>
                  <div className="transform hover:scale-110 transition-transform hover:-translate-y-2 duration-300">
                    <div className="text-6xl md:text-7xl filter drop-shadow-2xl">🚗</div>
                  </div>
                  <div className="transform hover:scale-110 transition-transform hover:-translate-y-2 duration-300">
                    <div className="text-5xl md:text-6xl filter drop-shadow-2xl">🚕</div>
                  </div>
                </div>
                {/* Road line effect */}
                <div className="mt-2 border-b-2 border-dashed border-white/40 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full text-sm  mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-xl md:text-3xl text-gray-800 mb-4">
              Experience the Best
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              We provide premium car rental services with unmatched quality and customer satisfaction
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-3xl mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Cars Section */}
      <section id="cars" className="py-20 bg-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full text-sm  mb-4">
              FEATURED VEHICLES
            </span>
            <h2 className="text-xl md:text-3xl mb-4">
              Top Cars in Bangalore         
              </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Choose from our premium collection of well-maintained vehicles
            </p>
          </div>
       {loadingVehicles ? (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="rounded-full h-14 w-14 border-4 border-gray-200 border-t-green-600"></div>
    <p className="mt-4 text-gray-500 text-sm">Loading vehicles...</p>
  </div>
) : vehicles.length === 0 ? (
  <div className="text-center py-16">
    <p className="text-gray-500 text-lg">
      No vehicles available in Bangalore at the moment.
    </p>
  </div>
) : (
 <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
  {vehicles.slice(0, 6).map((car, index) => (
    <div
      key={car._id || index}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-lg"
    >
      {/* Image */}
      <div className="relative h-56 bg-[#F7F8FA] overflow-hidden rounded-t-2xl">
        {car.carFullPhoto ? (
          <img
            src={car.carFullPhoto}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🚘</div>
        )}

        {/* Status */}
        <span className="absolute top-4 right-4 bg-black/10 text-gray-500 text-[11px] px-3 py-1 rounded-full tracking-wide">
          {car.status || "AVAILABLE"}
        </span>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-gray-500">
            {car.carName || car.registrationNumber}
          </p>
        </div>

        {/* Specs */}
        {/* Specs */}
<div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
  <div className="flex items-center gap-2">
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18v-6a3 3 0 00-3-3H9a3 3 0 00-3 3v6M3 22h18M6 18v4M18 18v4M12 9V3M12 3L9 6M12 3l3 3" />
    </svg>
    <span className="font-medium text-gray-700">
      {car.seatingCapacity || 5} Seats
    </span>
  </div>

  <div className="w-px h-4 bg-gray-300" />

  <div className="flex items-center gap-2">
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h10v12H3zM13 11h2.5l2 3v7h-1.5M16 21v-7M3 6h10M3 15h10M7.5 3v3" />
    </svg>
    <span className="font-medium text-gray-700">
      {car.fuelType || "Petrol"}
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
              ₹{car.pricePerDay || car.price || "N/A"}
            </p>
          </div>

          <button
            onClick={() => router.push(`/cars?city=Bangalore`)}
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


        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-xl lg:text-3xl  text-gray-800 mb-4">
              What Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Customers Say</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm  mb-6 border border-white/30">
              GET STARTED TODAY
            </span>
            <h2 className="text-xl lg:text-4xl font-semibold mb-6 leading-tight">
              Ready to Hit the Road? 🚀
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
              Join <span className="font-bold text-yellow-300">50,000+</span> happy customers who trust us for their travel needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="group bg-white text-green-600 hover:bg-yellow-300 font-bold py-5 px-10 rounded-md transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2">
                <span className="text-2xl">📱</span>
                <span>Download App</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="group bg-transparent border-2 border-white hover:bg-white hover:text-green-600 font-bold py-5 px-10 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <span className="text-2xl">📞</span>
                <span>Contact Us</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <div className="text-3xl font-black mb-2">500+</div>
                <div className="text-sm text-white/80">Premium Cars</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <div className="text-3xl font-black mb-2">50k+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <div className="text-3xl font-black mb-2">25+</div>
                <div className="text-sm text-white/80">Cities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <div className="text-3xl font-black mb-2">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Page
