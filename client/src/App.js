// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeDashboard from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import UserDashboard from "./Components/UserDashboard";
import AdminDashboard from "./Components/AdminDashboard";
import BookingForm from "./Components/BookingForm";
import UserBookings from "./Components/UserBooking";
import Rooms from "./Components/Rooms";
import UserProfile from "./Components/UserProfile";
import RoomManagement from "./Components/RoomManagement";
import BookingManagement from "./Components/BookingManagement";
import UserHistory from "./Components/UserHistory";
import BookingHistory from "./Components/UserHistory";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/book-room/:roomId" element={<BookingForm />} />
        <Route path="/userbooking" element={<UserBookings />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/roommanagement" element={<RoomManagement />} />
        <Route path="/bookingmanagement" element={<BookingManagement />} />
        <Route path="/bookinghistory" element={<BookingHistory />} />
        <Route path="/edit-profile" element={<UserProfile />} />


        
        {/* You might want to keep one primary route for user dashboard */}
        <Route path="/userdashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;