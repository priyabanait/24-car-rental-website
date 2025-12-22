"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DriverRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    emergencyContact: '',
    emergencyRelation: '',
    emergencyPhone: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    licenseClass: 'LMV',
    aadharNumber: '',
    panNumber: '',
    electricBillNo: '',
    experience: '',
    previousEmployment: '',
    planType: '',
    vehiclePreference: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountBranchName: '',
    profilePhoto: null,
    licenseDocument: null,
    aadharDocument: null,
    aadharDocumentBack: null,
    panDocument: null,
    bankDocument: null,
    electricBillDocument: null
  });
  const [errors, setErrors] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const driverId = localStorage.getItem('driverId');
    
    if (!token || !driverId) {
      router.push('/Authform');
      return;
    }
  }, [router]);

  const steps = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Documents', icon: '📄' },
    { id: 3, title: 'Professional', icon: '🚗' },
    { id: 4, title: 'Banking', icon: '💳' },
    { id: 5, title: 'Review', icon: '✓' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch(field) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        break;
      case 'phone':
      case 'emergencyPhone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) error = 'Invalid phone number';
        break;
      case 'dateOfBirth':
        if (value) {
          const age = Math.floor((Date.now() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 18) error = 'Must be at least 18 years old';
          if (age > 65) error = 'Age cannot exceed 65';
        }
        break;
      case 'aadharNumber':
        if (value && !/^\d{12}$/.test(value.replace(/\D/g, ''))) error = 'Aadhar must be 12 digits';
        break;
      case 'panNumber':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase())) error = 'Invalid PAN format';
        break;
      case 'ifscCode':
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) error = 'Invalid IFSC code';
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData(prev => ({ ...prev, [field]: base64 }));
        setDocumentPreviews(prev => ({ ...prev, [field]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude: latitude.toString(), longitude: longitude.toString() }));
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data && data.address) {
              setFormData(prev => ({
                ...prev,
                address: data.display_name || '',
                city: data.address.city || data.address.town || '',
                state: data.address.state || '',
                pincode: data.address.postcode || ''
              }));
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
        },
        (error) => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    }
  };

  const handleNext = () => {
    // Validate current step
    let isValid = true;
    const newErrors = {};
    
    if (currentStep === 1) {
      // Personal Info - required fields
      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      }
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
        isValid = false;
      }
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = 'Address is required';
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Documents - required fields
      if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
        isValid = false;
      }
      if (!formData.licenseExpiryDate) {
        newErrors.licenseExpiryDate = 'License expiry date is required';
        isValid = false;
      }
      if (!formData.aadharNumber || !formData.aadharNumber.trim()) {
        newErrors.aadharNumber = 'Aadhar number is required';
        isValid = false;
      }
      if (!formData.panNumber || !formData.panNumber.trim()) {
        newErrors.panNumber = 'PAN number is required';
        isValid = false;
      }
    } else if (currentStep === 3) {
      // Professional - required fields
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
        isValid = false;
      }
    
    } else if (currentStep === 4) {
      // Banking - required fields
      if (!formData.bankName || !formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
        isValid = false;
      }
      if (!formData.accountNumber || !formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
        isValid = false;
      }
      if (!formData.ifscCode || !formData.ifscCode.trim()) {
        newErrors.ifscCode = 'IFSC code is required';
        isValid = false;
      }
      if (!formData.accountHolderName || !formData.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required';
        isValid = false;
      }
      if (!formData.accountBranchName || !formData.accountBranchName.trim()) {
        newErrors.accountBranchName = 'Branch name is required';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      alert('Please fill all required fields correctly');
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const driverId = localStorage.getItem('driverId');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://24-car-rental-backend.vercel.app/api/driver-auth/complete-registration/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          registrationCompleted: true
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if there's a pending booking
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          const bookingParams = JSON.parse(pendingBooking);
          localStorage.removeItem('pendingBooking');
          
          // Redirect to cart with booking details
          const params = new URLSearchParams(bookingParams);
          alert('Registration completed successfully! Proceeding with your booking...');
          router.push(`/cart?${params.toString()}`);
          return;
        }
        
        alert('Registration completed successfully!');
        router.push('/');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="9876543210"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <div className="flex gap-2">
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    title="Get current location"
                  >
                    📍
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select State</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Emergency contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Emergency phone number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Documents & License</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="DL1234567890123"
                />
                {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry Date *</label>
                <input
                  type="date"
                  value={formData.licenseExpiryDate}
                  onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.licenseExpiryDate && <p className="mt-1 text-sm text-red-600">{errors.licenseExpiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number *</label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.aadharNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="1234 5678 9012"
                />
                {errors.aadharNumber && <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.panNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="ABCDE1234F"
                />
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Electric Bill Number</label>
                <input
                  type="text"
                  value={formData.electricBillNo}
                  onChange={(e) => handleInputChange('electricBillNo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Bill number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Upload Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'profilePhoto', label: 'Profile Photo' },
                  { key: 'licenseDocument', label: 'License' },
                  { key: 'aadharDocument', label: 'Aadhar Front' },
                  { key: 'aadharDocumentBack', label: 'Aadhar Back' },
                  { key: 'panDocument', label: 'PAN Card' },
                  { key: 'electricBillDocument', label: 'Electric Bill' }
                ].map(({ key, label }) => (
                  <div key={key} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition">
                    {documentPreviews[key] ? (
                      <img src={documentPreviews[key]} alt={label} className="w-full h-20 object-cover rounded mb-2" />
                    ) : (
                      <div className="text-4xl mb-2">📄</div>
                    )}
                    <label className="cursor-pointer text-sm text-green-600 font-medium hover:text-green-700">
                      {label}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(key, e.target.files[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving Experience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Preference</label>
                <select
                  value={formData.vehiclePreference}
                  onChange={(e) => handleInputChange('vehiclePreference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Vehicle</option>
                  <option value="Dzire">Dzire</option>
                  <option value="WagonR">WagonR</option>
                  <option value="Aura">Aura</option>
                  <option value="Ertiga">Ertiga</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Employment</label>
                <textarea
                  value={formData.previousEmployment}
                  onChange={(e) => handleInputChange('previousEmployment', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Previous job details, experience with ride-sharing platforms, etc."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Banking Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
                <input
                  type="text"
                  value={formData.accountBranchName}
                  onChange={(e) => handleInputChange('accountBranchName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Branch name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="SBIN0001234"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="As per bank records"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {documentPreviews.bankDocument ? (
                    <img src={documentPreviews.bankDocument} alt="Bank Document" className="mx-auto h-20 object-cover rounded mb-2" />
                  ) : (
                    <div className="text-4xl mb-2">📄</div>
                  )}
                  <label className="cursor-pointer text-sm text-green-600 font-medium hover:text-green-700">
                    Upload Bank Statement/Passbook
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('bankDocument', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Review Your Information</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Phone:</strong> {formData.phone}</div>
                <div><strong>License:</strong> {formData.licenseNumber}</div>
       
                <div><strong>Experience:</strong> {formData.experience}</div>
                
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">✓ Almost Done!</h4>
              <p className="text-sm text-green-700">
                Your registration will be reviewed by our team within 24-48 hours. You'll receive an email once approved.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-xl ${
                  step.id === currentStep
                    ? 'border-green-600 bg-green-600 text-white'
                    : step.id < currentStep
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.id === currentStep ? 'text-green-600' : step.id < currentStep ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-12 h-0.5 ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
