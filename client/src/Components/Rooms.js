import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../Utils/api";

function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    roomType: '',
    minPrice: '',
    maxPrice: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, filters]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/available`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data);
        setFilteredRooms(data.data);
      } else {
        alert('Error fetching rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (filters.roomType) {
      filtered = filtered.filter(room => 
        room.roomType.toLowerCase().includes(filters.roomType.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(room => 
        room.pricePerNight >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(room => 
        room.pricePerNight <= parseFloat(filters.maxPrice)
      );
    }

    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(room => room.status === filters.status);
    }

    setFilteredRooms(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookNow = (roomId) => {
    navigate(`/book-room/${roomId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/userdashboard');
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

  const clearFilters = () => {
    setFilters({
      roomType: '',
      minPrice: '',
      maxPrice: '',
      status: 'Available'
    });
  };

  const getRoomTypeColor = (roomType) => {
    const colorMap = {
      'deluxe': '#FF6B6B',
      'suite': '#0FA3B1',
      'standard': '#2ECC71',
      'family': '#9B59B6',
      'executive': '#FF9F43',
      'luxury': '#3498DB',
      'presidential': '#E74C3C'
    };
    return colorMap[roomType.toLowerCase()] || '#0FA3B1';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>
          <div>Loading available rooms...</div>
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
              {localStorage.getItem("userName")?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{localStorage.getItem("userName") || 'User'}</div>
              <div style={styles.userEmail}>{localStorage.getItem("userEmail") || 'user@example.com'}</div>
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
              style={{
                ...styles.sidebarButton,
                background: "rgba(255, 107, 107, 0.2)",
                color: "#0B7A8A",
                borderColor: "#FF6B6B"
              }}
            >
              🏨 Available Rooms
            </button>
            <button 
              style={styles.sidebarButton}
              onClick={() => navigate("/userbooking")}
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
            <h1 style={styles.title}>Available Rooms</h1>
            <div style={styles.headerActions}>
              <span style={styles.welcomeText}>
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
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
          {/* Filters Section */}
          <div style={styles.filtersCard}>
            <h3 style={styles.filtersTitle}>Filter Rooms</h3>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Room Type</label>
                <input
                  type="text"
                  name="roomType"
                  value={filters.roomType}
                  onChange={handleFilterChange}
                  placeholder="e.g., Deluxe, Suite"
                  style={styles.filterInput}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Min Price ($)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  style={styles.filterInput}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Max Price ($)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="1000"
                  style={styles.filterInput}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  style={styles.filterSelect}
                >
                  <option value="Available">Available</option>
                  <option value="All">All Rooms</option>
                </select>
              </div>
            </div>
            
            <div style={styles.filterActions}>
              <button onClick={clearFilters} style={styles.clearButton}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>🏨</div>
              <h3 style={styles.emptyStateTitle}>No rooms found</h3>
              <p style={styles.emptyStateText}>Try adjusting your filters or check back later for new availability.</p>
              <button onClick={clearFilters} style={styles.clearButton}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={styles.roomsGrid}>
              {filteredRooms.map((room) => (
                <div key={room.id} style={styles.roomCard}>
                  {/* Room Images */}
                  <div style={styles.imageSection}>
                    {room.images && room.images.length > 0 ? (
                      <img 
                        src={room.images[0]} 
                        alt={room.roomType}
                        style={styles.roomImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      ...styles.noImage,
                      display: (!room.images || room.images.length === 0) ? 'flex' : 'none'
                    }}>
                      <span style={styles.noImageText}>🏨 No Image</span>
                    </div>
                    <div style={{
                      ...styles.roomBadge,
                      backgroundColor: getRoomTypeColor(room.roomType)
                    }}>
                      {room.roomType}
                    </div>
                    <div style={styles.priceOverlay}>
                      ${room.pricePerNight}<span style={styles.priceUnit}>/night</span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div style={styles.roomContent}>
                    <div style={styles.roomHeader}>
                      <h3 style={styles.roomTitle}>Room {room.roomNumber}</h3>
                      <span style={{
                        ...styles.statusBadge,
                        ...(room.status === 'Available' ? styles.statusAvailable : styles.statusOccupied)
                      }}>
                        {room.status}
                      </span>
                    </div>

                    <div style={styles.roomDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Type:</span>
                        <span style={styles.detailValue}>{room.roomType}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Capacity:</span>
                        <span style={styles.detailValue}>{room.capacity || '2'} guests</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Features:</span>
                        <span style={styles.detailValue}>
                          {room.specialFeatures && room.specialFeatures.slice(0, 2).join(', ')}
                          {room.specialFeatures && room.specialFeatures.length > 2 && '...'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.roomActions}>
                      <button
                        onClick={() => handleBookNow(room.id)}
                        disabled={room.status !== 'Available'}
                        style={{
                          ...styles.bookButton,
                          ...(room.status !== 'Available' ? styles.disabledButton : {})
                        }}
                      >
                        {room.status === 'Available' ? 'Book Now' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>Quick Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>🏨</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{rooms.length}</div>
                  <div style={styles.statLabel}>Total Rooms</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>
                    {rooms.filter(room => room.status === 'Available').length}
                  </div>
                  <div style={styles.statLabel}>Available Now</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>
                    {rooms.length > 0 ? 
                      `$${Math.min(...rooms.map(room => room.pricePerNight)).toFixed(0)}` 
                      : '$0'
                    }
                  </div>
                  <div style={styles.statLabel}>From Price</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}>🎯</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>
                    {rooms.length > 0 ? 
                      [...new Set(rooms.map(room => room.roomType))].length 
                      : 0
                    }
                  </div>
                  <div style={styles.statLabel}>Room Types</div>
                </div>
              </div>
            </div>
          </div>
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
    maxWidth: '1200px',
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
  filtersCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '30px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  filtersTitle: {
    color: '#0B7A8A',
    fontSize: '1.5rem',
    marginBottom: '25px',
    borderBottom: '3px solid #0FA3B1',
    paddingBottom: '12px',
    fontWeight: 'bold',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '25px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterLabel: {
    fontWeight: 'bold',
    color: '#0B7A8A',
    fontSize: '1rem',
  },
  filterInput: {
    padding: '12px',
    border: '2px solid rgba(15, 163, 177, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  filterSelect: {
    padding: '12px',
    border: '2px solid rgba(15, 163, 177, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white',
    transition: 'all 0.3s ease',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  clearButton: {
    background: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(149, 165, 166, 0.2)',
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
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  roomCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  imageSection: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #B5E2FA 0%, #FDE2FF 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#0B7A8A',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  roomBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#0FA3B1',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  priceUnit: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: 'normal',
  },
  roomContent: {
    padding: '25px',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  roomTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#0B7A8A',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  statusAvailable: {
    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    color: 'white',
  },
  statusOccupied: {
    background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    color: 'white',
  },
  roomDetails: {
    marginBottom: '25px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(15, 163, 177, 0.1)',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#0B7A8A',
    fontSize: '0.95rem',
  },
  detailValue: {
    color: '#333',
    fontSize: '0.95rem',
    textAlign: 'right',
    fontWeight: '500',
  },
  roomActions: {
    display: 'flex',
    gap: '12px',
  },
  bookButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(15, 163, 177, 0.3)',
  },
  disabledButton: {
    background: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  statsCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  statsTitle: {
    color: '#0B7A8A',
    fontSize: '1.5rem',
    marginBottom: '25px',
    borderBottom: '3px solid #0FA3B1',
    paddingBottom: '12px',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '25px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    boxShadow: '0 4px 15px rgba(15, 163, 177, 0.08)',
  },
  statIcon: {
    fontSize: '2rem',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#0FA3B1',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#666',
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

Object.assign(styles.clearButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #7F8C8D 0%, #6C7A7D 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(149, 165, 166, 0.3)',
  }
});

Object.assign(styles.roomCard, {
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(15, 163, 177, 0.2)',
    borderColor: 'rgba(15, 163, 177, 0.3)',
  }
});

Object.assign(styles.bookButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(15, 163, 177, 0.4)',
  }
});

Object.assign(styles.filterInput, {
  ':focus': {
    borderColor: '#0FA3B1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 163, 177, 0.1)',
  }
});

Object.assign(styles.filterSelect, {
  ':focus': {
    borderColor: '#0FA3B1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 163, 177, 0.1)',
  }
});

Object.assign(styles.statItem, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(15, 163, 177, 0.15)',
  }
});

export default Rooms;