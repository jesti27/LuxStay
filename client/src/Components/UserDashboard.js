import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";

function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    confirmed: 0,
    pending: 0,
    upcomingStays: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage and token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email;
      
      setUserData({
        name: localStorage.getItem("userName") || payload.name,
        email: userEmail,
        role: localStorage.getItem("userRole") || payload.role
      });

      // Fetch user bookings
      fetchUserBookings(userEmail);
    } catch (error) {
      console.error("Error decoding token:", error);
      // If token is invalid, clear storage and redirect to login
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserBookings = async (email) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/bookings/user/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        calculateBookingStats(data.data);
        setRecentBookings(data.data.slice(0, 3)); // Get 3 most recent bookings
      } else {
        console.error("Failed to fetch user bookings");
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  const calculateBookingStats = (bookings) => {
    if (!bookings || !Array.isArray(bookings)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    const stats = {
      totalBookings: bookings.length,
      confirmed: 0,
      pending: 0,
      upcomingStays: 0,
      checkedIn: 0,
      checkedOut: 0,
      cancelled: 0
    };

    bookings.forEach(booking => {
      // Count by status (convert to uppercase for consistency)
      const status = booking.status?.toUpperCase();
      
      switch (status) {
        case "CONFIRMED":
          stats.confirmed++;
          break;
        case "PENDING":
          stats.pending++;
          break;
        case "CHECKED_IN":
          stats.checkedIn++;
          break;
        case "CHECKED_OUT":
          stats.checkedOut++;
          break;
        case "CANCELLED":
          stats.cancelled++;
          break;
        default:
          break;
      }

      // Count upcoming stays (confirmed bookings with future check-in date)
      if ((status === "CONFIRMED" || status === "PENDING") && booking.check_in_date) {
        try {
          const checkInDate = new Date(booking.check_in_date);
          checkInDate.setHours(0, 0, 0, 0); // Set to start of day
          
          if (checkInDate >= today) {
            stats.upcomingStays++;
          }
        } catch (error) {
          console.error("Error parsing check-in date:", error);
        }
      }
    });

    setBookingStats(stats);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "PENDING": { color: "#FF9F43", label: "Pending" },
      "CONFIRMED": { color: "#2ECC71", label: "Confirmed" },
      "CHECKED_IN": { color: "#3498DB", label: "Checked In" },
      "CHECKED_OUT": { color: "#9B59B6", label: "Checked Out" },
      "CANCELLED": { color: "#E74C3C", label: "Cancelled" }
    };

    const config = statusConfig[status?.toUpperCase()] || { color: "#666", label: status };
    
    return (
      <span style={{
        background: config.color,
        color: "white",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: "bold"
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/userprofile");
    setSidebarOpen(false);
  };

  const handleChangePassword = () => {
    alert("Change password feature coming soon!");
    setSidebarOpen(false);
  };

  const handleViewHistory = () => {
    navigate("/bookinghistory");
    setSidebarOpen(false);
  };

  const handleBookRoom = () => {
    navigate("/rooms");
    setSidebarOpen(false);
  };

  const handleViewBookings = () => {
    navigate("/userbooking");
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading your dashboard...</div>
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
          <h3 style={styles.sidebarTitle}>Menu</h3>
          <button style={styles.closeButton} onClick={closeSidebar}>×</button>
        </div>
        
        <div style={styles.sidebarContent}>
          <div style={styles.userInfoSidebar}>
            <div style={styles.userAvatar}>
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{userData?.name}</div>
              <div style={styles.userEmail}>{userData?.email}</div>
              <div style={styles.userRole}>{userData?.role}</div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <button 
              style={styles.sidebarButton}
              onClick={handleBookRoom}
            >
              🏨 Book a Room
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleViewBookings}
            >
              📋 View My Bookings
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleViewHistory}
            >
              📊 Booking History
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleEditProfile}
            >
              👤 Edit Profile
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleChangePassword}
            >
              🔒 Change Password
            </button>
          </nav>

          <div style={styles.sidebarFooter}>
            <button 
              style={styles.sidebarLogoutButton}
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div style={styles.dashboard}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Your Dashboard</h1>
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
          {/* Welcome Section with Profile */}
          <div style={styles.welcomeSection}>
            <div style={styles.welcomeHeader}>
              <div style={styles.profileSection}>
                <div style={styles.profileAvatar}>
                  {userData?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.profileInfo}>
                  <h2 style={styles.welcomeTitle}>Welcome back, {userData?.name}! 👋</h2>
                  <p style={styles.welcomeSubtitle}>
                    {userData?.email} • {userData?.role} Account
                  </p>
                </div>
              </div>
              <div style={styles.welcomeStats}>
                <div style={styles.statMini}>
                  <div style={styles.statMiniNumber}>{bookingStats.totalBookings}</div>
                  <div style={styles.statMiniLabel}>Total Bookings</div>
                </div>
                <div style={styles.statMini}>
                  <div style={styles.statMiniNumber}>{bookingStats.upcomingStays}</div>
                  <div style={styles.statMiniLabel}>Upcoming</div>
                </div>
                <div style={styles.statMini}>
                  <div style={styles.statMiniNumber}>{bookingStats.pending}</div>
                  <div style={styles.statMiniLabel}>Pending</div>
                </div>
              </div>
            </div>
            <p style={styles.welcomeText}>
              {bookingStats.totalBookings === 0 
                ? "You are successfully logged in to your account. Start by booking your first room!"
                : `You have ${bookingStats.totalBookings} booking${bookingStats.totalBookings !== 1 ? 's' : ''} in total. Manage your bookings and profile settings from the menu.`
              }
            </p>
          </div>

          {/* User Info Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Profile Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Full Name:</span>
                <span style={styles.infoValue}>{userData?.name || "Not provided"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email Address:</span>
                <span style={styles.infoValue}>{userData?.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Account Role:</span>
                <span style={styles.roleBadge}>{userData?.role}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Account Status:</span>
                <span style={styles.statusActive}>🟢 Active</span>
              </div>
            </div>
          </div>

          {/* Booking Statistics */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Booking Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>📅</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.totalBookings}</div>
                  <div style={styles.statLabel}>Total Bookings</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.confirmed}</div>
                  <div style={styles.statLabel}>Confirmed</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>⏳</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.pending}</div>
                  <div style={styles.statLabel}>Pending</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>🏨</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.upcomingStays}</div>
                  <div style={styles.statLabel}>Upcoming Stays</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>🔵</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.checkedIn}</div>
                  <div style={styles.statLabel}>Checked In</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>🟣</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{bookingStats.checkedOut}</div>
                  <div style={styles.statLabel}>Checked Out</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Recent Bookings</h3>
              <div style={styles.recentBookingsList}>
                {recentBookings.map((booking, index) => (
                  <div key={index} style={styles.bookingItem}>
                    <div style={styles.bookingHeader}>
                      <div style={styles.bookingRoom}>
                        <strong>Room {booking.room_number}</strong>
                        <span style={styles.bookingAmount}>${booking.total_amount}</span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div style={styles.bookingDates}>
                      <span>📅 {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</span>
                    </div>
                    <div style={styles.bookingGuests}>
                      <span>👥 {booking.total_guests} guest{booking.total_guests !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Recent Activity</h3>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <span style={styles.activityIcon}>✅</span>
                <div style={styles.activityContent}>
                  <p style={styles.activityText}>Successfully logged in to your account</p>
                  <span style={styles.activityTime}>Just now</span>
                </div>
              </div>
              
              {bookingStats.totalBookings > 0 && (
                <>
                  <div style={styles.activityItem}>
                    <span style={styles.activityIcon}>📊</span>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>
                        You have {bookingStats.totalBookings} booking{bookingStats.totalBookings !== 1 ? 's' : ''} in total
                      </p>
                      <span style={styles.activityTime}>Updated just now</span>
                    </div>
                  </div>
                  
                  {bookingStats.pending > 0 && (
                    <div style={styles.activityItem}>
                      <span style={styles.activityIcon}>⏳</span>
                      <div style={styles.activityContent}>
                        <p style={styles.activityText}>
                          You have {bookingStats.pending} pending booking{bookingStats.pending !== 1 ? 's' : ''} waiting for confirmation
                        </p>
                        <span style={styles.activityTime}>Needs attention</span>
                      </div>
                    </div>
                  )}
                  
                  {bookingStats.upcomingStays > 0 && (
                    <div style={styles.activityItem}>
                      <span style={styles.activityIcon}>🎉</span>
                      <div style={styles.activityContent}>
                        <p style={styles.activityText}>
                          You have {bookingStats.upcomingStays} upcoming stay{bookingStats.upcomingStays !== 1 ? 's' : ''} to look forward to!
                        </p>
                        <span style={styles.activityTime}>Exciting!</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {bookingStats.totalBookings === 0 && (
                <div style={styles.activityItem}>
                  <span style={styles.activityIcon}>🏨</span>
                  <div style={styles.activityContent}>
                    <p style={styles.activityText}>
                      Ready to book your first room? Use the "Book a Room" option to get started!
                    </p>
                    <span style={styles.activityTime}>Ready when you are</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Quick Tips</h3>
            <div style={styles.tipsList}>
              <div style={styles.tipItem}>
                <span style={styles.tipIcon}>💡</span>
                <span style={styles.tipText}>Book rooms in advance for better availability</span>
              </div>
              <div style={styles.tipItem}>
                <span style={styles.tipIcon}>💡</span>
                <span style={styles.tipText}>Check your booking status anytime in "View My Bookings"</span>
              </div>
              <div style={styles.tipItem}>
                <span style={styles.tipIcon}>💡</span>
                <span style={styles.tipText}>Contact support if you need help with your reservation</span>
              </div>
              {bookingStats.pending > 0 && (
                <div style={styles.tipItem}>
                  <span style={styles.tipIcon}>💡</span>
                  <span style={styles.tipText}>Pending bookings will be confirmed by our staff within 24 hours</span>
                </div>
              )}
            </div>
          </div>
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
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
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
  welcomeText: {
    fontSize: "1.1rem",
    fontWeight: "500",
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
  infoGrid: {
    display: "grid",
    gap: "18px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid rgba(15, 163, 177, 0.1)",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#0B7A8A",
    fontSize: "1rem",
  },
  infoValue: {
    color: "#666",
    fontSize: "1rem",
    fontWeight: "500",
  },
  roleBadge: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    padding: "6px 15px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  statusActive: {
    color: "#2ECC71",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "20px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.1)",
  },
  statIcon: {
    fontSize: "2.2rem",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    color: "#0FA3B1",
  },
  statLabel: {
    fontSize: "0.95rem",
    color: "#666",
    fontWeight: "500",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "18px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
  },
  activityIcon: {
    fontSize: "1.4rem",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    margin: "0 0 6px 0",
    color: "#333",
    fontWeight: "500",
    fontSize: "1rem",
  },
  activityTime: {
    color: "#888",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  tipsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  tipItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "12px",
    background: "rgba(181, 226, 250, 0.3)",
    borderRadius: "10px",
    border: "1px solid rgba(15, 163, 177, 0.1)",
  },
  tipIcon: {
    fontSize: "1.3rem",
    color: "#0FA3B1",
  },
  tipText: {
    color: "#555",
    fontSize: "1rem",
    fontWeight: "500",
  },
  
  // Recent Bookings Styles
  recentBookingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  bookingItem: {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
  },
  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  bookingRoom: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  bookingAmount: {
    color: "#0FA3B1",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  bookingDates: {
    marginBottom: "10px",
    color: "#666",
    fontWeight: "500",
  },
  bookingGuests: {
    color: "#666",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
};

// Add hover effects
Object.assign(styles.burgerMenu, {
  ':hover': {
    background: "rgba(255, 255, 255, 0.3)",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.logoutButton, {
  ':hover': {
    background: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.6)",
    transform: "translateY(-2px)",
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

Object.assign(styles.bookingItem, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.2)",
    borderColor: "rgba(15, 163, 177, 0.3)",
  }
});

Object.assign(styles.statItem, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.2)",
    borderColor: "rgba(15, 163, 177, 0.3)",
  }
});

Object.assign(styles.activityItem, {
  ':hover': {
    transform: "translateX(5px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.15)",
    borderColor: "rgba(15, 163, 177, 0.2)",
  }
});

export default UserDashboard;