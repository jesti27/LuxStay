// UserBooking.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../Utils/api";

function UserBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user email from token
      const token = localStorage.getItem("token");
      if (!token) {
        setError('No token found. Please log in again.');
        setLoading(false);
        return;
      }

      // Decode token to get user email
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userEmailFromToken = payload.email;
      setUserEmail(userEmailFromToken);

      console.log("Fetching bookings for email:", userEmailFromToken);
      
      // Fetch bookings for this user
      const response = await fetch(`${API_BASE_URL}/bookings/user/${encodeURIComponent(userEmailFromToken)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Bookings data received:", data);
      
      if (data.data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        console.warn("Unexpected data format:", data);
        setBookings([]);
      }
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/userdashboard');
  };

  const handleRetry = () => {
    fetchUserBookings();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'CONFIRMED': '#2ECC71',
      'PENDING': '#FF9F43',
      'CHECKED_IN': '#3498DB',
      'CHECKED_OUT': '#9B59B6',
      'CANCELLED': '#E74C3C'
    };
    return statusColors[status] || '#95A5A6';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'CHECKED_IN': 'Checked In',
      'CHECKED_OUT': 'Checked Out',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>
          <div>Loading your bookings...</div>
          <div style={styles.loadingSpinner}>⏳</div>
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
          <h3 style={styles.sidebarTitle}>Menu</h3>
          <button style={styles.closeButton} onClick={closeSidebar}>×</button>
        </div>
        
        <div style={styles.sidebarContent}>
          <div style={styles.userInfoSidebar}>
            <div style={styles.userAvatar}>
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{userEmail}</div>
              <div style={styles.userEmail}>{userEmail}</div>
              <div style={styles.userRole}>User Account</div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <button 
              style={styles.sidebarButton}
              onClick={() => navigate("/userdashboard")}
            >
              🏠 Dashboard
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={() => navigate("/rooms")}
            >
              🏨 Book a Room
            </button>
            <button 
              style={{
                ...styles.sidebarButton,
                background: "rgba(255, 107, 107, 0.2)",
                color: "#0B7A8A",
                borderColor: "#FF6B6B"
              }}
            >
              📋 My Bookings
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={() => navigate("/userprofile")}
            >
              👤 Profile Settings
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

      <div style={{
        ...styles.dashboard,
        filter: sidebarOpen ? 'blur(5px)' : 'none',
        transition: 'filter 0.3s ease'
      }}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>My Bookings</h1>
            <div style={styles.headerActions}>
              <span style={styles.welcomeText}>
                {userEmail ? `Hello, ${userEmail}` : 'My Bookings'}
              </span>
              
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

              <button 
                onClick={handleBackToDashboard} 
                style={styles.backButton}
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <div style={styles.errorMessage}>{error}</div>
              <button onClick={handleRetry} style={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          <div style={styles.debugInfo}>
            <small>
              User: {userEmail} | Bookings: {bookings.length} | 
              API: {API_BASE_URL}
            </small>
          </div>

          {bookings.length === 0 && !error ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📋</div>
              <h3 style={styles.emptyStateTitle}>No Bookings Found</h3>
              <p style={styles.emptyStateText}>You haven't made any bookings yet. Start by booking a room!</p>
              <div style={styles.emptyStateActions}>
                <button 
                  onClick={handleBackToDashboard} 
                  style={styles.emptyStateButton}
                >
                  Browse Rooms
                </button>
                <button 
                  onClick={handleRetry} 
                  style={styles.refreshButton}
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.bookingsHeader}>
                <h2 style={styles.bookingsCount}>
                  {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
                </h2>
                <button onClick={handleRetry} style={styles.refreshButton}>
                  🔄 Refresh
                </button>
              </div>
              
              <div style={styles.bookingsList}>
                {bookings.map((booking) => (
                  <div key={booking.id} style={styles.bookingCard}>
                    <div style={styles.bookingHeader}>
                      <div style={styles.bookingTitleSection}>
                        <h3 style={styles.bookingTitle}>
                          Room {booking.room_number}
                        </h3>
                        <div style={styles.bookingMeta}>
                          <span style={styles.bookingId}>Booking ID: {booking.id?.slice(-8) || 'N/A'}</span>
                          <span style={styles.bookingDate}>
                            Booked on {formatDate(booking.created_at)}
                          </span>
                        </div>
                      </div>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(booking.status)
                        }}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>
                    
                    <div style={styles.bookingDetails}>
                      <div style={styles.detailGrid}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Guest Name:</span>
                          <span style={styles.detailValue}>{booking.guest_name}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Check-in:</span>
                          <span style={styles.detailValue}>{formatDate(booking.check_in_date)}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Check-out:</span>
                          <span style={styles.detailValue}>{formatDate(booking.check_out_date)}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Number of Guests:</span>
                          <span style={styles.detailValue}>{booking.total_guests}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Payment Method:</span>
                          <span style={styles.detailValue}>{booking.payment_method}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Total Amount:</span>
                          <span style={styles.totalAmount}>${booking.total_amount}</span>
                        </div>
                      </div>
                      
                      {booking.special_requests && (
                        <div style={styles.specialRequests}>
                          <span style={styles.detailLabel}>Special Requests:</span>
                          <p style={styles.requestsText}>{booking.special_requests}</p>
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.bookingFooter}>
                      <span style={styles.contactInfo}>
                        Contact: {booking.guest_phone} | {booking.guest_email}
                      </span>
                    </div>
                  </div>
                ))}
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
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)',
    padding: '20px',
    position: 'relative',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)',
  },
  loading: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  loadingSpinner: {
    fontSize: '2rem',
    marginTop: '10px',
  },
  dashboard: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(15, 163, 177, 0.3)',
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  header: {
    background: 'linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)',
    color: 'white',
    padding: '25px 30px',
    boxShadow: '0 4px 20px rgba(15, 163, 177, 0.4)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '2.2rem',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  welcomeText: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    padding: '12px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  
  // Burger Menu Styles
  burgerMenu: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '30px',
    height: '21px',
    cursor: 'pointer',
    padding: '5px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    zIndex: 1002,
    backdropFilter: 'blur(10px)',
  },
  burgerLine: {
    height: '3px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  
  // Sidebar Styles
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '320px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0FA3B1 0%, #0B7A8A 100%)',
    boxShadow: '4px 0 30px rgba(15, 163, 177, 0.5)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    zIndex: 1000,
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: 0,
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    borderRadius: '50%',
    backdropFilter: 'blur(10px)',
  },
  sidebarContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '25px',
  },
  userInfoSidebar: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '25px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    marginBottom: '25px',
  },
  userAvatar: {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: 'white',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    margin: '2px 0',
  },
  userRole: {
    background: 'rgba(255, 107, 107, 0.9)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    display: 'inline-block',
    fontWeight: 'bold',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  sidebarButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    color: 'white',
    fontWeight: '500',
    backdropFilter: 'blur(10px)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '25px',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  },
  sidebarLogoutButton: {
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
  },

  content: {
    padding: '30px',
  },
  debugInfo: {
    background: 'rgba(181, 226, 250, 0.3)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.8rem',
    color: '#0B7A8A',
    textAlign: 'center',
    border: '1px dashed rgba(15, 163, 177, 0.3)',
    fontWeight: '500',
  },
  errorContainer: {
    background: 'linear-gradient(135deg, #FFE7E7 0%, #FFC9C9 100%)',
    color: '#D63031',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '25px',
    textAlign: 'center',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.1)',
  },
  errorMessage: {
    marginBottom: '18px',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  retryButton: {
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
  },
  bookingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
    padding: '20px',
    background: 'linear-gradient(135deg, #B5E2FA 0%, #FDE2FF 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(15, 163, 177, 0.2)',
  },
  bookingsCount: {
    color: '#0B7A8A',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    margin: 0,
  },
  refreshButton: {
    background: 'linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(15, 163, 177, 0.2)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 30px',
    color: '#666',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '16px',
    border: '2px dashed rgba(15, 163, 177, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  emptyStateIcon: {
    fontSize: '5rem',
    marginBottom: '25px',
    opacity: '0.7',
  },
  emptyStateTitle: {
    color: '#0B7A8A',
    fontSize: '1.8rem',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: '1.1rem',
    marginBottom: '30px',
    color: '#666',
    lineHeight: '1.5',
  },
  emptyStateActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '18px',
    marginTop: '25px',
    flexWrap: 'wrap',
  },
  emptyStateButton: {
    background: 'linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(15, 163, 177, 0.3)',
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  bookingCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '18px',
  },
  bookingTitleSection: {
    flex: 1,
  },
  bookingTitle: {
    margin: '0 0 12px 0',
    color: '#0B7A8A',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  bookingMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  bookingId: {
    color: '#666',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  bookingDate: {
    color: '#666',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  statusBadge: {
    color: 'white',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    minWidth: '120px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  bookingDetails: {
    marginBottom: '25px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '15px',
    background: 'rgba(181, 226, 250, 0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(15, 163, 177, 0.1)',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#0B7A8A',
    fontSize: '0.95rem',
  },
  detailValue: {
    color: '#333',
    fontSize: '1.05rem',
    fontWeight: '500',
  },
  totalAmount: {
    color: '#0FA3B1',
    fontWeight: 'bold',
    fontSize: '1.3rem',
  },
  specialRequests: {
    padding: '20px',
    background: 'linear-gradient(135deg, #FDE2FF 0%, #E2F3FF 100%)',
    borderRadius: '10px',
    borderLeft: '4px solid #0FA3B1',
  },
  requestsText: {
    margin: '10px 0 0 0',
    color: '#666',
    fontSize: '1rem',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  bookingFooter: {
    borderTop: '1px solid rgba(15, 163, 177, 0.2)',
    paddingTop: '18px',
  },
  contactInfo: {
    color: '#666',
    fontSize: '0.95rem',
    fontStyle: 'italic',
    fontWeight: '500',
  },
};

// Add hover effects
Object.assign(styles.backButton, {
  ':hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateY(-2px)',
  }
});

Object.assign(styles.burgerMenu, {
  ':hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.05)',
  }
});

Object.assign(styles.sidebarButton, {
  ':hover': {
    background: 'rgba(255, 107, 107, 0.3)',
    transform: 'translateX(8px)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  }
});

Object.assign(styles.sidebarLogoutButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #FF5252 0%, #FF0000 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6)',
  }
});

Object.assign(styles.closeButton, {
  ':hover': {
    transform: 'scale(1.1)',
    background: 'rgba(255, 107, 107, 0.3)',
  }
});

Object.assign(styles.emptyStateButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(15, 163, 177, 0.4)',
  }
});

Object.assign(styles.refreshButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(15, 163, 177, 0.3)',
  }
});

Object.assign(styles.retryButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #FF5252 0%, #E53935 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
  }
});

Object.assign(styles.bookingCard, {
  ':hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(15, 163, 177, 0.2)',
    borderColor: 'rgba(15, 163, 177, 0.3)',
  }
});

export default UserBookings;