import React, { useState } from "react";
import {supabase} from "./connect";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.select("*").from("users").eq("email", email).eq("password", password);

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      alert("Login success!");
      console.log(data);
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
                />

                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
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
  container: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 350,
    padding: 25,
    borderRadius: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    padding: 12,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    cursor: "pointer",
    marginTop: 10,
  },
};
