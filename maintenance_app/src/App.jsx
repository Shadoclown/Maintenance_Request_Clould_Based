import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./components/login_page";
import RequestPage from "./components/request_page";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null); // Clear logged-in user
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div style={styles.header}>
        <span>Welcome, {user.name}</span>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/request" />} />
        <Route path="/request" element={<RequestPage user={user} />} />
      </Routes>
    </Router>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
  },
  logoutButton: {
    padding: "6px 12px",
    backgroundColor: "#fff",
    color: "#007bff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
};
