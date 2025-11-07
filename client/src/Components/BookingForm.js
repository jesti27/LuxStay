import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../Utils/api";

function BookingForm() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_address: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
    special_requests: '',
    payment_method: 'credit_card'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get user email from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email;
        setUserEmail(email);
        // Auto-fill the email in the form
        setFormData(prev => ({
          ...prev,
          guest_email: email
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/`);
      if (response.ok) {
        const data = await response.json();
        const selectedRoom = data.data.find(room => room.id === roomId);
        if (selectedRoom) {
          setRoom(selectedRoom);
        } else {
          alert('Room not found');
          navigate('/rooms');
        }
      } else {
        alert('Error fetching room details');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      alert('Error fetching room details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changing email if user is logged in
    if (name === 'guest_email' && userEmail) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Guest name is required';
    }
    
    // Email validation - if user is logged in, email is auto-filled and valid
    if (!userEmail) {
      if (!formData.guest_email.trim()) {
        newErrors.guest_email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.guest_email)) {
        newErrors.guest_email = 'Email is invalid';
      }
    }
    
    if (!formData.guest_phone.trim()) {
      newErrors.guest_phone = 'Phone number is required';
    }
    
    if (!formData.guest_address.trim()) {
      newErrors.guest_address = 'Address is required';
    }
    
    if (!formData.check_in_date) {
      newErrors.check_in_date = 'Check-in date is required';
    }
    
    if (!formData.check_out_date) {
      newErrors.check_out_date = 'Check-out date is required';
    } else if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        newErrors.check_in_date = 'Check-in date cannot be in the past';
      }
      
      if (checkOut <= checkIn) {
        newErrors.check_out_date = 'Check-out date must be after check-in date';
      }
    }
    
    if (!formData.total_guests || formData.total_guests < 1) {
      newErrors.total_guests = 'Number of guests must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (!room || !formData.check_in_date || !formData.check_out_date) return 0;
    
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return room.pricePerNight * nights;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        room_id: roomId,
        ...formData,
        total_amount: calculateTotalAmount()
      };

      const response = await fetch(`${API_BASE_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Booking created successfully!');
        navigate('/userdashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Error creating booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/rooms');
  };

  const totalNights = formData.check_in_date && formData.check_out_date 
    ? Math.ceil((new Date(formData.check_out_date) - new Date(formData.check_in_date)) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>
          <div>Loading room details...</div>
          <div style={styles.loadingSpinner}>⏳</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>Room not found</div>
        <button onClick={() => navigate('/rooms')} style={styles.backButton}>
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.bookingForm}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Book Room {room.roomNumber}</h1>
            <div style={styles.headerActions}>
              {userEmail && (
                <span style={styles.userInfo}>Logged in as: {userEmail}</span>
              )}
              <button onClick={handleCancel} style={styles.backButton}>
                ← Back to Rooms
              </button>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* Room Summary */}
          <div style={styles.roomSummary}>
            <h3 style={styles.summaryTitle}>Room Summary</h3>
            <div style={styles.roomDetails}>
              <div style={styles.roomImageContainer}>
                {room.images && room.images.length > 0 ? (
                  <img 
                    src={room.images[0]} 
                    alt={room.roomType}
                    style={styles.roomImage}
                  />
                ) : (
                  <div style={styles.noImage}>
                    <span>🏨 No Image</span>
                  </div>
                )}
                <div style={styles.roomTypeBadge}>
                  {room.roomType}
                </div>
              </div>
              <div style={styles.roomInfo}>
                <h4 style={styles.roomType}>{room.roomType} Room</h4>
                <p style={styles.roomNumber}>Room {room.roomNumber}</p>
                <p style={styles.price}>${room.pricePerNight} / night</p>
                <div style={styles.features}>
                  {room.specialFeatures && room.specialFeatures.slice(0, 3).map((feature, index) => (
                    <span key={index} style={styles.featureTag}>{feature}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              {/* Personal Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>👤 Personal Information</h3>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.guest_name && styles.inputError)
                    }}
                    placeholder="Enter your full name"
                  />
                  {errors.guest_name && <span style={styles.errorText}>{errors.guest_name}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Email Address *
                    {userEmail && <span style={styles.autoFillNote}> (auto-filled)</span>}
                  </label>
                  <input
                    type="email"
                    name="guest_email"
                    value={formData.guest_email}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.guest_email && styles.inputError),
                      ...(userEmail && styles.disabledInput)
                    }}
                    placeholder="Enter your email"
                    disabled={!!userEmail}
                    readOnly={!!userEmail}
                  />
                  {userEmail && (
                    <span style={styles.autoFillMessage}>
                      ✅ Using your account email
                    </span>
                  )}
                  {errors.guest_email && <span style={styles.errorText}>{errors.guest_email}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="guest_phone"
                    value={formData.guest_phone}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.guest_phone && styles.inputError)
                    }}
                    placeholder="Enter your phone number"
                  />
                  {errors.guest_phone && <span style={styles.errorText}>{errors.guest_phone}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Address *</label>
                  <textarea
                    name="guest_address"
                    value={formData.guest_address}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      ...styles.textarea,
                      ...(errors.guest_address && styles.inputError)
                    }}
                    placeholder="Enter your complete address"
                  />
                  {errors.guest_address && <span style={styles.errorText}>{errors.guest_address}</span>}
                </div>
              </div>

              {/* Booking Details */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>📅 Booking Details</h3>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Check-in Date *</label>
                  <input
                    type="date"
                    name="check_in_date"
                    value={formData.check_in_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      ...styles.input,
                      ...(errors.check_in_date && styles.inputError)
                    }}
                  />
                  {errors.check_in_date && <span style={styles.errorText}>{errors.check_in_date}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Check-out Date *</label>
                  <input
                    type="date"
                    name="check_out_date"
                    value={formData.check_out_date}
                    onChange={handleInputChange}
                    min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                    style={{
                      ...styles.input,
                      ...(errors.check_out_date && styles.inputError)
                    }}
                  />
                  {errors.check_out_date && <span style={styles.errorText}>{errors.check_out_date}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Number of Guests *</label>
                  <select
                    name="total_guests"
                    value={formData.total_guests}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Payment Method *</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="credit_card">💳 Credit Card</option>
                    <option value="debit_card">💳 Debit Card</option>
                    <option value="paypal">💰 PayPal</option>
                    <option value="cash">💵 Cash</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Special Requests</label>
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    rows="3"
                    style={styles.textarea}
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div style={styles.bookingSummary}>
              <h3 style={styles.summaryTitle}>💰 Booking Summary</h3>
              <div style={styles.summaryDetails}>
                <div style={styles.summaryRow}>
                  <span>Room Price:</span>
                  <span>${room.pricePerNight} / night</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Number of Nights:</span>
                  <span>{totalNights}</span>
                </div>
                {formData.check_in_date && formData.check_out_date && (
                  <div style={styles.summaryRow}>
                    <span>Dates:</span>
                    <span>
                      {new Date(formData.check_in_date).toLocaleDateString()} - {new Date(formData.check_out_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Amount:</span>
                  <span style={styles.totalAmount}>${calculateTotalAmount()}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? '⏳ Booking...' : `✅ Confirm Booking - $${calculateTotalAmount()}`}
              </button>
            </div>
          </form>
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
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)',
    gap: '20px',
  },
  error: {
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 'bold',
  },
  bookingForm: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(15, 163, 177, 0.3)',
    overflow: 'hidden',
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
  userInfo: {
    fontSize: '1rem',
    opacity: 0.9,
    fontWeight: '500',
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
  content: {
    padding: '30px',
  },
  roomSummary: {
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '25px',
    borderRadius: '16px',
    marginBottom: '30px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  summaryTitle: {
    color: '#0B7A8A',
    fontSize: '1.5rem',
    marginBottom: '20px',
    borderBottom: '3px solid #0FA3B1',
    paddingBottom: '12px',
    fontWeight: 'bold',
  },
  roomDetails: {
    display: 'flex',
    gap: '25px',
    alignItems: 'center',
  },
  roomImageContainer: {
    position: 'relative',
    width: '180px',
    height: '120px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
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
    color: '#0B7A8A',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  roomTypeBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(255, 107, 107, 0.9)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  roomInfo: {
    flex: 1,
  },
  roomType: {
    margin: '0 0 8px 0',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#0B7A8A',
  },
  roomNumber: {
    margin: '0 0 8px 0',
    color: '#666',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  price: {
    margin: '0 0 15px 0',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#0FA3B1',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  featureTag: {
    background: 'rgba(181, 226, 250, 0.3)',
    color: '#0B7A8A',
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid rgba(15, 163, 177, 0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '25px',
    borderRadius: '16px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  sectionTitle: {
    color: '#0B7A8A',
    fontSize: '1.4rem',
    marginBottom: '15px',
    borderBottom: '3px solid #0FA3B1',
    paddingBottom: '10px',
    fontWeight: 'bold',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    color: '#0B7A8A',
    fontSize: '1rem',
  },
  autoFillNote: {
    fontSize: '0.85rem',
    color: '#2ECC71',
    fontWeight: 'normal',
  },
  input: {
    padding: '14px',
    border: '2px solid rgba(15, 163, 177, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  disabledInput: {
    backgroundColor: 'rgba(181, 226, 250, 0.2)',
    color: '#666',
    cursor: 'not-allowed',
  },
  textarea: {
    padding: '14px',
    border: '2px solid rgba(15, 163, 177, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '90px',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  select: {
    padding: '14px',
    border: '2px solid rgba(15, 163, 177, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white',
    transition: 'all 0.3s ease',
  },
  inputError: {
    borderColor: '#E74C3C',
    background: 'rgba(231, 76, 60, 0.05)',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  autoFillMessage: {
    color: '#2ECC71',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  bookingSummary: {
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '25px',
    borderRadius: '16px',
    border: '1px solid rgba(15, 163, 177, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(15, 163, 177, 0.1)',
  },
  summaryDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(15, 163, 177, 0.1)',
    fontSize: '1rem',
    fontWeight: '500',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderTop: '2px solid #0FA3B1',
    marginTop: '12px',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#0B7A8A',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#0FA3B1',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '18px',
    paddingTop: '25px',
    borderTop: '1px solid rgba(15, 163, 177, 0.2)',
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(149, 165, 166, 0.2)',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)',
    minWidth: '250px',
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

Object.assign(styles.cancelButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #7F8C8D 0%, #6C7A7D 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(149, 165, 166, 0.3)',
  }
});

Object.assign(styles.submitButton, {
  ':hover': {
    background: 'linear-gradient(135deg, #27AE60 0%, #219653 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(46, 204, 113, 0.4)',
  }
});

Object.assign(styles.input, {
  ':focus': {
    borderColor: '#0FA3B1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 163, 177, 0.1)',
  }
});

Object.assign(styles.textarea, {
  ':focus': {
    borderColor: '#0FA3B1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 163, 177, 0.1)',
  }
});

Object.assign(styles.select, {
  ':focus': {
    borderColor: '#0FA3B1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 163, 177, 0.1)',
  }
});

Object.assign(styles.formSection, {
  ':hover': {
    boxShadow: '0 10px 30px rgba(15, 163, 177, 0.15)',
  }
});

Object.assign(styles.bookingSummary, {
  ':hover': {
    boxShadow: '0 10px 30px rgba(15, 163, 177, 0.15)',
  }
});

export default BookingForm;