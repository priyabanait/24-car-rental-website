"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

function CarDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState('location');
  const [bookingData, setBookingData] = useState({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('tripStart') || '',
    checkOut: searchParams.get('tripEnd') || ''
  });

  // Section refs for smooth scrolling
  const locationRef = React.useRef(null);
  const reviewsRef = React.useRef(null);
  const featuresRef = React.useRef(null);
  const cancellationRef = React.useRef(null);
  const inclusionsRef = React.useRef(null);
  const faqsRef = React.useRef(null);

  const scrollToSection = (sectionRef, tabName) => {
    setActiveTab(tabName);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const res = await fetch(`${API_BASE}/api/vehicles/${params.vehicleId}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h2>
          <button 
            onClick={() => router.push('/cars')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  // Collect all vehicle images
  const vehicleImages = [
    vehicle.carFullPhoto,
    vehicle.carFrontPhoto,
    vehicle.carLeftPhoto,
    vehicle.carRightPhoto,
    vehicle.carBackPhoto
  ].filter(Boolean);

  const calculateDays = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 1;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return days;
  };

  const days = calculateDays();
  const pricePerDay = vehicle.pricePerDay || 1500;
  const totalPrice = pricePerDay * days;

  const handleProceedToBooking = () => {
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
      // Store booking data for after login
      const bookingParams = {
        vehicleId: vehicle.vehicleId || vehicle._id,
        city: searchParams.get('city') || vehicle.city || '',
        location: bookingData.location,
        tripStart: bookingData.checkIn,
        tripEnd: bookingData.checkOut
      };
      localStorage.setItem('pendingBooking', JSON.stringify(bookingParams));
      
      // Redirect to login page
      router.push('/Authform');
      return;
    }
    
    // User is logged in, proceed to cart
    const params = new URLSearchParams({
      vehicleId: vehicle.vehicleId || vehicle._id,
      city: searchParams.get('city') || vehicle.city || '',
      location: bookingData.location,
      tripStart: bookingData.checkIn,
      tripEnd: bookingData.checkOut
    });
    router.push(`/cart?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Location and Date Bar */}
      <div className="bg-white border-b">
        <div className="mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Location</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                {bookingData.location || vehicle.location || vehicle.city || 'Select location'}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Checkin</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: '2-digit',
                      hour: 'numeric',
                      hour12: true 
                    }).replace(',', ', ') : 'Select date'}
                  </div>
                </div>
                {/* <button className="text-green-600 text-sm font-medium">Edit</button> */}
              </div>
            </div>
            <div>
              {/* <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Checkout</div>
                  <div className="text-sm font-medium text-gray-900">
                    {bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: '2-digit',
                      hour: 'numeric',
                      hour12: true 
                    }).replace(',', ', ') : 'Select date'}
                  </div>
                </div>
                <button className="text-green-600 text-sm font-medium">Edit</button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Back Button */}
      <button
  onClick={() => router.back()}
  className="
    inline-flex items-center gap-2
    px-4 py-2
    rounded-xl
    bg-white
    border border-gray-200
    text-gray-700 font-medium
    shadow-sm
    transition-all duration-300
    hover:bg-gray-50 hover:text-gray-900
    hover:shadow-md
    active:scale-95 mb-2
  "
>
  <span className="text-lg leading-none transition-transform duration-300 group-hover:-translate-x-0.5">
    ←
  </span>
  <span>Back</span>
</button>


        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                {/* Favorite and Share Buttons */}
                {/* <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div> */}

                {vehicleImages.length > 0 ? (
                  <>
                    <img 
                      src={vehicleImages[currentImageIndex]} 
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1}/{vehicleImages.length}
                    </div>
                    
                    {/* Navigation Arrows */}
                    {vehicleImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === 0 ? vehicleImages.length - 1 : prev - 1)}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full text-sm sm:text-base"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === vehicleImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full text-sm sm:text-base"
                        >
                          →
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-9xl">🚗</div>
                )}
              </div>

              {/* Thumbnail Images */}
              {vehicleImages.length > 1 && (
                <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 overflow-x-auto bg-white">
                  {vehicleImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 sm:w-32 sm:h-24 rounded-lg overflow-hidden border-3 transition-all ${
                        currentImageIndex === index 
                          ? 'border-green-600 ring-0.2 ring-green-600' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`View ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {vehicle.brand} {vehicle.model} 
                  </h1>
                  <p className="text-gray-600 mt-1">{vehicle.carName || vehicle.registrationNumber}</p>
                </div>
                {/* <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
                  <span className="text-xl">★</span>
                  <span className="font-bold">4.7</span>
                  <span className="text-sm">(26)</span>
                </div> */}
              </div>

              <div className="flex gap-4 text-sm text-gray-600 mb-6">
                {/* <span className="flex items-center gap-1">
                  <span className="font-medium">Manual</span>
                </span> */}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">{vehicle.fuelType || 'Petrol'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">{vehicle.seatingCapacity || 5} Seats</span>
                </span>
              </div>

              {/* Description */}
              {vehicle.remarks && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{vehicle.remarks}</p>
                </div>
              )}

              {/* Hosted By */}
              {/* <div className="flex items-center gap-3 py-4 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                  {vehicle.ownerName?.charAt(0) || 'H'}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hosted by</p>
                  <p className="font-semibold text-gray-900">{vehicle.ownerName || 'M Vittal Kumar'}</p>
                </div>
              </div> */}

              {/* Features */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-xs text-gray-500">Seats</div>
                  <div className="font-semibold">{vehicle.seatingCapacity || 5}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">⛽</div>
                  <div className="text-xs text-gray-500">Fuel</div>
                  <div className="font-semibold">{vehicle.fuelType || 'Petrol'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-xs text-gray-500">Color</div>
                  <div className="font-semibold">{vehicle.color || 'N/A'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="text-xs text-gray-500">Insurance</div>
                  <div className="font-semibold">Included</div>
                </div>
              </div> */}

              {/* Navigation Tabs */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <div className="flex gap-3 sm:gap-6 overflow-x-auto border-b border-gray-200 -mx-4 sm:mx-0 px-4 sm:px-0" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  <button
                    onClick={() => scrollToSection(locationRef, 'location')}
                    className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'location' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Location
                  </button>
                  {/* <button
                    onClick={() => scrollToSection(reviewsRef, 'reviews')}
                    className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'reviews' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews
                  </button> */}
                  {vehicle.features && vehicle.features.length > 0 && (
                    <button
                      onClick={() => scrollToSection(featuresRef, 'features')}
                      className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === 'features' 
                          ? 'text-green-600 border-b-2 border-green-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Features
                    </button>
                  )}
                  <button
                    onClick={() => scrollToSection(cancellationRef, 'cancellation')}
                    className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'cancellation' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cancellation
                  </button>
                  <button
                    onClick={() => scrollToSection(inclusionsRef, 'inclusions')}
                    className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'inclusions' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Inclusions/Exclusions
                  </button>
                  <button
                    onClick={() => scrollToSection(faqsRef, 'faqs')}
                    className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'faqs' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    FAQs
                  </button>
                </div>
              </div>

              {/* Location Section */}
              <div ref={locationRef} className="mt-4 sm:mt-6 scroll-mt-24">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Car Location</h3>
                {vehicle.city && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                     
                      <div>
                        <p className="font-semibold text-gray-900">{vehicle.city}</p>
                        {vehicle.location && <p className="text-sm text-gray-600 mt-1">{vehicle.location}</p>}
                        <p className="text-xs text-green-600 mt-2">0.0 Kms Away</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              {/* <div ref={reviewsRef} className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t scroll-mt-24">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Ratings & Reviews</h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="text-yellow-500 text-2xl sm:text-3xl mb-2">★★★★★</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">5.0</div>
                  <p className="text-sm text-gray-600">Based on customer reviews</p>
                  <p className="text-xs text-gray-500 mt-4">Be the first to review this vehicle</p>
                </div>
              </div> */}

              {/* Features Section */}
             {vehicle.features && vehicle.features.length > 0 && (
  <div ref={featuresRef} className="pt-6 scroll-mt-24">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Features
    </h3>

    <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
      {vehicle.features.map((feature, index) => (
        <li
          key={index}
          className="flex items-start gap-3 text-sm text-gray-700"
        >
          {/* Dot */}
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />

          {/* Text */}
          <span className="leading-snug">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
)}


              {/* Cancellation Section */}
              <div ref={cancellationRef} className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t scroll-mt-24">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Cancellation</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-green-600 mt-0.5 sm:mt-1 text-sm sm:text-base">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Free cancellation up to 24 hours before pickup</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Get a full refund if you cancel at least 24 hours before your trip starts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-orange-600 mt-0.5 sm:mt-1 text-sm sm:text-base">⚠</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">50% refund for cancellations within 24 hours</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Cancellations made within 24 hours of pickup time will receive 50% refund</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inclusions/Exclusions Section */}
              <div ref={inclusionsRef} className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t scroll-mt-24">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Inclusions/Exclusions</h3>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <span>✓</span> Included
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2">
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">•</span>
                        Unlimited kilometers
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">•</span>
                        Basic insurance coverage
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">•</span>
                        24/7 roadside assistance
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5">•</span>
                        Sanitized and cleaned vehicle
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <span>✗</span> Not Included
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2">
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-red-600 mt-0.5">•</span>
                        Fuel charges
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-red-600 mt-0.5">•</span>
                        Toll and parking charges
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-red-600 mt-0.5">•</span>
                        Traffic fines and penalties
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <span className="text-red-600 mt-0.5">•</span>
                        Inter-state permit charges (if applicable)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <div ref={faqsRef} className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t scroll-mt-24">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">FAQs</h3>
                <div className="space-y-3 sm:space-y-4">
                  <details className="bg-gray-50 rounded-lg p-3 sm:p-4 cursor-pointer">
                    <summary className="font-semibold text-gray-900 text-sm sm:text-base">What documents do I need?</summary>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 ml-3 sm:ml-4">You'll need a valid driver's license, Aadhaar card/Passport for verification, and the booking confirmation.</p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-3 sm:p-4 cursor-pointer">
                    <summary className="font-semibold text-gray-900 text-sm sm:text-base">Can I extend my rental period?</summary>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 ml-3 sm:ml-4">Yes, you can extend your rental period based on availability. Contact us at least 24 hours before your original return time.</p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-3 sm:p-4 cursor-pointer">
                    <summary className="font-semibold text-gray-900 text-sm sm:text-base">What is the fuel policy?</summary>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 ml-3 sm:ml-4">The vehicle will be provided with a full tank. Please return it with a full tank to avoid additional charges.</p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-3 sm:p-4 cursor-pointer">
                    <summary className="font-semibold text-gray-900 text-sm sm:text-base">Is the security deposit refundable?</summary>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 ml-3 sm:ml-4">Yes, the security deposit is fully refundable within 7 business days after the rental period ends, provided there are no damages or violations.</p>
                  </details>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  9 Reviews
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Customer reviews coming soon...</p>
              </div>
            </div> */}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
              {/* Travel with Confidence Banner */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">Travel with confidence</div>
                    <p className="text-xs text-gray-600">Your trip is secured against accidental damage</p>
                    <button className="text-xs text-green-600 hover:text-green-700 mt-2 font-medium flex items-center gap-1">
                      Learn More
                      <span>→</span>
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{Math.round(pricePerDay * 0.15)}</div>
                  </div>
                </div>
              </div> */}

              {/* Discount Badge */}
              {/* <div className="bg-white border-2 border-green-600 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm font-bold">
                    Z
                  </div>
                  <span className="text-sm font-semibold text-green-800">Get 50% OFF!</span>
                </div>
                <button className="text-sm text-green-600 hover:text-green-700 font-semibold">Apply</button>
              </div> */}

              {/* Terms Checkbox */}
              <div className="mb-4 sm:mb-6">
                <label className="flex items-start gap-1.5 sm:gap-2 cursor-pointer">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    I hereby agree to the terms and conditions of the Lease Agreement with Host
                  </span>
                </label>
                <button className="text-xs sm:text-sm text-green-600 hover:text-green-700 mt-1.5 sm:mt-2 ml-5 sm:ml-7 font-medium">
                  View Details
                </button>
              </div>

              {/* Total Price */}
              <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <div className="text-xs sm:text-sm text-gray-600">Trip Cost ({days} days)</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">₹{totalPrice.toLocaleString()}</div>
                </div>
                {vehicle.securityDeposit > 0 && (
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <div className="text-xs sm:text-sm text-gray-600">Security Deposit (Refundable)</div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">₹{vehicle.securityDeposit.toLocaleString()}</div>
                  </div>
                )}
                <div className="border-t pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total Amount</div>
                      <div className="text-xs text-gray-500">Incl Unlimited Kms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹{(totalPrice + (vehicle.securityDeposit || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium">View Details</button>
              </div>

              {/* Book Button */}
              <button
                onClick={handleProceedToBooking}
                disabled={!agreeToTerms || !bookingData.checkIn}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                 Proceed to Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CarDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <CarDetailsContent />
    </Suspense>
  );
}
