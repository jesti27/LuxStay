import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    address: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Check password match
    if (name === "confirmPassword" || name === "password") {
      if (formData.password !== formData.confirmPassword && formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["", "#E74C3C", "#FF9F43", "#3498DB", "#2ECC71"];
    
    setPasswordStrength({
      label: strengthLabels[strength],
      color: strengthColors[strength],
      value: strength
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Registration failed");
      }

      alert("Registration successful! Please login to continue.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundAnimation}>
        <div style={styles.floatingShape1}></div>
        <div style={styles.floatingShape2}></div>
        <div style={styles.floatingShape3}></div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏨</span>
            <span style={styles.logoText}>LuxStay</span>
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join us for an exceptional stay experience</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Personal Information */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>👤 Personal Information</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>👤</span>
                  Full Name *
                </label>
                <input 
                  name="name" 
                  placeholder="Enter your full name" 
                  value={formData.name}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.name && styles.inputError)
                  }} 
                  required 
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📧</span>
                  Email Address *
                </label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.email && styles.inputError)
                  }} 
                  required 
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📅</span>
                  Date of Birth *
                </label>
                <input 
                  name="dob" 
                  type="date" 
                  value={formData.dob}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.dob && styles.inputError)
                  }} 
                  required 
                />
                {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>⚧</span>
                  Gender *
                </label>
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleChange} 
                  style={{
                    ...styles.select,
                    ...(errors.gender && styles.inputError)
                  }}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
              </div>
            </div>

            {/* Contact & Security */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>🔐 Security & Contact</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔒</span>
                  Password *
                </label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Create a password" 
                  value={formData.password}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.password && styles.inputError)
                  }} 
                  required 
                />
                {passwordStrength.label && (
                  <div style={styles.passwordStrength}>
                    <span>Strength: </span>
                    <span style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                      {passwordStrength.label}
                    </span>
                    <div style={styles.strengthMeter}>
                      <div style={{
                        width: `${(passwordStrength.value / 4) * 100}%`,
                        background: passwordStrength.color,
                        height: '4px',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔒</span>
                  Confirm Password *
                </label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.confirmPassword && styles.inputError)
                  }} 
                  required 
                />
                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📞</span>
                  Phone Number *
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  value={formData.phone}
                  onChange={handleChange} 
                  style={{
                    ...styles.input,
                    ...(errors.phone && styles.inputError)
                  }} 
                  required 
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏠</span>
                  Address *
                </label>
                <textarea 
                  name="address" 
                  placeholder="Enter your complete address" 
                  value={formData.address}
                  onChange={handleChange} 
                  rows="3"
                  style={{
                    ...styles.textarea,
                    ...(errors.address && styles.inputError)
                  }} 
                  required 
                />
                {errors.address && <span style={styles.errorText}>{errors.address}</span>}
              </div>
            </div>
          </div>

          <div style={styles.terms}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} required />
              I agree to the <button type="button" style={styles.inlineLink}>Terms of Service</button> and <button type="button" style={styles.inlineLink}>Privacy Policy</button>
            </label>
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading && styles.buttonLoading)
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.loadingSpinner}>⏳</span>
                Creating Account...
              </>
            ) : (
              <>
                <span style={styles.buttonIcon}></span>
                Create Account
              </>
            )}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <button 
            type="button"
            onClick={() => navigate("/login")} 
            style={styles.linkButton}
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Add CSS styles for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0FA3B1 0%, #B5E2FA 50%, #FF6B6B 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  backgroundAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 1,
  },
  floatingShape1: {
    position: "absolute",
    top: "15%",
    left: "5%",
    width: "80px",
    height: "80px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    animation: "float 6s ease-in-out infinite",
  },
  floatingShape2: {
    position: "absolute",
    top: "70%",
    right: "8%",
    width: "120px",
    height: "120px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "30%",
    animation: "float 8s ease-in-out infinite",
  },
  floatingShape3: {
    position: "absolute",
    bottom: "15%",
    left: "15%",
    width: "60px",
    height: "60px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "40%",
    animation: "float 7s ease-in-out infinite",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(15, 163, 177, 0.3)",
    width: "100%",
    maxWidth: "900px",
    zIndex: 2,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  logoIcon: {
    fontSize: "2.5rem",
  },
  logoText: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #0FA3B1 0%, #FF6B6B 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  title: {
    fontSize: "2.2rem",
    color: "#0B7A8A",
    marginBottom: "8px",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginBottom: "25px",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionTitle: {
    color: "#0B7A8A",
    fontSize: "1.3rem",
    marginBottom: "15px",
    borderBottom: "2px solid #0FA3B1",
    paddingBottom: "8px",
    fontWeight: "bold",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#0B7A8A",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  labelIcon: {
    fontSize: "1.1rem",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    background: "white",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    background: "white",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    background: "white",
  },
  inputError: {
    borderColor: "#E74C3C",
    background: "rgba(231, 76, 60, 0.05)",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  passwordStrength: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "0.8rem",
    color: "#666",
  },
  strengthMeter: {
    width: "100%",
    height: "4px",
    background: "#ECF0F1",
    borderRadius: "2px",
    overflow: "hidden",
  },
  terms: {
    marginBottom: "25px",
    padding: "15px",
    background: "rgba(181, 226, 250, 0.2)",
    borderRadius: "8px",
    border: "1px solid rgba(15, 163, 177, 0.1)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    color: "#666",
    fontSize: "0.9rem",
    cursor: "pointer",
    lineHeight: "1.4",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#0FA3B1",
    marginTop: "2px",
    flexShrink: 0,
  },
  inlineLink: {
    background: "none",
    border: "none",
    color: "#0FA3B1",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: 0,
  },
  button: {
    background: "linear-gradient(135deg, #0FA3B1 0%, #0B7A8A 100%)",
    color: "white",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "20px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 15px rgba(15, 163, 177, 0.3)",
  },
  buttonLoading: {
    background: "linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)",
    cursor: "not-allowed",
  },
  buttonIcon: {
    fontSize: "1.2rem",
  },
  loadingSpinner: {
    fontSize: "1.2rem",
    animation: "spin 1s linear infinite",
  },
  loginText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#666",
    fontSize: "0.95rem",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#0FA3B1",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
  },
};

export default Register;