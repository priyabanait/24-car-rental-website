"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId;

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [bookingData, setBookingData] = useState({
    city: '',
    pickupLocation: '',
    dropoffLocation: '',
    tripStartDate: '',
    tripEndDate: '',
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
    finalAmount: 0
  });

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert('Please login to book a vehicle');
      router.push('/Authform');
      return;
    }

    // Fetch vehicle details
    fetchVehicleDetails();
  }, [vehicleId]);

  useEffect(() => {
    // Calculate pricing when dates change
    if (bookingData.tripStartDate && vehicle) {
      calculatePricing();
    }
  }, [bookingData.tripStartDate, bookingData.tripEndDate, vehicle]);

  const fetchVehicleDetails = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const res = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`);
      
      if (!res.ok) {
        throw new Error('Vehicle not found');
      }

      const data = await res.json();
      setVehicle(data);
      
      // Set price per day
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
    const finalAmount = totalAmount + pricing.securityDeposit - pricing.discount;

    setPricing(prev => ({
      ...prev,
      numberOfDays,
      totalAmount,
      finalAmount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bookingData.city || !bookingData.pickupLocation || !bookingData.tripStartDate) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          ...bookingData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Booking created successfully! Redirecting to payment...');
        // Redirect to payment or booking confirmation page
        router.push(`/my-bookings/${data.booking._id}`);
      } else {
        alert(data.message || 'Failed to create booking');
      }

    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-600">Loading vehicle details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-gray-600">Vehicle not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="text-green-600 hover:text-green-700 font-semibold mb-4 flex items-center gap-2"
            >
              ← Back to Cars
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Complete Your Booking</h1>
            <p className="text-gray-600 mt-2">Fill in the details below to book your vehicle</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter city name"
                      value={bookingData.city}
                      onChange={(e) => setBookingData({...bookingData, city: e.target.value})}
                    />
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter pickup address"
                      value={bookingData.pickupLocation}
                      onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                    />
                  </div>

                  {/* Dropoff Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dropoff Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Leave empty if same as pickup"
                      value={bookingData.dropoffLocation}
                      onChange={(e) => setBookingData({...bookingData, dropoffLocation: e.target.value})}
                    />
                  </div>

                  {/* Trip Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trip Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={bookingData.tripStartDate}
                        onChange={(e) => setBookingData({...bookingData, tripStartDate: e.target.value})}
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trip End Date
                      </label>
                      <input
                        type="date"
                        min={bookingData.tripStartDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={bookingData.tripEndDate}
                        onChange={(e) => setBookingData({...bookingData, tripEndDate: e.target.value})}
                      />
                    </div> */}
                  </div>

                  {/* Booking Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Booking Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={bookingData.bookingType}
                      onChange={(e) => setBookingData({...bookingData, bookingType: e.target.value})}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>

                  {/* Delivery Options */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="delivery"
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        checked={bookingData.deliveryRequired}
                        onChange={(e) => setBookingData({...bookingData, deliveryRequired: e.target.checked})}
                      />
                      <label htmlFor="delivery" className="ml-2 text-sm font-semibold text-gray-700">
                        Delivery & Pick-up required
                      </label>
                    </div>
                    
                    {bookingData.deliveryRequired && (
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter delivery address"
                        value={bookingData.deliveryAddress}
                        onChange={(e) => setBookingData({...bookingData, deliveryAddress: e.target.value})}
                      />
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Any special requirements or requests..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side - Vehicle Summary & Price */}
            <div className="lg:col-span-1">
              {/* Vehicle Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
                
                {/* Vehicle Image */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 mb-4 flex items-center justify-center">
                  {vehicle.carFullPhoto ? (
                    <img 
                      src={vehicle.carFullPhoto} 
                      alt={vehicle.name}
                      className="w-full h-40 object-contain"
                    />
                  ) : (
                    <div className="text-6xl">🚗</div>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-gray-800">{vehicle.name || `${vehicle.make} ${vehicle.model}`}</h4>
                  <p className="text-gray-600">{vehicle.model}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl">👥</div>
                      <div className="text-xs text-gray-500">Seats</div>
                      <div className="font-bold text-gray-800">{vehicle.seatingCapacity || 5}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl">⛽</div>
                      <div className="text-xs text-gray-500">Fuel</div>
                      <div className="font-bold text-gray-800">{vehicle.fuelType || 'Petrol'}</div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-800 mb-3">Price Breakdown</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">₹{pricing.pricePerDay} × {pricing.numberOfDays} day{pricing.numberOfDays > 1 ? 's' : ''}</span>
                      <span className="font-semibold">₹{pricing.totalAmount}</span>
                    </div>
                    
                    {pricing.securityDeposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Deposit</span>
                        <span className="font-semibold">₹{pricing.securityDeposit}</span>
                      </div>
                    )}
                    
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{pricing.discount}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{pricing.finalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold text-gray-800 mb-3">Included</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">Insurance Coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">24/7 Roadside Assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">Unlimited Kilometers</span>
                    </div>
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
