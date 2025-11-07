import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";

function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserBookings();
  }, [navigate]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmail = payload.email;

      const response = await fetch(`${API_BASE_URL}/bookings/user/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      } else {
        console.error("Failed to fetch user bookings");
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    } finally {
      setLoading(false);
    }
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

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const handleBackToDashboard = () => {
    navigate("/userdashboard");
  };

  const handleBookRoom = () => {
    navigate("/rooms");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "ALL") return true;
    return booking.status?.toUpperCase() === activeTab;
  });

  // Separate confirmed and pending bookings for the special containers
  const confirmedBookings = bookings.filter(booking => 
    booking.status?.toUpperCase() === "CONFIRMED"
  );
  
  const pendingBookings = bookings.filter(booking => 
    booking.status?.toUpperCase() === "PENDING"
  );

  const getStatusCount = (status) => {
    return bookings.filter(booking => booking.status?.toUpperCase() === status).length;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading your booking history...</div>
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
          <nav style={styles.sidebarNav}>
            <button 
              style={styles.sidebarButton}
              onClick={handleBackToDashboard}
            >
              📊 Dashboard
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleBookRoom}
            >
              🏨 Book a Room
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={() => setSidebarOpen(false)}
            >
              📋 Booking History
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={handleEditProfile}
            >
              👤 Edit Profile
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

      {/* Main Content */}
      <div style={styles.dashboard}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <button 
                style={styles.backButton}
                onClick={handleBackToDashboard}
              >
                ← Back to Dashboard
              </button>
              <h1 style={styles.title}>Booking History</h1>
            </div>
            <div style={styles.headerActions}>
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
          {/* Summary Cards */}
          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryNumber}>{bookings.length}</div>
              <div style={styles.summaryLabel}>Total Bookings</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryNumber}>{getStatusCount("CONFIRMED")}</div>
              <div style={styles.summaryLabel}>Confirmed</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryNumber}>{getStatusCount("PENDING")}</div>
              <div style={styles.summaryLabel}>Pending</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryNumber}>{getStatusCount("CHECKED_OUT")}</div>
              <div style={styles.summaryLabel}>Completed</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabSection}>
            <div style={styles.tabContainer}>
              {[
                { key: "ALL", label: "All Bookings", count: bookings.length },
                { key: "CONFIRMED", label: "Confirmed", count: confirmedBookings.length },
                { key: "PENDING", label: "Pending", count: pendingBookings.length },
                { key: "CHECKED_IN", label: "Checked In", count: getStatusCount("CHECKED_IN") },
                { key: "CHECKED_OUT", label: "Completed", count: getStatusCount("CHECKED_OUT") },
                { key: "CANCELLED", label: "Cancelled", count: getStatusCount("CANCELLED") }
              ].map(tab => (
                <button
                  key={tab.key}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab.key ? styles.tabButtonActive : {})
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span style={styles.tabLabel}>{tab.label}</span>
                  <span style={styles.tabCount}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Containers for Confirmed and Pending - 2 Column Layout */}
          {activeTab === "ALL" && (confirmedBookings.length > 0 || pendingBookings.length > 0) && (
            <div style={styles.twoColumnSection}>
              {/* Confirmed Bookings Column */}
              {confirmedBookings.length > 0 && (
                <div style={styles.column}>
                  <div style={styles.columnHeader}>
                    <h2 style={styles.columnTitle}>
                      ✅ Confirmed Bookings
                      <span style={styles.bookingCount}>({confirmedBookings.length})</span>
                    </h2>
                    <div style={styles.columnSubtitle}>
                      Your upcoming stays that are confirmed and ready
                    </div>
                  </div>
                  <div style={styles.bookingsList}>
                    {confirmedBookings.map((booking, index) => (
                      <BookingCard key={booking.booking_id || index} booking={booking} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Bookings Column */}
              {pendingBookings.length > 0 && (
                <div style={styles.column}>
                  <div style={styles.columnHeader}>
                    <h2 style={styles.columnTitle}>
                      ⏳ Pending Bookings
                      <span style={styles.bookingCount}>({pendingBookings.length})</span>
                    </h2>
                    <div style={styles.columnSubtitle}>
                      Bookings waiting for confirmation
                    </div>
                  </div>
                  <div style={styles.bookingsList}>
                    {pendingBookings.map((booking, index) => (
                      <BookingCard key={booking.booking_id || index} booking={booking} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other Bookings Section (for non-confirmed/pending or when viewing specific tabs) */}
          {(activeTab !== "ALL" || 
            (activeTab === "ALL" && (confirmedBookings.length === 0 && pendingBookings.length === 0)) ||
            (activeTab === "ALL" && bookings.length > (confirmedBookings.length + pendingBookings.length))
          ) && (
            <div style={styles.bookingsSection}>
              <h2 style={styles.sectionTitle}>
                {activeTab === "ALL" 
                  ? "Other Bookings" 
                  : `${activeTab.replace('_', ' ')} Bookings`
                }
                <span style={styles.bookingCount}>
                  ({activeTab === "ALL" 
                    ? bookings.length - confirmedBookings.length - pendingBookings.length 
                    : filteredBookings.length
                  })
                </span>
              </h2>

              {filteredBookings.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    {activeTab === "CONFIRMED" ? "✅" : 
                     activeTab === "PENDING" ? "⏳" : 
                     activeTab === "CHECKED_IN" ? "🏨" :
                     activeTab === "CHECKED_OUT" ? "✅" :
                     activeTab === "CANCELLED" ? "❌" : "📋"}
                  </div>
                  <h3 style={styles.emptyTitle}>
                    {activeTab === "ALL" 
                      ? "No other bookings found" 
                      : `No ${activeTab.toLowerCase().replace('_', ' ')} bookings`
                    }
                  </h3>
                  <p style={styles.emptyText}>
                    {activeTab === "ALL" 
                      ? "You haven't made any other bookings yet."
                      : `You don't have any ${activeTab.toLowerCase().replace('_', ' ')} bookings.`
                    }
                  </p>
                  {activeTab === "ALL" && (
                    <button 
                      style={styles.bookRoomButton}
                      onClick={handleBookRoom}
                    >
                      🏨 Book Another Room
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.bookingsList}>
                  {filteredBookings.map((booking, index) => (
                    <BookingCard key={booking.booking_id || index} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate BookingCard component for reusability
const BookingCard = ({ booking }) => {
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

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div style={styles.bookingCard}>
      <div style={styles.bookingHeader}>
        <div style={styles.bookingInfo}>
          <h3 style={styles.bookingId}>
            Booking #{booking.booking_id || `N/A`}
          </h3>
          <div style={styles.bookingMeta}>
            <span style={styles.bookingDate}>
              📅 Booked on: {formatDateTime(booking.created_at || booking.booking_date)}
            </span>
          </div>
        </div>
        <div style={styles.bookingStatus}>
          {getStatusBadge(booking.status)}
          <div style={styles.bookingAmount}>
            ${booking.total_amount || "0.00"}
          </div>
        </div>
      </div>

      <div style={styles.bookingDetails}>
        <div style={styles.detailRow}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Room:</span>
            <span style={styles.detailValue}>
              {booking.room_number ? `Room ${booking.room_number}` : "Room info not available"}
            </span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Guests:</span>
            <span style={styles.detailValue}>
              {booking.total_guests || 1} guest{booking.total_guests !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div style={styles.detailRow}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Check-in:</span>
            <span style={styles.detailValue}>
              {formatDate(booking.check_in_date)}
            </span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Check-out:</span>
            <span style={styles.detailValue}>
              {formatDate(booking.check_out_date)}
            </span>
          </div>
        </div>

        {booking.special_requests && (
          <div style={styles.specialRequests}>
            <span style={styles.detailLabel}>Special Requests:</span>
            <span style={styles.detailValue}>{booking.special_requests}</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  backButton: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    padding: "10px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
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
  },
  burgerLine: {
    height: "3px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "2px",
    transition: "all 0.3s ease",
  },
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
  },
  sidebarContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "25px",
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
  summarySection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryCard: {
    background: "linear-gradient(135deg, #B5E2FA 0%, #FDE2FF 100%)",
    padding: "25px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
  },
  summaryNumber: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#0FA3B1",
    marginBottom: "8px",
  },
  summaryLabel: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "600",
  },
  // New Tab Styles
  tabSection: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "30px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  tabContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "white",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    padding: "12px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    borderColor: "#0FA3B1",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  tabLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  tabCount: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "inherit",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  // Two Column Layout Styles
  twoColumnSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
    marginBottom: "30px",
    alignItems: "flex-start",
  },
  column: {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "25px",
    borderRadius: "16px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
    minHeight: "400px",
  },
  columnHeader: {
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid rgba(15, 163, 177, 0.1)",
  },
  columnTitle: {
    color: "#0B7A8A",
    fontSize: "1.4rem",
    margin: "0 0 8px 0",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  columnSubtitle: {
    color: "#666",
    fontSize: "0.9rem",
    fontStyle: "italic",
  },
  bookingsSection: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  sectionTitle: {
    color: "#0B7A8A",
    fontSize: "1.8rem",
    marginBottom: "25px",
    borderBottom: "3px solid #0FA3B1",
    paddingBottom: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bookingCount: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "normal",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  emptyTitle: {
    color: "#0B7A8A",
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  emptyText: {
    color: "#666",
    fontSize: "1.1rem",
    marginBottom: "30px",
  },
  bookRoomButton: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  bookingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  bookingCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
  },
  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  bookingInfo: {
    flex: 1,
  },
  bookingId: {
    color: "#0B7A8A",
    fontSize: "1.1rem",
    margin: "0 0 6px 0",
    fontWeight: "bold",
  },
  bookingMeta: {
    color: "#666",
    fontSize: "0.8rem",
  },
  bookingStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
  },
  bookingAmount: {
    color: "#0FA3B1",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  bookingDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#0B7A8A",
    minWidth: "70px",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#666",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
  specialRequests: {
    padding: "12px",
    background: "rgba(181, 226, 250, 0.3)",
    borderRadius: "8px",
    border: "1px solid rgba(15, 163, 177, 0.1)",
    fontSize: "0.9rem",
  },
};

// Add hover effects
Object.assign(styles.backButton, {
  ':hover': {
    background: "rgba(255, 255, 255, 0.3)",
    transform: "translateY(-2px)",
  }
});

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

Object.assign(styles.tabButton, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.2)",
    borderColor: "rgba(15, 163, 177, 0.4)",
  }
});

Object.assign(styles.bookRoomButton, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  }
});

Object.assign(styles.bookingCard, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.2)",
    borderColor: "rgba(15, 163, 177, 0.3)",
  }
});

export default BookingHistory;