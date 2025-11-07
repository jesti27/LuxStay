import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";
import BookingManagement from "./BookingManagement";

function AdminDashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    pricePerNight: "",
    status: "Available",
    specialFeatures: "",
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdminData({
        name: localStorage.getItem("userName") || payload.name,
        email: payload.email,
        role: localStorage.getItem("userRole") || payload.role
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }

    fetchRooms();
    fetchBookings();
    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/`);
      const data = await res.json();
      setRooms(data.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching rooms");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/`);
      const data = await res.json();
      console.log("Bookings data:", data);
      setBookings(data.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      alert("Error fetching bookings");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching users");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      for (let key in formData) form.append(key, formData[key]);
      images.forEach((img) => form.append("images", img));

      const res = await fetch(`${API_BASE_URL}/rooms/`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      alert(data.message);
      setFormData({
        roomNumber: "",
        roomType: "",
        pricePerNight: "",
        status: "Available",
        specialFeatures: "",
      });
      setImages([]);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Error creating room");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure to delete this room?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Error deleting room");
    }
  };

  const handleUpdateRoom = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      alert(data.message);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Error updating room");
    }
  };

  const handleBanUser = async (userId, action) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: action === 'ban' ? JSON.stringify({ reason: "Violation of terms" }) : undefined
      });
      const data = await res.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error updating user");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      "PENDING": "#FF9F43",
      "CONFIRMED": "#2ECC71",
      "CANCELLED": "#E74C3C",
      "CHECKED_IN": "#3498DB",
      "CHECKED_OUT": "#9B59B6",
      "Available": "#2ECC71",
      "Occupied": "#FF9F43",
      "Maintenance": "#E74C3C",
      "Reserved": "#3498DB"
    };
    return statusColors[status] || "#95A5A6";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>
          <div>Loading admin dashboard...</div>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Admin Menu</h3>
          <button style={styles.closeButton} onClick={closeSidebar}>×</button>
        </div>
        
        <div style={styles.sidebarContent}>
          <div style={styles.userInfoSidebar}>
            <div style={styles.userAvatar}>
              {adminData?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{adminData?.name}</div>
              <div style={styles.userEmail}>{adminData?.email}</div>
              <div style={styles.userRole}>{adminData?.role}</div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <button 
              style={{
                ...styles.sidebarButton,
                ...(activeTab === "overview" && styles.activeSidebarButton)
              }}
              onClick={() => { setActiveTab("overview"); closeSidebar(); }}
            >
              <div style={styles.sidebarButtonContent}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={styles.sidebarIcon}>
                  <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.6 0 1-.4 1-1s-.4-1-1-1h-1V4c0-1.1-.9-2-2-2H6C4.9 2 4 2.9 4 4v7H3c-.6 0-1 .4-1 1s.4 1 1 1zM6 4h12v7H6V4z"/>
                </svg>
                Dashboard Overview
              </div>
            </button>
            <button 
              style={{
                ...styles.sidebarButton,
                ...(activeTab === "rooms" && styles.activeSidebarButton)
              }}
              onClick={() => { setActiveTab("rooms"); closeSidebar(); }}
            >
              <div style={styles.sidebarButtonContent}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={styles.sidebarIcon}>
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11H6v-2h12v2z"/>
                </svg>
                Room Management
              </div>
            </button>
            <button 
              style={{
                ...styles.sidebarButton,
                ...(activeTab === "bookings" && styles.activeSidebarButton)
              }}
              onClick={() => { setActiveTab("bookings"); closeSidebar(); }}
            >
              <div style={styles.sidebarButtonContent}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={styles.sidebarIcon}>
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Booking Management ({bookings.filter(b => b.status === "PENDING").length})
              </div>
            </button>
            <button 
              style={{
                ...styles.sidebarButton,
                ...(activeTab === "users" && styles.activeSidebarButton)
              }}
              onClick={() => { setActiveTab("users"); closeSidebar(); }}
            >
              <div style={styles.sidebarButtonContent}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={styles.sidebarIcon}>
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.06 7h-.12c-.86 0-1.63.55-1.9 1.37l-.86 2.58c1.08.6 1.82 1.73 1.82 3.05v8h3zm-7.5-10.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM9 12c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3zm-2 8v-6H5l2.54-7.63C7.82 7.55 8.58 7 9.44 7h.12c.86 0 1.63.55 1.9 1.37l.86 2.58C11.92 11.4 11.18 12.53 11 14v6h-4z"/>
                </svg>
                User Management
              </div>
            </button>
          </nav>

          <div style={styles.sidebarFooter}>
            <button 
              style={styles.sidebarLogoutButton}
              onClick={handleLogout}
            >
              <div style={styles.sidebarButtonContent}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={styles.sidebarIcon}>
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Logout
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div style={styles.dashboard}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <div style={styles.headerActions}>
              
              {/* Burger Menu */}
              <div 
                style={styles.burgerMenu}
                onClick={toggleSidebar}
              >
                <div style={{
                  ...styles.burgerLine,
                  transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                }}></div>
                <div style={{
                  ...styles.burgerLine,
                  opacity: sidebarOpen ? 0 : 1
                }}></div>
                <div style={{
                  ...styles.burgerLine,
                  transform: sidebarOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
                }}></div>
              </div>

              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Section with Profile */}
              <div style={styles.welcomeSection}>
                <div style={styles.welcomeHeader}>
                  <div style={styles.profileSection}>
                    <div style={styles.profileAvatar}>
                      {adminData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.profileInfo}>
                      <h2 style={styles.welcomeTitle}>Admin Overview</h2>
                      <p style={styles.welcomeSubtitle}>
                        {adminData?.email} • {adminData?.role} Account
                      </p>
                    </div>
                  </div>
                  <div style={styles.welcomeStats}>
                    <div style={styles.statMini}>
                      <div style={styles.statMiniNumber}>{rooms.length}</div>
                      <div style={styles.statMiniLabel}>Rooms</div>
                    </div>
                    <div style={styles.statMini}>
                      <div style={styles.statMiniNumber}>{bookings.filter(b => b.status === "PENDING").length}</div>
                      <div style={styles.statMiniLabel}>Pending</div>
                    </div>
                  </div>
                </div>
                <p style={styles.welcomeText}>
                  Manage your hotel operations, monitor bookings, and oversee user activities from this dashboard.
                </p>
              </div>

              {/* Statistics Cards */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIconContainer}>
                    <div style={{...styles.statIcon, backgroundColor: '#e3f2fd'}}>
                      <svg viewBox="0 0 24 24" fill="#1976d2" style={styles.icon}>
                        <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V7H1v10h22v-6c0-2.21-1.79-4-4-4zm2 8h-8V9h6c1.1 0 2 .9 2 2v4z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{rooms.length}</div>
                    <div style={styles.statLabel}>Total Rooms</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconContainer}>
                    <div style={{...styles.statIcon, backgroundColor: '#e8f5e8'}}>
                      <svg viewBox="0 0 24 24" fill="#2e7d32" style={styles.icon}>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{bookings.length}</div>
                    <div style={styles.statLabel}>Total Bookings</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconContainer}>
                    <div style={{...styles.statIcon, backgroundColor: '#f3e5f5'}}>
                      <svg viewBox="0 0 24 24" fill="#7b1fa2" style={styles.icon}>
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.06 7h-.12c-.86 0-1.63.55-1.9 1.37l-.86 2.58c1.08.6 1.82 1.73 1.82 3.05v8h3zm-7.5-10.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM9 12c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3zm-2 8v-6H5l2.54-7.63C7.82 7.55 8.58 7 9.44 7h.12c.86 0 1.63.55 1.9 1.37l.86 2.58C11.92 11.4 11.18 12.53 11 14v6h-4z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{users.length}</div>
                    <div style={styles.statLabel}>Total Users</div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recent Bookings</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Room</th>
                        <th style={styles.tableHeader}>Guest</th>
                        <th style={styles.tableHeader}>Check-in</th>
                        <th style={styles.tableHeader}>Check-out</th>
                        <th style={styles.tableHeader}>Amount</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{booking.room_number}</td>
                          <td style={styles.tableCell}>{booking.guest_name}</td>
                          <td style={styles.tableCell}>
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </td>
                          <td style={styles.tableCell}>
                            {new Date(booking.check_out_date).toLocaleDateString()}
                          </td>
                          <td style={styles.tableCell}>${booking.total_amount}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(booking.status)
                            }}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Room Management</h2>
                <p style={styles.sectionSubtitle}>Create, update, and manage hotel rooms</p>
              </div>

              {/* Create Room Form */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Add New Room</h3>
                <form onSubmit={handleCreateRoom} style={styles.form}>
                  <div style={styles.formGrid}>
                    <input
                      name="roomNumber"
                      placeholder="Room Number"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                    <input
                      name="roomType"
                      placeholder="Room Type (e.g., Deluxe, Suite)"
                      value={formData.roomType}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                    <input
                      name="pricePerNight"
                      placeholder="Price Per Night"
                      type="number"
                      value={formData.pricePerNight}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                    <input
                      name="specialFeatures"
                      placeholder="Special Features (comma separated)"
                      value={formData.specialFeatures}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.fileUpload}>
                    <label style={styles.fileLabel}>
                      Upload Room Images
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                        style={styles.fileInput}
                      />
                    </label>
                    {images.length > 0 && (
                      <span style={styles.fileCount}>{images.length} file(s) selected</span>
                    )}
                  </div>
                  <button type="submit" style={styles.primaryButton}>
                    Create Room
                  </button>
                </form>
              </div>

              {/* Room List */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>All Rooms ({rooms.length})</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Room Number</th>
                        <th style={styles.tableHeader}>Type</th>
                        <th style={styles.tableHeader}>Price</th>
                        <th style={styles.tableHeader}>Status</th>
                        <th style={styles.tableHeader}>Images</th>
                        <th style={styles.tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{room.roomNumber}</td>
                          <td style={styles.tableCell}>{room.roomType}</td>
                          <td style={styles.tableCell}>${room.pricePerNight}</td>
                          <td style={styles.tableCell}>
                            <select
                              value={room.status}
                              onChange={(e) => handleUpdateRoom(room.id, e.target.value)}
                              style={{
                                ...styles.statusSelect,
                                borderColor: getStatusColor(room.status)
                              }}
                            >
                              <option value="Available">Available</option>
                              <option value="Occupied">Occupied</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Reserved">Reserved</option>
                            </select>
                          </td>
                          <td style={styles.tableCell}>
                            {room.images?.slice(0, 2).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="room"
                                style={styles.roomImage}
                              />
                            ))}
                            {room.images?.length > 2 && (
                              <span style={styles.moreImages}>+{room.images.length - 2}</span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              style={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Bookings Tab - Now uses the separate component */}
          {activeTab === "bookings" && (
            <BookingManagement />
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>User Management</h2>
                <p style={styles.sectionSubtitle}>Manage user accounts and permissions</p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>All Users ({users.length})</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Name</th>
                        <th style={styles.tableHeader}>Email</th>
                        <th style={styles.tableHeader}>Role</th>
                        <th style={styles.tableHeader}>Status</th>
                        <th style={styles.tableHeader}>Joined Date</th>
                        <th style={styles.tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{user.name}</td>
                          <td style={styles.tableCell}>{user.email}</td>
                          <td style={styles.tableCell}>
                            <span style={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                              {user.role}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={user.is_banned ? styles.bannedBadge : styles.activeBadge}>
                              {user.is_banned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={styles.tableCell}>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleBanUser(user.id, user.is_banned ? 'unban' : 'ban')}
                                style={user.is_banned ? styles.unbanButton : styles.banButton}
                              >
                                {user.is_banned ? 'Unban' : 'Ban'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)",
    position: "relative",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)",
  },
  loading: {
    fontSize: "1.5rem",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0FA3B1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginTop: "10px",
  },
  dashboard: {
    minHeight: "100vh",
    background: "rgba(255, 255, 255, 0.95)",
    margin: "20px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(15, 163, 177, 0.3)",
    overflow: "hidden",
    position: "relative",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  header: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    padding: "25px 30px",
    boxShadow: "0 4px 20px rgba(15, 163, 177, 0.4)",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    margin: 0,
    fontSize: "2.2rem",
    fontWeight: "bold",
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  logoutButton: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    padding: "12px 24px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  
  // Burger Menu Styles
  burgerMenu: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "30px",
    height: "21px",
    cursor: "pointer",
    padding: "5px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    zIndex: 1002,
    backdropFilter: "blur(10px)",
  },
  burgerLine: {
    height: "3px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "2px",
    transition: "all 0.3s ease",
  },
  
  // Sidebar Styles
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "320px",
    height: "100vh",
    background: "linear-gradient(180deg, #0FA3B1 0%, #0B7A8A 100%)",
    boxShadow: "4px 0 30px rgba(15, 163, 177, 0.5)",
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    zIndex: 1000,
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "1.6rem",
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    fontSize: "2rem",
    cursor: "pointer",
    padding: 0,
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    borderRadius: "50%",
    backdropFilter: "blur(10px)",
  },
  sidebarContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "25px",
  },
  userInfoSidebar: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "25px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    marginBottom: "25px",
  },
  userAvatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.3rem",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "white",
  },
  userEmail: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    margin: "2px 0",
  },
  userRole: {
    background: "rgba(255, 107, 107, 0.9)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    display: "inline-block",
    fontWeight: "bold",
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
  },
  sidebarButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "left",
    transition: "all 0.3s ease",
    color: "white",
    fontWeight: "500",
    backdropFilter: "blur(10px)",
  },
  sidebarButtonContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sidebarIcon: {
    flexShrink: 0,
  },
  activeSidebarButton: {
    background: "rgba(255, 107, 107, 0.3)",
    borderColor: "#FF6B6B",
    transform: "translateX(8px)",
  },
  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "25px",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
  },
  sidebarLogoutButton: {
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
  },
  
  content: {
    padding: "30px",
  },
  welcomeSection: {
    marginBottom: "30px",
    padding: "30px",
    background: "linear-gradient(135deg, #B5E2FA 0%, #FDE2FF 100%)",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
  },
  welcomeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "20px",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: 1,
  },
  profileAvatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0FA3B1 0%, #FF6B6B 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.8rem",
    fontWeight: "bold",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  },
  profileInfo: {
    flex: 1,
  },
  welcomeTitle: {
    color: "#0B7A8A",
    fontSize: "2rem",
    margin: "0 0 8px 0",
    fontWeight: "bold",
  },
  welcomeSubtitle: {
    color: "#666",
    fontSize: "1.1rem",
    margin: 0,
  },
  welcomeStats: {
    display: "flex",
    gap: "15px",
  },
  statMini: {
    textAlign: "center",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    minWidth: "90px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.1)",
  },
  statMiniNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0FA3B1",
    marginBottom: "6px",
  },
  statMiniLabel: {
    fontSize: "0.85rem",
    color: "#666",
    fontWeight: "600",
  },
  welcomeText: {
    color: "#555",
    fontSize: "1.05rem",
    lineHeight: "1.6",
    margin: 0,
  },
  sectionHeader: {
    marginBottom: "30px",
    textAlign: "center",
  },
  sectionTitle: {
    color: "#0B7A8A",
    fontSize: "2.2rem",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: "1.1rem",
  },
  card: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "25px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  cardTitle: {
    color: "#0B7A8A",
    fontSize: "1.5rem",
    marginBottom: "25px",
    borderBottom: "3px solid #0FA3B1",
    paddingBottom: "12px",
    fontWeight: "bold",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "25px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
    transition: "all 0.3s ease",
  },
  statIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: "24px",
    height: "24px",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0FA3B1",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  input: {
    padding: "14px",
    borderRadius: "8px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
    background: "white",
  },
  fileUpload: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },
  fileLabel: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.2)",
  },
  fileInput: {
    display: "none",
  },
  fileCount: {
    color: "#666",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    alignSelf: "flex-start",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid rgba(15, 163, 177, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px",
    borderBottom: "2px solid #0FA3B1",
    textAlign: "left",
    fontWeight: "bold",
    color: "#0B7A8A",
    backgroundColor: "rgba(181, 226, 250, 0.3)",
  },
  tableRow: {
    borderBottom: "1px solid rgba(15, 163, 177, 0.1)",
    transition: "all 0.3s ease",
  },
  tableCell: {
    padding: "14px 16px",
    textAlign: "left",
    color: "#333",
    fontWeight: "500",
  },
  statusSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    fontSize: "0.9rem",
    cursor: "pointer",
    background: "white",
  },
  roomImage: {
    width: "45px",
    height: "45px",
    borderRadius: "6px",
    objectFit: "cover",
    marginRight: "8px",
    border: "1px solid rgba(15, 163, 177, 0.2)",
  },
  moreImages: {
    color: "#666",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  deleteButton: {
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.2)",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "15px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "bold",
    display: "inline-block",
  },
  adminBadge: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  userBadge: {
    background: "linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  activeBadge: {
    background: "linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  bannedBadge: {
    background: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  banButton: {
    background: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(231, 76, 60, 0.2)",
  },
  unbanButton: {
    background: "linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(46, 204, 113, 0.2)",
  },
};

// Add CSS animation for spinner
const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject the animation styles
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(spinAnimation, styleSheet.cssRules.length);

// Add hover effects
Object.assign(styles.logoutButton, {
  ':hover': {
    background: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.6)",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.burgerMenu, {
  ':hover': {
    background: "rgba(255, 255, 255, 0.3)",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.sidebarButton, {
  ':hover': {
    background: "rgba(255, 107, 107, 0.3)",
    transform: "translateX(8px)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  }
});

Object.assign(styles.sidebarLogoutButton, {
  ':hover': {
    background: "linear-gradient(135deg, #FF5252 0%, #FF0000 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.6)",
  }
});

Object.assign(styles.closeButton, {
  ':hover': {
    transform: "scale(1.1)",
    background: "rgba(255, 107, 107, 0.3)",
  }
});

Object.assign(styles.primaryButton, {
  ':hover': {
    background: "linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  }
});

Object.assign(styles.deleteButton, {
  ':hover': {
    background: "linear-gradient(135deg, #FF5252 0%, #E53935 100%)",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
  }
});

Object.assign(styles.banButton, {
  ':hover': {
    background: "linear-gradient(135deg, #C0392B 0%, #A93226 100%)",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(231, 76, 60, 0.4)",
  }
});

Object.assign(styles.unbanButton, {
  ':hover': {
    background: "linear-gradient(135deg, #27AE60 0%, #219653 100%)",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(46, 204, 113, 0.4)",
  }
});

Object.assign(styles.fileLabel, {
  ':hover': {
    background: "linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  }
});

Object.assign(styles.statCard, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
  }
});

Object.assign(styles.tableRow, {
  ':hover': {
    backgroundColor: "rgba(181, 226, 250, 0.1)",
  }
});

Object.assign(styles.input, {
  ':focus': {
    borderColor: "#0FA3B1",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(15, 163, 177, 0.1)",
  }
});

export default AdminDashboard;