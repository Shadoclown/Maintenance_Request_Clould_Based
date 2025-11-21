// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login_page";
import RequestPage from "./components/request_page";
import AdminPage from "./components/admin_page";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  // If not logged in, show login page
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <Routes>
        {/* Redirect based on role */}
        <Route
          path="/"
          element={
            user.user_role === 4 ? ( // Assuming role_id 4 = Admin
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/request" />
            )
          }
        />

        {/* Request form and requests page for users and support roles */}
        <Route
          path="/request"
          element={
            user.user_role === 4 ? <Navigate to="/admin" replace /> : <RequestPage user={user} onLogout={handleLogout} />
          }
        />

        {/* Admin page */}
        <Route
          path="/admin"
          element={user.user_role === 4 ? <AdminPage user={user} onLogout={handleLogout} /> : <Navigate to="/request" />}
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
