import React, { useState } from 'react'
import Header from './Components/Header/Header'
import Footer from "./Components/Footer/Footer"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import SuprisePlannerHome from './Components/SuprisePlannerHome/SuprisePlannerHome'
import SuprisePInnerPage from './Components/SuprisePInnerPage/SuprisePInnerPage'
import BookingConfirmation from './Components/Bookingconfirm/BookingConfirmation'
import DiningBooking from './Components/Dining/DiningBooking'
import DiningInnerPage from './Components/Dining/DiningInnerPage'
import DragonflyHotel from './Components/DragonflyRooms/DrgonflyHotel'
import RomanticSatyHome from './Components/RomanticStay/RomanticSatyHome'
import PhotoGallery from './Components/PhotoGallery/PhotoGallery'
import RomanticInnerPage from "./Components/RomanticStay/RomanticInnerPage"
import Home from './Components/Home/Home'
import ReviewBooking from './Components/ReviewBooking/ReviewBooking'
import Sidebar from './Components/UserProfile/Sidebar/Sidebar'
import BottomBar from './Components/UserProfile/BottomBar/BottomBar'
import PackageInner from './Components/PackageInner/PackageInner'
import OrderHistory from './Components/UserProfile/OrderHistory/OrderHistory'
import PrivacyCookies from './Components/Pages/PrivacyCookies'
import TermsConditions from './Components/Pages/TermsConditions'
import CheckoutPage from './Components/CheckoutPage/CheckoutPage'
import AboutUs from './Components/Pages/AboutUs'
import FAQ from './Components/Pages/FAQ'
import ContactForm from './Components/Pages/ContactForm'
import HoverButtons from './Components/HoverButtons/HoverButtons'
import CartPage from './Components/CartPage/CartPage'
import Failure from './Components/Failure/Failure'
import { AuthProvider } from './Components/Register/AuthContext'
import Login from './Components/Register/Login'
import Register from './Components/Register/Register'
import VerifyEmail from './Components/Register/VerifyEmail'
import ForgotPassword from './Components/Register/ForgotPassword'
import ResetPassword from './Components/Register/ResetPassword'

const App = () => {
  // src/index.js or App.js
  const [isGuest, setIsGuest] = useState(false); // Declare the state here
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}
function Success() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-green-500">Payment Successful!</h1>
    </div>
  );
}


  return (
    <>
      <div className="app">
        <BrowserRouter>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/myaccount" element={
              <>
                  <Sidebar />
                <div className="bottomBar">
                  <BottomBar />
                </div>
              </>
            } />
            <Route path="/supriseplanner" element={<SuprisePlannerHome />} />
            <Route path="/product-details" element={<SuprisePInnerPage />} />
            <Route path="/booking" element={<ReviewBooking isGuest={isGuest} setIsGuest={setIsGuest} />} />
            <Route path="/confirmation" element={<BookingConfirmation />} />
            <Route path="/Dining" element={<DiningBooking />} />
            <Route path="/dining-inner" element={<DiningInnerPage />} />
            <Route path="/suprise-planner-inner" element={<RomanticInnerPage />} />
            <Route path="/drognflyhotel" element={<DragonflyHotel />} />
            <Route path="/RomanticStays" element={<RomanticSatyHome />} />
            <Route path="/gallery" element={<PhotoGallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/package-inner/:id" element={<PackageInner />} /> 
            <Route path="/package-inner/:id" element={<PackageInner />} /> 
            <Route path="/my-orders" element={<OrderHistory />} /> 
            <Route path="/privacy-cookies" element={<PrivacyCookies />} /> 
            <Route path="/terms-and-conditions" element={<TermsConditions />} /> 
            <Route path="/checkout" element={<CheckoutPage isGuest={isGuest} setIsGuest={setIsGuest} />} /> 
            <Route path="/payment-success" element={<Success />} />
            <Route path="/payment-failure" element={<Failure />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/Contact-us" element={<ContactForm />} />
            <Route path="/verify-email" element={<VerifyEmail/>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
          <Footer />
          <HoverButtons/>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
