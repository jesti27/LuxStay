import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Utils/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
  };

  const validateForm = () => {
    const newErrors = {};
    
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Invalid credentials");
      }

      const data = await response.json();
      
      // Store the token and user data in localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      
      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "user") {
        navigate("/userdashboard");
      } else {
        alert("Invalid role");
      }
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
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}></span>
              Email Address
            </label>
            <input 
              name="email" 
              type="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange} 
              required 
              style={{
                ...styles.input,
                ...(errors.email && styles.inputError)
              }} 
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}></span>
              Password
            </label>
            <input 
              name="password" 
              type="password" 
              placeholder="Enter your password" 
              value={formData.password}
              onChange={handleChange} 
              required 
              style={{
                ...styles.input,
                ...(errors.password && styles.inputError)
              }} 
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <div style={styles.rememberForgot}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              Remember me
            </label>
            <button type="button" style={styles.forgotLink}>
              Forgot password?
            </button>
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
                Signing in...
              </>
            ) : (
              <>
                <span style={styles.buttonIcon}></span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or continue with</span>
        </div>

        <div style={styles.socialButtons}>
          <button type="button" style={styles.socialButton}>
            <span style={styles.socialIcon}>🔵</span>
            Google
          </button>
          <button type="button" style={styles.socialButton}>
            <span style={styles.socialIcon}>🔵</span>
            Facebook
          </button>
        </div>
        
        <p style={styles.registerText}>
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={() => navigate("/register")} 
            style={styles.linkButton}
          >
            Create an account
          </button>
        </p>
      </div>

      <div style={styles.welcomeMessage}>
        <h3 style={styles.welcomeTitle}>Experience Luxury Stays</h3>
        <p style={styles.welcomeSubtitle}>
          Book your perfect room with premium amenities and exceptional service
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⭐</span>
            Premium Rooms
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔐</span>
            Secure Booking
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🎯</span>
            Best Prices
          </div>
        </div>
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
    top: "10%",
    left: "10%",
    width: "100px",
    height: "100px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    animation: "float 6s ease-in-out infinite",
  },
  floatingShape2: {
    position: "absolute",
    top: "60%",
    right: "10%",
    width: "150px",
    height: "150px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "30%",
    animation: "float 8s ease-in-out infinite",
  },
  floatingShape3: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: "80px",
    height: "80px",
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
    maxWidth: "450px",
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
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    color: "#0B7A8A",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  labelIcon: {
    fontSize: "1.1rem",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
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
    marginTop: "5px",
    display: "block",
  },
  rememberForgot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#666",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#0FA3B1",
  },
  forgotLink: {
    background: "none",
    border: "none",
    color: "#0FA3B1",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "underline",
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
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "25px 0",
    color: "#666",
  },
  dividerText: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "0 15px",
    fontSize: "0.9rem",
    position: "relative",
    zIndex: 1,
  },
  socialButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "25px",
  },
  socialButton: {
    background: "white",
    color: "#333",
    padding: "12px",
    border: "2px solid rgba(15, 163, 177, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  socialIcon: {
    fontSize: "1rem",
  },
  registerText: {
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
  welcomeMessage: {
    position: "absolute",
    right: "10%",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255, 255, 255, 0.9)",
    padding: "30px",
    borderRadius: "15px",
    maxWidth: "300px",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    zIndex: 2,
  },
  welcomeTitle: {
    color: "#0B7A8A",
    fontSize: "1.5rem",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  welcomeSubtitle: {
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    marginBottom: "20px",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#0B7A8A",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  featureIcon: {
    fontSize: "1rem",
  },
};

// Add hover effects using inline styles with conditionals
const buttonHoverStyle = {
  background: "linear-gradient(135deg, #0B7A8A 0%, #085C6B 100%)",
  transform: "translateY(-2px)",
  boxShadow: "0 6px 20px rgba(15, 163, 177, 0.4)",
};

const socialButtonHoverStyle = {
  borderColor: "#0FA3B1",
  transform: "translateY(-1px)",
  boxShadow: "0 4px 12px rgba(15, 163, 177, 0.1)",
};

export default Login;