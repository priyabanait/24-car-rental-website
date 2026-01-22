"use client"
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthForm = () => {
  const router = useRouter();
  const [action, setAction] = useState(true);
  const nameRef = useRef();
  const mobileRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  function signUpHandle() {
    setAction((data) => !data);
  }

  async function submitHandler(event) {
    event.preventDefault();

    const enteredMobile = mobileRef.current.value;
    const enteredPassword = passwordRef.current.value;

    if (enteredPassword.length < 6) {
      alert('Password should be at least 6 characters long!');
      return;
    }

    if (!action && enteredPassword !== confirmPasswordRef.current.value) {
      alert('Passwords do not match!');
      return;
    }

    localStorage.setItem('mobile', enteredMobile);

    let url;
    let requestBody;
    
    if (action) {
      // Login - requires username (use mobile as username)
      url = 'https://24-car-rental-backend.vercel.app/api/driver-auth/login';
      requestBody = {
        mobile: enteredMobile,
        password: enteredPassword,
      };
    } else {
      // Signup - requires username, mobile, password
      const enteredName = nameRef.current.value;
      url = 'https://24-car-rental-backend.vercel.app/api/driver-auth/signup';
      requestBody = {
        username: enteredMobile,
        mobile: enteredMobile,
        password: enteredPassword,
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please ensure the backend is running on port 4000.');
      }

      const data = await res.json();

      if (res.ok) {
        // Store the token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('isLoggedIn', 'true');
          if (data.driver) {
            localStorage.setItem('driverId', data.driver.id);
            localStorage.setItem('driverUsername', data.driver.username);
            localStorage.setItem('userMobile', data.driver.mobile);
            
            // Check if registration is completed
            if (!data.driver.registrationCompleted && !action) {
              // New signup - redirect to registration form
              router.push('/driver-registration');
              setTimeout(() => {
                alert('Please complete your registration');
              }, 100);
              return;
            }
          }
        }
        
        // Check if there's a pending booking
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          const bookingParams = JSON.parse(pendingBooking);
          localStorage.removeItem('pendingBooking');
          
          // Redirect to cart with booking details
          const params = new URLSearchParams(bookingParams);
          router.push(`/cart?${params.toString()}`);
          setTimeout(() => {
            alert(data.message || 'Login successful! Proceeding with your booking...');
          }, 100);
          return;
        }
        
        // Navigate to home for completed registrations or login
        router.push('/');
        setTimeout(() => {
          alert(data.message || 'Success!');
        }, 100);
      } else {
        alert(data.message || 'Authentication failed!');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message || 'Network error. Please ensure the backend server is running on port 4000.');
    }
  }

  return (
    <div className="w-full min-h-screen flex py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 m-auto w-full max-w-[900px] shadow-lg shadow-gray-600 rounded-lg overflow-hidden">
        <div className="w-full h-full hidden md:block">
          <img
  className="w-full h-full object-cover"
  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D"
  alt="Car illustration"
/>

        </div>
        <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-around bg-white">
          <form className="max-w-[400px] w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-black font-bold text-center py-2 sm:py-4">Welcome to <br></br> 24-Car Rental</h2>
            <h2 className="text-xl sm:text-2xl md:text-3xl text-black font-bold text-center py-2 sm:py-4">{!action ? "Sign Up" : "Login"}</h2>

            {!action && (
              <div className="flex flex-col mb-3 sm:mb-4">
                <input placeholder="Full Name" ref={nameRef} className="border relative bg-gray-100 text-slate-600 p-2 text-sm sm:text-base rounded" type="text" required />
              </div>
            )}
            <div className="flex flex-col mb-3 sm:mb-4">
              <input placeholder="Mobile Number" ref={mobileRef} className="border relative bg-gray-100 p-2 text-sm sm:text-base text-slate-600 rounded" type="tel" />
            </div>
            <div className="flex flex-col mb-3 sm:mb-4">
              <input placeholder="Password" ref={passwordRef} className="border relative bg-gray-100 text-slate-600 p-2 text-sm sm:text-base rounded" type="password" />
            </div>
            {!action && (
              <div className="flex flex-col mb-3 sm:mb-4">
                <input placeholder="Confirm password" ref={confirmPasswordRef} className="border relative bg-gray-100 text-slate-600 p-2 text-sm sm:text-base rounded" type="password" />
              </div>
            )}
            <button onClick={submitHandler} className="w-full text-base sm:text-lg py-2 sm:py-3 mt-4 sm:mt-8 bg-indigo-600 hover:bg-indigo-500 relative text-white rounded transition">
              {!action ? 'Sign Up' : 'Login'}
            </button>

            <button type="button" className="w-full text-base sm:text-lg py-2 sm:py-3 mt-4 sm:mt-8 relative text-purple-500 hover:text-purple-600 transition" onClick={signUpHandle}>
              {!action ? 'Have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
