import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login_page";
import RequestPage from "./components/request_page";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/request" />} />
        <Route path="/request" element={<RequestPage user={user} />} />
      </Routes>
    </Router>
  );
}
