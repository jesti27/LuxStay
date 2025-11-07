import React, { useState, useEffect } from "react";
import API_BASE_URL from "../Utils/api";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    pricePerNight: "",
    status: "Available",
    specialFeatures: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/rooms/`);
      const data = await res.json();
      setRooms(data.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching rooms");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await fetch(`${API_BASE_URL}/bookings/`);
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Create Room
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

  // Delete Room
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

  // Update Room status
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

  // Update Booking Status (Confirm/Cancel/Check-in/Check-out)
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase().replace('_', ' ')} this booking?`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update booking");
      }
      
      const data = await res.json();
      alert(`Booking ${newStatus.toLowerCase().replace('_', ' ')} successfully!`);
      fetchBookings(); // Refresh bookings list
      fetchRooms(); // Refresh rooms to update status
    } catch (err) {
      console.error(err);
      alert(`Error updating booking: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "#4caf50";
      case "Occupied": return "#ff9800";
      case "Maintenance": return "#f44336";
      case "Reserved": return "#2196f3";
      default: return "#757575";
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "#ff9800";
      case "CONFIRMED": return "#4caf50";
      case "CHECKED_IN": return "#2196f3";
      case "CHECKED_OUT": return "#757575";
      case "CANCELLED": return "#f44336";
      default: return "#757575";
    }
  };

  // Safe function to handle special features
  const getSpecialFeatures = (features) => {
    if (!features) return [];
    if (typeof features === 'string') {
      return features.split(',').map(feature => feature.trim()).filter(feature => feature);
    }
    if (Array.isArray(features)) {
      return features;
    }
    return [];
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading rooms...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Room Management</h1>
        <p style={styles.subtitle}>Manage all hotel rooms, availability, and room details</p>
      </div>

      <div style={styles.content}>
        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏨</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{rooms.length}</div>
              <div style={styles.statLabel}>Total Rooms</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{rooms.filter(r => r.status === "Available").length}</div>
              <div style={styles.statLabel}>Available</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🛏️</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{rooms.filter(r => r.status === "Occupied").length}</div>
              <div style={styles.statLabel}>Occupied</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔧</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{rooms.filter(r => r.status === "Maintenance").length}</div>
              <div style={styles.statLabel}>Maintenance</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{bookings.filter(b => b.status === "PENDING").length}</div>
              <div style={styles.statLabel}>Pending Bookings</div>
            </div>
          </div>
        </div>

        {/* Create Room Form */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add New Room</h3>
          <form onSubmit={handleCreateRoom} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Room Number</label>
                <input
                  name="roomNumber"
                  placeholder="e.g., 101, 201"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Room Type</label>
                <input
                  name="roomType"
                  placeholder="e.g., Deluxe, Suite, Standard"
                  value={formData.roomType}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Price Per Night ($)</label>
                <input
                  name="pricePerNight"
                  placeholder="e.g., 150"
                  type="number"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Special Features</label>
              <input
                name="specialFeatures"
                placeholder="e.g., Ocean View, Balcony, Jacuzzi"
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
              🏨 Create Room
            </button>
          </form>
        </div>

        {/* Bookings Management */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Bookings Management ({bookings.length})</h3>
            <button onClick={fetchBookings} style={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Booking ID</th>
                  <th style={styles.tableHeader}>Room</th>
                  <th style={styles.tableHeader}>Guest</th>
                  <th style={styles.tableHeader}>Dates</th>
                  <th style={styles.tableHeader}>Amount</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.bookingId}>{booking.id.slice(-8)}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.roomInfo}>
                        <div style={styles.roomNumber}>{booking.room_number}</div>
                        <div style={styles.roomTypeSmall}>Room</div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.guestInfo}>
                        <div style={styles.guestName}>{booking.guest_name}</div>
                        <div style={styles.guestEmail}>{booking.guest_email}</div>
                        <div style={styles.guestPhone}>{booking.guest_phone}</div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.dateInfo}>
                        <div style={styles.dateRange}>
                          {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                        </div>
                        <div style={styles.guestsCount}>{booking.total_guests} guests</div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.amount}>${booking.total_amount}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: `${getBookingStatusColor(booking.status)}20`,
                          color: getBookingStatusColor(booking.status),
                          border: `1px solid ${getBookingStatusColor(booking.status)}`
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        {booking.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                              style={styles.confirmButton}
                              title="Confirm Booking"
                            >
                              ✅ Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                              style={styles.cancelButton}
                              title="Cancel Booking"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        ) : booking.status === "CONFIRMED" ? (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, "CHECKED_IN")}
                              style={styles.checkinButton}
                              title="Check In Guest"
                            >
                              🏨 Check In
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                              style={styles.cancelButton}
                              title="Cancel Booking"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        ) : booking.status === "CHECKED_IN" ? (
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, "CHECKED_OUT")}
                            style={styles.checkoutButton}
                            title="Check Out Guest"
                          >
                            🚪 Check Out
                          </button>
                        ) : (
                          <span style={styles.noActions}>No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <h3 style={styles.emptyTitle}>No Bookings Found</h3>
                <p style={styles.emptyText}>All bookings will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Room List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>All Rooms ({rooms.length})</h3>
            <button onClick={fetchRooms} style={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Room Number</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Price</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Features</th>
                  <th style={styles.tableHeader}>Images</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const features = getSpecialFeatures(room.specialFeatures);
                  
                  return (
                    <tr key={room.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.roomNumber}>{room.roomNumber}</div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.roomType}>{room.roomType}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.price}>${room.pricePerNight}</div>
                        <div style={styles.priceLabel}>per night</div>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          value={room.status}
                          onChange={(e) => handleUpdateRoom(room.id, e.target.value)}
                          style={{
                            ...styles.statusSelect,
                            borderColor: getStatusColor(room.status),
                            backgroundColor: `${getStatusColor(room.status)}15`
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Reserved">Reserved</option>
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.features}>
                          {features.length > 0 ? (
                            features.map((feature, index) => (
                              <span key={index} style={styles.featureTag}>
                                {feature}
                              </span>
                            ))
                          ) : (
                            <span style={styles.noFeatures}>No features</span>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.imageGallery}>
                          {room.images?.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Room ${room.roomNumber}`}
                              style={styles.roomImage}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ))}
                          {room.images?.length > 3 && (
                            <div style={styles.moreImages}>+{room.images.length - 3}</div>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            style={styles.deleteButton}
                            title="Delete Room"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rooms.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏨</div>
                <h3 style={styles.emptyTitle}>No Rooms Found</h3>
                <p style={styles.emptyText}>Get started by adding your first room above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  loading: {
    fontSize: "1.5rem",
    color: "white",
    fontWeight: "bold",
  },
  header: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "25px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#3949ab",
    marginBottom: "10px",
  },
  subtitle: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#666",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "2.5rem",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#3949ab",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
  },
  
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    marginBottom: "25px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    color: "#3949ab",
    fontSize: "1.4rem",
    margin: 0,
    fontWeight: "bold",
  },
  refreshButton: {
    background: "#3949ab",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inputLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
    background: "white",
  },
  fileUpload: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  fileLabel: {
    background: "#3949ab",
    color: "white",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  fileInput: {
    display: "none",
  },
  fileCount: {
    color: "#666",
    fontSize: "0.9rem",
  },
  primaryButton: {
    background: "#3949ab",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    alignSelf: "flex-start",
  },
  
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  tableHeader: {
    padding: "15px",
    borderBottom: "2px solid #e0e0e0",
    textAlign: "left",
    fontWeight: "bold",
    color: "#3949ab",
    backgroundColor: "#f8f9fa",
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0",
    transition: "background-color 0.3s ease",
  },
  tableCell: {
    padding: "15px",
    textAlign: "left",
    verticalAlign: "middle",
  },
  
  // Room table styles
  roomNumber: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#333",
  },
  roomType: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  price: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#3949ab",
  },
  priceLabel: {
    fontSize: "0.7rem",
    color: "#666",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "2px solid #e0e0e0",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  featureTag: {
    background: "#e8f5e8",
    color: "#2e7d32",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "0.7rem",
    display: "inline-block",
    margin: "1px",
  },
  noFeatures: {
    color: "#666",
    fontSize: "0.8rem",
    fontStyle: "italic",
  },
  imageGallery: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  roomImage: {
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover",
    border: "1px solid #e0e0e0",
  },
  moreImages: {
    background: "#f5f5f5",
    color: "#666",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "500",
  },
  
  // Booking table styles
  bookingId: {
    fontSize: "0.8rem",
    fontWeight: "bold",
    color: "#666",
    fontFamily: "monospace",
  },
  roomInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  roomTypeSmall: {
    fontSize: "0.7rem",
    color: "#666",
  },
  guestInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  guestName: {
    fontWeight: "bold",
    color: "#333",
  },
  guestEmail: {
    fontSize: "0.8rem",
    color: "#666",
  },
  guestPhone: {
    fontSize: "0.7rem",
    color: "#888",
  },
  dateInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dateRange: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
  },
  guestsCount: {
    fontSize: "0.7rem",
    color: "#666",
  },
  amount: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#3949ab",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  
  actionButtons: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
  },
  confirmButton: {
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
  },
  cancelButton: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
  },
  checkinButton: {
    background: "#2196f3",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
  },
  checkoutButton: {
    background: "#ff9800",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
  },
  deleteButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  noActions: {
    color: "#999",
    fontSize: "0.8rem",
    fontStyle: "italic",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#666",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  emptyTitle: {
    fontSize: "1.2rem",
    margin: "0 0 10px 0",
    color: "#333",
  },
  emptyText: {
    fontSize: "0.9rem",
    margin: 0,
  },
};

// Add hover effects
Object.assign(styles.statCard, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
  }
});

Object.assign(styles.refreshButton, {
  ':hover': {
    background: "#1a237e",
    transform: "translateY(-1px)",
  }
});

Object.assign(styles.primaryButton, {
  ':hover': {
    background: "#1a237e",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.confirmButton, {
  ':hover': {
    background: "#45a049",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.cancelButton, {
  ':hover': {
    background: "#da190b",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.checkinButton, {
  ':hover': {
    background: "#1976d2",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.checkoutButton, {
  ':hover': {
    background: "#f57c00",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.deleteButton, {
  ':hover': {
    background: "#c82333",
    transform: "scale(1.05)",
  }
});

Object.assign(styles.fileLabel, {
  ':hover': {
    background: "#1a237e",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.tableRow, {
  ':hover': {
    backgroundColor: "#f8f9fa",
  }
});

export default RoomManagement;