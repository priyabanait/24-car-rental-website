"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    saveCard: true
  });

  const [bookingDetails, setBookingDetails] = useState({
    vehicleId: searchParams.get('vehicleId') || '',
    city: searchParams.get('city') || '',
    vehicleName: searchParams.get('vehicleName') || '',
    vehicleImage: searchParams.get('vehicleImage') || '',
    transmission: searchParams.get('transmission') || 'Manual',
    fuelType: searchParams.get('fuelType') || 'Petrol',
    seats: searchParams.get('seats') || '5',
    year: searchParams.get('year') || '2023',
    pickupDate: searchParams.get('pickupDate') || '',
    pickupTime: searchParams.get('pickupTime') || '',
    pickupLocation: searchParams.get('pickupLocation') || '',
    dropoffDate: searchParams.get('dropoffDate') || '',
    dropoffTime: searchParams.get('dropoffTime') || '',
    dropoffLocation: searchParams.get('dropoffLocation') || '',
    finalAmount: parseFloat(searchParams.get('finalAmount')) || 0,
    numberOfDays: parseInt(searchParams.get('numberOfDays')) || 1,
    cancellationPolicy: searchParams.get('cancellationPolicy') || ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Price lock expired. Please restart your booking.');
          router.push('/cars');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setCardDetails({ ...cardDetails, expiry: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardDetails({ ...cardDetails, cvv: value });
    }
  };

  const handlePayment = async () => {
    // Validate payment method
    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Please fill in all card details');
        return;
      }
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to continue');
        router.push('/Authform');
        return;
      }

      // Create booking
      const bookingPayload = {
        vehicleId: bookingDetails.vehicleId,
        city: bookingDetails.city,
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation || bookingDetails.pickupLocation,
        tripStartDate: bookingDetails.pickupDate,
        tripEndDate: bookingDetails.dropoffDate || bookingDetails.pickupDate,
        numberOfDays: bookingDetails.numberOfDays,
        finalAmount: bookingDetails.finalAmount,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cash' ? 'pending' : 'completed',
        status: 'confirmed'
      };

      // Validate required fields before sending
      if (!bookingPayload.vehicleId || !bookingPayload.city || !bookingPayload.pickupLocation || !bookingPayload.tripStartDate) {
        console.error('Missing required fields:', {
          vehicleId: bookingPayload.vehicleId,
          city: bookingPayload.city,
          pickupLocation: bookingPayload.pickupLocation,
          tripStartDate: bookingPayload.tripStartDate
        });
        alert('Missing required booking information. Please go back and try again.');
        return;
      }

      console.log('Sending booking payload:', bookingPayload);

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (res.ok) {
        const data = await res.json();
        alert('Booking confirmed successfully!');
        router.push('/my-bookings');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Price Lock Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <p className="text-yellow-800 font-semibold">PRICE LOCKED FOR 10 MINS</p>
            <p className="text-yellow-700 text-sm">Complete your payment soon</p>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold text-yellow-800">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left & Center - Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Payment method</h2>

              <div className="space-y-3 mb-8">
                {/* UPI */}
                <button
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'upi' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">UPI</div>
                    <div className="text-sm text-gray-500">Google Pay, PhonePe, BHIM UPI</div>
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'card' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Credit / Debit / ATM Card</div>
                    <div className="text-sm text-gray-500">Please ensure your card is enabled for online transactions</div>
                  </div>
                </button>

                {/* Wallet */}
                <button
                  onClick={() => setSelectedPaymentMethod('wallet')}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'wallet' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Mobile Wallet</div>
                    <div className="text-sm text-gray-500">All major wallets are supported</div>
                  </div>
                </button>

                {/* Net Banking */}
                <button
                  onClick={() => setSelectedPaymentMethod('netbanking')}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'netbanking' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Net Banking</div>
                    <div className="text-sm text-gray-500">All major banks are supported</div>
                  </div>
                </button>

                {/* Cash */}
                <button
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'cash' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m3.236 0a2 2 0 012.236-2.236M11 13h6m-3-3v6m-7-3h.01M4 19h16" />
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay with cash at the time of pickup</div>
                  </div>
                </button>
              </div>

              {/* Card Details Form */}
              {selectedPaymentMethod === 'card' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Enter Card Details</h3>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Secure Payment</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Amount: ₹{bookingDetails.finalAmount.toLocaleString()}</div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">EXPIRY (MM/YY)</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cardDetails.saveCard}
                        onChange={(e) => setCardDetails({ ...cardDetails, saveCard: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Securely save card details</span>
                    </label>

                    <div className="flex items-center gap-3 pt-4">
                      <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6" />
                      <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" alt="Mastercard" className="h-6" />
                      <img src="https://cdn-icons-png.flaticon.com/512/5968/5968382.png" alt="RuPay" className="h-6" />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors"
                  >
                    PAY ₹{bookingDetails.finalAmount.toLocaleString()}
                  </button>
                </div>
              )}

              {/* Payment Button for other methods */}
              {selectedPaymentMethod !== 'card' && (
                <div className="border-t pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedPaymentMethod === 'upi' && 'Complete payment via UPI'}
                      {selectedPaymentMethod === 'wallet' && 'Complete payment via Mobile Wallet'}
                      {selectedPaymentMethod === 'netbanking' && 'Complete payment via Net Banking'}
                      {selectedPaymentMethod === 'cash' && 'Confirm Booking - Pay Cash on Pickup'}
                    </h3>
                    <p className="text-sm text-gray-600">Amount: ₹{bookingDetails.finalAmount.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors"
                  >
                    {selectedPaymentMethod === 'cash' ? 'CONFIRM BOOKING' : `PAY ₹${bookingDetails.finalAmount.toLocaleString()}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right - Booking Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h3>

              {/* Vehicle Info */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">{bookingDetails.vehicleName}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>• {bookingDetails.transmission}</span>
                  <span>• {bookingDetails.fuelType}</span>
                  <span>• {bookingDetails.seats} Seats</span>
                </div>
                {bookingDetails.vehicleImage && (
                  <img 
                    src={bookingDetails.vehicleImage} 
                    alt={bookingDetails.vehicleName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Pickup & Dropoff */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-600 mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {formatDate(bookingDetails.pickupDate)}, {bookingDetails.pickupTime}
                    </div>
                    <div className="text-sm text-gray-600">{bookingDetails.pickupLocation}</div>
                  </div>
                </div>
                {/* <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {formatDate(bookingDetails.dropoffDate)}, {bookingDetails.dropoffTime}
                    </div>
                    <div className="text-sm text-gray-600">{bookingDetails.dropoffLocation}</div>
                  </div>
                </div> */}
              </div>

              {/* Cancellation Policy */}
              {/* {bookingDetails.cancellationPolicy && (
                <div className="mb-6 pb-6 border-b">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    {bookingDetails.cancellationPolicy}
                  </div>
                </div>
              )} */}

              {/* Final Amount */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Final Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{bookingDetails.finalAmount.toLocaleString()}
                  </span>
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

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Loading payment page...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
