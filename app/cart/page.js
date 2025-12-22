"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  const [bookingData, setBookingData] = useState({
    city: searchParams.get('city') || '',
    pickupLocation: searchParams.get('location') || '',
    dropoffLocation: '',
    tripStartDate: searchParams.get('tripStart') || '',
    tripEndDate: searchParams.get('tripEnd') || '',
    bookingType: 'daily',
    deliveryRequired: false,
    deliveryAddress: '',
    notes: ''
  });

  const [pricing, setPricing] = useState({
    numberOfDays: 1,
    pricePerDay: 0,
    totalAmount: 0,
    securityDeposit: 0,
    discount: 0,
    deliveryCharges: 0,
    taxes: 0,
    finalAmount: 0
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert('Please login to continue booking');
      router.push('/Authform');
      return;
    }

    if (!vehicleId) {
      alert('No vehicle selected');
      router.push('/cars');
      return;
    }

    fetchVehicleDetails();
  }, [vehicleId]);

  useEffect(() => {
    if (bookingData.tripStartDate && vehicle) {
      calculatePricing();
    }
  }, [bookingData.tripStartDate, bookingData.tripEndDate, bookingData.deliveryRequired, vehicle, appliedCoupon]);

  const fetchVehicleDetails = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      
      // Try to fetch vehicle - first attempt with the ID as-is
      let res = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`);
      
      // If not found and vehicleId looks like MongoDB _id, try searching all vehicles
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/vehicles`);
        if (res.ok) {
          const allVehicles = await res.json();
          const vehicle = allVehicles.find(v => v._id === vehicleId || v.vehicleId == vehicleId);
          if (vehicle) {
            setVehicle(vehicle);
            setPricing(prev => ({
              ...prev,
              pricePerDay: vehicle.pricePerDay || vehicle.dailyRate || 0,
              securityDeposit: vehicle.securityDeposit || 0
            }));
            setLoading(false);
            return;
          }
        }
        throw new Error('Vehicle not found');
      }

      const data = await res.json();
      setVehicle(data);
      
      setPricing(prev => ({
        ...prev,
        pricePerDay: data.pricePerDay || data.dailyRate || 0,
        securityDeposit: data.securityDeposit || 0
      }));

    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
      alert('Failed to load vehicle details');
      router.push('/cars');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    const startDate = new Date(bookingData.tripStartDate);
    const endDate = bookingData.tripEndDate ? new Date(bookingData.tripEndDate) : new Date(bookingData.tripStartDate);
    
    const diffTime = Math.abs(endDate - startDate);
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const totalAmount = pricing.pricePerDay * numberOfDays;
    const deliveryCharges = bookingData.deliveryRequired ? 200 : 0;
    const taxes = Math.round((totalAmount + deliveryCharges) * 0.05); // 5% tax
    let discount = appliedCoupon ? appliedCoupon.discount : 0;
    
    const finalAmount = totalAmount + pricing.securityDeposit + deliveryCharges + taxes - discount;

    setPricing(prev => ({
      ...prev,
      numberOfDays,
      totalAmount,
      deliveryCharges,
      taxes,
      discount,
      finalAmount
    }));
  };

  const applyCoupon = () => {
    const validCoupons = {
      'FIRST50': { discount: 50, description: 'First booking discount' },
      'SAVE100': { discount: 100, description: '₹100 off on bookings' },
      'WEEKEND20': { discount: pricing.totalAmount * 0.2, description: '20% off' }
    };

    if (validCoupons[couponCode]) {
      setAppliedCoupon(validCoupons[couponCode]);
      alert('Coupon applied successfully!');
    } else {
      alert('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleProceedToPayment = async () => {
    if (!bookingData.city || !bookingData.pickupLocation || !bookingData.tripStartDate) {
      alert('Please fill all required fields');
      return;
    }

    // Prepare payment page parameters
    const paymentParams = new URLSearchParams({
      vehicleId: vehicle?._id || vehicleId,
      city: bookingData.city,
      vehicleName: `${vehicle?.brand || ''} ${vehicle?.model || ''} ${vehicle?.year || ''}`.trim() || 'Vehicle',
      vehicleImage: vehicle?.carFullPhoto || vehicle?.carFrontPhoto || '',
      transmission: vehicle?.transmission || 'Manual',
      fuelType: vehicle?.fuelType || 'Petrol',
      seats: vehicle?.seatingCapacity || '5',
      year: vehicle?.year || '2023',
      pickupDate: bookingData.tripStartDate,
      pickupTime: '11:00 AM', // You can make this dynamic from bookingData
      pickupLocation: bookingData.pickupLocation,
      dropoffDate: bookingData.tripEndDate || bookingData.tripStartDate,
      dropoffTime: '11:00 AM', // You can make this dynamic from bookingData
      dropoffLocation: bookingData.dropoffLocation || bookingData.pickupLocation,
      finalAmount: pricing.finalAmount,
      numberOfDays: pricing.numberOfDays,
      cancellationPolicy: 'Cancellation Fee: 50% of trip amount or INR 4000 (whichever is lower) Until 17 Dec 2025, 05:00 AM'
    });

    // Navigate to payment page
    router.push(`/payment?${paymentParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="text-green-600 hover:text-green-700 font-semibold mb-4 flex items-center gap-2 transition-all hover:gap-3"
            >
              ← Back to Cars
            </button>
            <div className="flex items-center gap-4">
             
              <div>
                <h1 className="text-3xl md:text-4xl  text-gray-800">Your Bookings</h1>
                <p className="text-gray-600 mt-1">Review your booking details</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Cart Items & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vehicle Cart Item */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 hover:border-green-200 transition-all">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Selected Vehicle
                  </h2>
                </div>
                
                <div className="p-6">
  <div className="flex flex-col md:flex-row gap-6">
    
    {/* Vehicle Image */}
    <div className="md:w-1/3">
      <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        {vehicle?.carFullPhoto ? (
          <img
            src={vehicle.carFullPhoto}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-5xl text-gray-400">🚗</div>
        )}
      </div>
    </div>

    {/* Vehicle Details */}
    <div className="md:w-2/3">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {vehicle?.name || `${vehicle?.make} ${vehicle?.model}`}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl mb-1">👥</div>
          <div className="text-xs text-gray-500">Seats</div>
          <div className="font-semibold text-gray-800">
            {vehicle?.seatingCapacity || 5}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl mb-1">⛽</div>
          <div className="text-xs text-gray-500">Fuel</div>
          <div className="font-semibold text-gray-800 text-sm">
            {vehicle?.fuelType || 'Petrol'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl mb-1">📅</div>
          <div className="text-xs text-gray-500">Year</div>
          <div className="font-semibold text-gray-800">
            {vehicle?.year || '2024'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
        <div>
          <p className="text-sm text-gray-600">Rate per day</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{pricing.pricePerDay}
          </p>
        </div>

        <button
          onClick={() => router.push('/cars')}
          className="text-red-600 hover:text-red-700 font-semibold text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</div>

              </div>

              {/* Booking Details Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>📝</span> Booking Details
                </h2>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter city"
                        value={bookingData.city}
                        onChange={(e) => setBookingData({...bookingData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter pickup address"
                        value={bookingData.pickupLocation}
                        onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trip Start <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={bookingData.tripStartDate}
                        onChange={(e) => setBookingData({...bookingData, tripStartDate: e.target.value})}
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trip End
                      </label>
                      <input
                        type="date"
                        min={bookingData.tripStartDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={bookingData.tripEndDate}
                        onChange={(e) => setBookingData({...bookingData, tripEndDate: e.target.value})}
                      />
                    </div> */}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="delivery"
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        checked={bookingData.deliveryRequired}
                        onChange={(e) => setBookingData({...bookingData, deliveryRequired: e.target.checked})}
                      />
                      <label htmlFor="delivery" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span>🚚</span> Home Delivery & Pick-up (+₹200)
                      </label>
                    </div>
                    
                    {bookingData.deliveryRequired && (
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter delivery address"
                        value={bookingData.deliveryAddress}
                        onChange={(e) => setBookingData({...bookingData, deliveryAddress: e.target.value})}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>💰</span> Price Summary
                </h2>

                {/* Coupon Section */}
                {/* <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🎟️</span> Have a coupon?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm uppercase"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-bold text-sm">{couponCode}</p>
                        <p className="text-green-600 text-xs">{appliedCoupon.description}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-700 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Try: FIRST50, SAVE100, WEEKEND20</p>
                </div> */}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">₹{pricing.pricePerDay} × {pricing.numberOfDays} day{pricing.numberOfDays > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-gray-800">₹{pricing.totalAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-semibold text-gray-800">₹{pricing.securityDeposit}</span>
                  </div>
                  
                  {pricing.deliveryCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className="font-semibold text-gray-800">₹{pricing.deliveryCharges}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST (5%)</span>
                    <span className="font-semibold text-gray-800">₹{pricing.taxes}</span>
                  </div>
                  
                  {pricing.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="flex items-center gap-1">
                        <span>🎉</span> Discount
                      </span>
                      <span className="font-bold">-₹{Math.round(pricing.discount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-gray-300 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-black text-green-600">₹{pricing.finalAmount}</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={submitting || !bookingData.city || !bookingData.pickupLocation || !bookingData.tripStartDate}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Proceed to Payment</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Security Features */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Secure payment gateway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Free cancellation within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Full refund on cancellation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
