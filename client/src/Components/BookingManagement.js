import React, { useState, useEffect } from "react";
import API_BASE_URL from "../Utils/api";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings from:", `${API_BASE_URL}/bookings/`);
      
      const response = await fetch(`${API_BASE_URL}/bookings/`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorText = await response.text();
        console.error("Server error response text:", errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Bookings data received:", data);
      
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
        console.log(`Loaded ${data.data.length} bookings`);
      } else {
        console.warn("Unexpected data format:", data);
        setBookings([]);
      }
      
    } catch (error) {
      console.error("Error fetching bookings:", error);
      const errorMessage = error.message || "Unknown error occurred";
      alert("Error loading bookings: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId, status) => {
    if (!bookingId) {
      alert("Error: Invalid booking ID");
      return;
    }

    try {
      setUpdatingId(bookingId);
      
      console.log(`Updating booking ${bookingId} to status: ${status}`);
      console.log(`Sending PUT request to: ${API_BASE_URL}/bookings/${bookingId}`);
      
      // Optimistically update the UI
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: status }
            : booking
        )
      );
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
      });
      
      console.log(`Response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed JSON response:", responseData);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        // Revert optimistic update if failed
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: booking.status } // revert to original status
              : booking
          )
        );
        
        let errorMessage = "Update failed";
        
        if (responseData) {
          if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else {
            errorMessage = JSON.stringify(responseData);
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        console.error("Server error:", errorMessage);
        throw new Error(errorMessage);
      }
      
      if (!responseData.success) {
        // Revert optimistic update if failed
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: booking.status }
              : booking
          )
        );
        
        const errorMessage = responseData.message || "Update failed without specific error";
        console.error("Update failed:", errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log("Update successful:", responseData);
      
      // Refresh data to ensure consistency with server
      fetchBookings();
      
      alert(responseData.message || `Booking ${status.toLowerCase()} successfully!`);
      
    } catch (error) {
      console.error("Update error:", error);
      
      let userMessage = "Failed to update booking";
      
      if (error && error.message) {
        userMessage = error.message;
      } else if (typeof error === 'string') {
        userMessage = error;
      } else if (error && typeof error === 'object') {
        userMessage = JSON.stringify(error);
      }
      
      if (userMessage.includes("NetworkError") || userMessage.includes("Failed to fetch")) {
        userMessage = "Network error: Please check your internet connection";
      } else if (userMessage.includes("404")) {
        userMessage = "Booking not found. It may have been deleted.";
      } else if (userMessage.includes("400")) {
        userMessage = "Invalid request. Please try again.";
      } else if (userMessage.includes("500")) {
        userMessage = "Server error. Please try again later.";
      }
      
      alert(`Error: ${userMessage}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = String(status).toUpperCase();
    switch (statusUpper) {
      case "PENDING": return "#ff9800";
      case "CONFIRMED": return "#4caf50";
      case "CANCELLED": return "#f44336";
      case "CHECKED_IN": return "#2196f3";
      case "CHECKED_OUT": return "#9c27b0";
      default: return "#757575";
    }
  };

  const filteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(booking => String(booking.status).toUpperCase() === filter);

  const getStatusCount = (status) => {
    return bookings.filter(booking => String(booking.status).toUpperCase() === status).length;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>
          <div>Loading bookings...</div>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Booking Management</h2>
        <p style={styles.sectionSubtitle}>
          Manage and review all booking requests from users
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <div style={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={styles.icon}>
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
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
            <div style={{...styles.statIcon, backgroundColor: '#fff3e0'}}>
              <svg viewBox="0 0 24 24" fill="#ff9800" style={styles.icon}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{getStatusCount("PENDING")}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <div style={{...styles.statIcon, backgroundColor: '#e8f5e8'}}>
              <svg viewBox="0 0 24 24" fill="#4caf50" style={styles.icon}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{getStatusCount("CONFIRMED")}</div>
            <div style={styles.statLabel}>Confirmed</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <div style={{...styles.statIcon, backgroundColor: '#e3f2fd'}}>
              <svg viewBox="0 0 24 24" fill="#2196f3" style={styles.icon}>
                <path d="M18 10h-4V6c0-1.1-.9-2-2-2s-2 .9-2 2v4H6c-1.1 0-2 .9-2 2s.9 2 2 2h4v4c0 1.1.9 2 2 2s2-.9 2-2v-4h4c1.1 0 2-.9 2-2s-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{getStatusCount("CHECKED_IN")}</div>
            <div style={styles.statLabel}>Checked In</div>
          </div>
        </div>
      </div>

      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="ALL">All Bookings</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button 
          onClick={fetchBookings}
          style={styles.refreshButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Bookings ({filteredBookings.length})
          {getStatusCount("PENDING") > 0 && (
            <span style={styles.pendingBadge}>
              {getStatusCount("PENDING")} Pending
            </span>
          )}
        </h3>
        
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="#666">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2z"/>
              </svg>
            </div>
            <h4 style={styles.emptyTitle}>No bookings found</h4>
            <p style={styles.emptyText}>
              {filter === "ALL" 
                ? "There are no bookings in the system yet." 
                : `There are no ${filter.toLowerCase()} bookings.`}
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Booking ID</th>
                  <th style={styles.tableHeader}>Room Number</th>
                  <th style={styles.tableHeader}>Guest Name</th>
                  <th style={styles.tableHeader}>Guest Email</th>
                  <th style={styles.tableHeader}>Total Amount</th>
                  <th style={styles.tableHeader}>Check-in Date</th>
                  <th style={styles.tableHeader}>Check-out Date</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.bookingId}>#{booking.id.slice(-8)}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <strong>Room {booking.room_number}</strong>
                    </td>
                    <td style={styles.tableCell}>{booking.guest_name}</td>
                    <td style={styles.tableCell}>{booking.guest_email}</td>
                    <td style={styles.tableCell}>
                      <strong>${booking.total_amount}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(booking.status)
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        {String(booking.status).toUpperCase() === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "CONFIRMED")}
                              style={{
                                ...styles.confirmButton,
                                ...(updatingId === booking.id ? styles.disabledButton : {})
                              }}
                              disabled={updatingId === booking.id}
                              title="Confirm Booking"
                            >
                              {updatingId === booking.id ? "Updating..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "CANCELLED")}
                              style={{
                                ...styles.cancelButton,
                                ...(updatingId === booking.id ? styles.disabledButton : {})
                              }}
                              disabled={updatingId === booking.id}
                              title="Cancel Booking"
                            >
                              {updatingId === booking.id ? "Updating..." : "Cancel"}
                            </button>
                          </>
                        )}
                        
                        {String(booking.status).toUpperCase() === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "CHECKED_IN")}
                              style={{
                                ...styles.checkInButton,
                                ...(updatingId === booking.id ? styles.disabledButton : {})
                              }}
                              disabled={updatingId === booking.id}
                              title="Check In Guest"
                            >
                              {updatingId === booking.id ? "Updating..." : "Check In"}
                            </button>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "CANCELLED")}
                              style={{
                                ...styles.cancelButton,
                                ...(updatingId === booking.id ? styles.disabledButton : {})
                              }}
                              disabled={updatingId === booking.id}
                              title="Cancel Booking"
                            >
                              {updatingId === booking.id ? "Updating..." : "Cancel"}
                            </button>
                          </>
                        )}
                        
                        {String(booking.status).toUpperCase() === "CHECKED_IN" && (
                          <button
                            onClick={() => handleUpdateBooking(booking.id, "CHECKED_OUT")}
                            style={{
                              ...styles.checkOutButton,
                              ...(updatingId === booking.id ? styles.disabledButton : {})
                            }}
                            disabled={updatingId === booking.id}
                            title="Check Out Guest"
                          >
                            {updatingId === booking.id ? "Updating..." : "Check Out"}
                          </button>
                        )}
                        
                        {(String(booking.status).toUpperCase() === "CANCELLED" || 
                          String(booking.status).toUpperCase() === "CHECKED_OUT") && (
                          <span style={styles.noAction}>No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    flexDirection: "column",
  },
  loading: {
    fontSize: "1.2rem",
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3949ab",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginTop: "10px",
  },
  sectionHeader: {
    marginBottom: "30px",
    textAlign: "center",
  },
  sectionTitle: {
    color: "#3949ab",
    fontSize: "2rem",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: "1.1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
    backgroundColor: '#f0f4ff',
  },
  icon: {
    width: "24px",
    height: "24px",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#3949ab",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
  },
  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: "15px",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "1rem",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "2px solid #e0e0e0",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "white",
    minWidth: "150px",
  },
  refreshButton: {
    background: "#3949ab",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    color: "#3949ab",
    fontSize: "1.4rem",
    marginBottom: "20px",
    borderBottom: "2px solid #3949ab",
    paddingBottom: "10px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  pendingBadge: {
    background: "#ff9800",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    minWidth: "800px",
  },
  tableHeader: {
    padding: "12px 15px",
    backgroundColor: "#3949ab",
    color: "white",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #e0e0e0",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
  },
  tableCell: {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #e0e0e0",
    verticalAlign: "middle",
  },
  bookingId: {
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: "#666",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "15px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "bold",
    display: "inline-block",
    textAlign: "center",
    minWidth: "80px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    minWidth: "200px",
  },
  confirmButton: {
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    minWidth: "100px",
  },
  checkInButton: {
    background: "#2196f3",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    minWidth: "100px",
  },
  checkOutButton: {
    background: "#9c27b0",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    minWidth: "100px",
  },
  cancelButton: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    minWidth: "100px",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  noAction: {
    color: "#666",
    fontSize: "0.8rem",
    fontStyle: "italic",
    padding: "8px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#666",
  },
  emptyIcon: {
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: "1.2rem",
    marginBottom: "10px",
    color: "#333",
  },
  emptyText: {
    fontSize: "1rem",
    lineHeight: "1.5",
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  const spinAnimation = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  styleSheet.insertRule(spinAnimation, styleSheet.cssRules.length);
}

// Add hover effects using JavaScript event listeners or CSS-in-JS
// For better performance, you might want to move these to a CSS file
const addHoverEffects = () => {
  // These would typically be in a CSS file
  const hoverStyles = `
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    .refresh-button:hover {
      background: #1a237e;
      transform: translateY(-1px);
    }
    .confirm-button:hover {
      background: #45a049;
      transform: scale(1.05);
    }
    .cancel-button:hover {
      background: #da190b;
      transform: scale(1.05);
    }
    .checkin-button:hover {
      background: #1976d2;
      transform: scale(1.05);
    }
    .checkout-button:hover {
      background: #7b1fa2;
      transform: scale(1.05);
    }
    .table-row:hover {
      background-color: #f8f9fa;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = hoverStyles;
  document.head.append(style);
};

// Call this function when component mounts
// useEffect(() => {
//   addHoverEffects();
// }, []);

export default BookingManagement;