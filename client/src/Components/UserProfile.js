import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";

function UserProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage and token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        name: localStorage.getItem("userName") || payload.name,
        email: payload.email,
        role: localStorage.getItem("userRole") || payload.role,
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, City, State 12345",
        dateOfBirth: "1990-01-01",
        joinDate: "2024-01-15",
        lastLogin: new Date().toISOString()
      };
      setUserData(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const handleBackToDashboard = () => {
    navigate("/userdashboard");
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    // Simulate API call to update profile
    setUserData(prev => ({
      ...prev,
      ...formData
    }));
    localStorage.setItem("userName", formData.name);
    setEditMode(false);
    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      dateOfBirth: userData.dateOfBirth
    });
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading your profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.dashboard,
        filter: sidebarOpen ? 'blur(5px)' : 'none',
        transition: 'filter 0.3s ease'
      }}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>User Profile</h1>
            <div style={styles.headerActions}>
              <span style={styles.welcomeText}>Hello, {userData?.name}!</span>
              
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

              <button onClick={handleBackToDashboard} style={styles.backButton}>
                ← Dashboard
              </button>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* Profile Header */}
          <div style={styles.profileHeader}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.avatarInfo}>
                <h2 style={styles.userName}>{userData?.name}</h2>
                <p style={styles.userEmail}>{userData?.email}</p>
                <div style={styles.userStats}>
                  <span style={styles.stat}>
                    <strong>Member since:</strong> {formatDate(userData?.joinDate)}
                  </span>
                  <span style={styles.stat}>
                    <strong>Last login:</strong> {formatDate(userData?.lastLogin)}
                  </span>
                </div>
              </div>
            </div>
            <div style={styles.profileActions}>
              {!editMode ? (
                <button onClick={handleEditProfile} style={styles.editButton}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <div style={styles.editActions}>
                  <button onClick={handleSaveProfile} style={styles.saveButton}>
                    💾 Save Changes
                  </button>
                  <button onClick={handleCancelEdit} style={styles.cancelButton}>
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "profile" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("profile")}
            >
              👤 Personal Info
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "security" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("security")}
            >
              🔒 Security
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === "preferences" ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab("preferences")}
            >
              ⚙️ Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === "profile" && (
              <div style={styles.profileSection}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div style={styles.displayValue}>{userData?.name}</div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div style={styles.displayValue}>{userData?.email}</div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div style={styles.displayValue}>{userData?.phone}</div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    ) : (
                      <div style={styles.displayValue}>{formatDate(userData?.dateOfBirth)}</div>
                    )}
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Address</label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        style={styles.textarea}
                        placeholder="Enter your address"
                        rows="3"
                      />
                    ) : (
                      <div style={styles.displayValue}>{userData?.address}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={styles.securitySection}>
                <h3 style={styles.sectionTitle}>Security Settings</h3>
                
                <div style={styles.securityGrid}>
                  <div style={styles.securityCard}>
                    <div style={styles.securityIcon}>🔑</div>
                    <div style={styles.securityContent}>
                      <h4 style={styles.securityTitle}>Change Password</h4>
                      <p style={styles.securityDescription}>
                        Update your password regularly to keep your account secure.
                      </p>
                      <button style={styles.securityButton}>
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div style={styles.securityCard}>
                    <div style={styles.securityIcon}>📱</div>
                    <div style={styles.securityContent}>
                      <h4 style={styles.securityTitle}>Two-Factor Authentication</h4>
                      <p style={styles.securityDescription}>
                        Add an extra layer of security to your account.
                      </p>
                      <button style={styles.securityButton}>
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div style={styles.securityCard}>
                    <div style={styles.securityIcon}>📧</div>
                    <div style={styles.securityContent}>
                      <h4 style={styles.securityTitle}>Email Notifications</h4>
                      <p style={styles.securityDescription}>
                        Manage your email notification preferences.
                      </p>
                      <button style={styles.securityButton}>
                        Configure
                      </button>
                    </div>
                  </div>

                  <div style={styles.securityCard}>
                    <div style={styles.securityIcon}>🔍</div>
                    <div style={styles.securityContent}>
                      <h4 style={styles.securityTitle}>Login Activity</h4>
                      <p style={styles.securityDescription}>
                        Review your recent login history and devices.
                      </p>
                      <button style={styles.securityButton}>
                        View Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div style={styles.preferencesSection}>
                <h3 style={styles.sectionTitle}>Account Preferences</h3>
                
                <div style={styles.preferencesGrid}>
                  <div style={styles.preferenceCard}>
                    <h4 style={styles.preferenceTitle}>Notification Settings</h4>
                    <div style={styles.preferenceOptions}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" defaultChecked style={styles.checkbox} />
                        Email notifications
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" defaultChecked style={styles.checkbox} />
                        SMS notifications
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" style={styles.checkbox} />
                        Push notifications
                      </label>
                    </div>
                  </div>

                  <div style={styles.preferenceCard}>
                    <h4 style={styles.preferenceTitle}>Privacy Settings</h4>
                    <div style={styles.preferenceOptions}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" defaultChecked style={styles.checkbox} />
                        Show profile to other users
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" style={styles.checkbox} />
                        Allow marketing emails
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" defaultChecked style={styles.checkbox} />
                        Data sharing for analytics
                      </label>
                    </div>
                  </div>

                  <div style={styles.preferenceCard}>
                    <h4 style={styles.preferenceTitle}>Language & Region</h4>
                    <div style={styles.preferenceOptions}>
                      <div style={styles.selectGroup}>
                        <label style={styles.label}>Language</label>
                        <select style={styles.select}>
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div style={styles.selectGroup}>
                        <label style={styles.label}>Time Zone</label>
                        <select style={styles.select}>
                          <option>UTC-05:00 Eastern Time</option>
                          <option>UTC-06:00 Central Time</option>
                          <option>UTC-07:00 Mountain Time</option>
                          <option>UTC-08:00 Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={styles.preferenceCard}>
                    <h4 style={styles.preferenceTitle}>Account Management</h4>
                    <div style={styles.preferenceActions}>
                      <button style={styles.dangerButton}>
                        🗑️ Delete Account
                      </button>
                      <button style={styles.warningButton}>
                        ⏸️ Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={closeSidebar}>
          <div style={styles.overlayBackground}></div>
        </div>
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
              style={styles.sidebarButton}
              onClick={() => navigate("/userbooking")}
            >
              📋 My Bookings
            </button>
            <button 
              style={{
                ...styles.sidebarButton,
                background: "rgba(255, 107, 107, 0.2)",
                color: "#0B7A8A",
                borderColor: "#FF6B6B"
              }}
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
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)",
    padding: "20px",
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
    maxWidth: "1200px",
    margin: "0 auto",
    background: "rgba(255, 255, 255, 0.95)",
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
    color: "rgba(255, 255, 255, 0.9)",
  },
  backButton: {
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
    position: "relative",
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
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
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
  
  // Content Styles
  content: {
    padding: "30px",
  },
  
  // Profile Header
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "30px",
    background: "linear-gradient(135deg, #B5E2FA 0%, #FDE2FF 100%)",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0FA3B1 0%, #FF6B6B 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "2.5rem",
    fontWeight: "bold",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    margin: "0 0 8px 0",
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0B7A8A",
  },
  userEmail: {
    margin: "0 0 15px 0",
    color: "#666",
    fontSize: "1.2rem",
  },
  userStats: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
  },
  stat: {
    fontSize: "0.95rem",
    color: "#666",
    fontWeight: "500",
  },
  profileActions: {
    display: "flex",
    gap: "12px",
  },
  editButton: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  editActions: {
    display: "flex",
    gap: "12px",
  },
  saveButton: {
    background: "linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
  },
  cancelButton: {
    background: "linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(149, 165, 166, 0.3)",
  },
  
  // Tab Navigation
  tabContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
    borderBottom: "2px solid rgba(15, 163, 177, 0.2)",
    paddingBottom: "12px",
  },
  tab: {
    background: "rgba(181, 226, 250, 0.3)",
    border: "1px solid rgba(15, 163, 177, 0.2)",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.05rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    color: "#666",
    backdropFilter: "blur(10px)",
  },
  activeTab: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  
  // Tab Content
  tabContent: {
    marginBottom: "30px",
  },
  sectionTitle: {
    color: "#0B7A8A",
    fontSize: "1.6rem",
    marginBottom: "25px",
    borderBottom: "3px solid #0FA3B1",
    paddingBottom: "12px",
    fontWeight: "bold",
  },
  
  // Profile Form
  profileSection: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  formGroupFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontWeight: "bold",
    color: "#0B7A8A",
    fontSize: "1rem",
  },
  input: {
    padding: "14px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "white",
  },
  textarea: {
    padding: "14px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    resize: "vertical",
    minHeight: "90px",
    background: "white",
  },
  displayValue: {
    padding: "14px",
    background: "rgba(181, 226, 250, 0.2)",
    border: "2px solid rgba(15, 163, 177, 0.1)",
    borderRadius: "8px",
    fontSize: "1rem",
    color: "#333",
    fontWeight: "500",
  },
  
  // Security Section
  securitySection: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  securityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  securityCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
  },
  securityIcon: {
    fontSize: "2.2rem",
    marginTop: "5px",
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    margin: "0 0 10px 0",
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#0B7A8A",
  },
  securityDescription: {
    margin: "0 0 18px 0",
    color: "#666",
    fontSize: "1rem",
    lineHeight: "1.5",
  },
  securityButton: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.2)",
  },
  
  // Preferences Section
  preferencesSection: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.1)",
  },
  preferencesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  preferenceCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid rgba(15, 163, 177, 0.15)",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.08)",
  },
  preferenceTitle: {
    margin: "0 0 18px 0",
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#0B7A8A",
  },
  preferenceOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#333",
    fontWeight: "500",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    accentColor: "#0FA3B1",
  },
  selectGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  select: {
    padding: "12px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    borderRadius: "8px",
    fontSize: "1rem",
    background: "white",
    color: "#333",
  },
  preferenceActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  dangerButton: {
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.2)",
  },
  warningButton: {
    background: "linear-gradient(135deg, #FFA726 0%, #FF9800 100%)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(255, 167, 38, 0.2)",
  },
};

// Add hover effects
Object.assign(styles.backButton, {
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

Object.assign(styles.editButton, {
  ':hover': {
    background: "linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
  }
});

Object.assign(styles.saveButton, {
  ':hover': {
    background: "linear-gradient(135deg, #27AE60 0%, #219653 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(46, 204, 113, 0.4)",
  }
});

Object.assign(styles.cancelButton, {
  ':hover': {
    background: "linear-gradient(135deg, #7F8C8D 0%, #6C7A7D 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(149, 165, 166, 0.4)",
  }
});

Object.assign(styles.tab, {
  ':hover': {
    background: "rgba(181, 226, 250, 0.5)",
    color: "#0B7A8A",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.securityButton, {
  ':hover': {
    background: "linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(15, 163, 177, 0.3)",
  }
});

Object.assign(styles.securityCard, {
  ':hover': {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 25px rgba(15, 163, 177, 0.15)",
    borderColor: "rgba(15, 163, 177, 0.3)",
  }
});

Object.assign(styles.input, {
  ':focus': {
    borderColor: "#0FA3B1",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(15, 163, 177, 0.1)",
  }
});

Object.assign(styles.textarea, {
  ':focus': {
    borderColor: "#0FA3B1",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(15, 163, 177, 0.1)",
  }
});

Object.assign(styles.dangerButton, {
  ':hover': {
    background: "linear-gradient(135deg, #FF5252 0%, #E53935 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
  }
});

Object.assign(styles.warningButton, {
  ':hover': {
    background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 167, 38, 0.4)",
  }
});

Object.assign(styles.select, {
  ':focus': {
    borderColor: "#0FA3B1",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(15, 163, 177, 0.1)",
  }
});

export default UserProfile;