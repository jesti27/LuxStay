import React from "react";
import { useNavigate } from "react-router-dom";

function HomeDashboard() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📚 Library Home Dashboard</h1>
      <p style={styles.subtitle}>Welcome to the Library System</p>
      <button onClick={handleLoginClick} style={styles.button}>Login</button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#e3f2fd",
  },
  title: {
    fontSize: "2.5rem",
    color: "#0d47a1",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#1565c0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default HomeDashboard;
