"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { MapPin } from "lucide-react";
export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert('Please login to view your bookings');
      router.push('/Authform');
      return;
    }

    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const mobile = localStorage.getItem('userMobile');
      
      if (!mobile) {
        console.error('Mobile number not found');
        alert('Please login again');
        router.push('/Authform');
        return;
      }

      const url = filter === 'all' 
        ? `${API_BASE}/api/bookings/by-mobile/${mobile}`
        : `${API_BASE}/api/bookings/by-mobile/${mobile}?status=${filter}`;

      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Cancelled by user'
        })
      });

      if (res.ok) {
        alert('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-600">Loading your bookings...</p>
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
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">My Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage your vehicle bookings</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'completed'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet</p>
              <button
                onClick={() => router.push('/cars')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Browse Vehicles
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="md:flex">
                    {/* Vehicle Image */}
                    <div className="md:w-1/3 flex items-center justify-center bg-gray-50">
                      {booking.vehicleId?.carFullPhoto ? (
                        <img
                          src={booking.vehicleId.carFullPhoto}
                          alt={booking.vehicleName}
                          className=" object-cover"
                        />
                      ) : (
                        <div className="text-8xl">🚗</div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{booking.vehicleName}</h3>
                          <p className="text-sm text-gray-500">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                       <div>
  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
    Pickup Location
  </p>

  <div className="flex items-center gap-1.5 font-medium text-gray-800">
    <MapPin className="w-4 h-4 text-red-500" />
    <span className="text-sm">{booking.pickupLocation}</span>
  </div>
</div>
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="font-semibold text-gray-800">🏙️ {booking.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trip Start</p>
                          <p className="font-semibold text-gray-800">📅 {formatDate(booking.tripStartDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-800">⏱️ {booking.numberOfDays} day{booking.numberOfDays > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{booking.finalAmount}</p>
                          <p className="text-xs text-gray-500">
                            Payment: <span className={`font-semibold ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {booking.paymentStatus}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/my-bookings/${booking._id}`)}
                            className="bg-[#171717] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
