import React, { useState } from "react";
import mockData from "./mockdata.json";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const user = mockData.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Login failed: wrong email or password");
    } else {
      alert("Login success!");
      onLogin(user); // send logged-in user to App.jsx
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f5f5f5", padding: 20 },
  card: { width: "100%", maxWidth: 350, padding: 25, borderRadius: 12, backgroundColor: "#fff", boxShadow: "0px 5px 15px rgba(0,0,0,0.15)" },
  title: { textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: 12, marginBottom: 15, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 },
  button: { padding: 12, backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontSize: 18, cursor: "pointer" }
};
