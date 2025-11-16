// src/components/request_page.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./connect";

export default function RequestPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    let query = supabase.from("request").select("*");

    // Role-based filtering
    if (user.user_role === 1) {
      query = query.eq("created_by", user.user_id); // normal user sees own requests
    } else if (user.user_role === 2 || user.user_role === 3) {
      query = query.eq("request_role", user.user_role); // technician/IT sees assigned
    } else if (user.user_role === 4) {
      query = query; // admin sees all requests
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) console.error(error);
    else setRequests(data);
  };

  const handleStatusChange = async (reqId, newStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from("request")
      .update({ status: newStatus })
      .eq("request_id", reqId);

    if (error) console.error(error);
    else fetchRequests();
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    const { error } = await supabase.from("request").insert([
      {
        title,
        description,
        request_role: null, // admin can assign later
        status: "Pending",
        created_by: user.user_id,
      },
    ]);

    if (error) console.error(error);
    else {
      setTitle("");
      setDescription("");
      fetchRequests();
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {user.user_role === 1 && (
        <div style={styles.card}>
          <h2 style={styles.title}>Submit Request</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...styles.input, height: 100, resize: "none" }}
              required
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.title}>Requests</h2>
        {requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          requests.map((req) => (
            <div key={req.request_id} style={styles.requestCard}>
              <strong>{req.title}</strong>
              <p>{req.description}</p>
              <p>Status: {req.status}</p>
              {(user.user_role === 2 || user.user_role === 3 || user.user_role === 4) && (
                <select
                  value={req.status}
                  onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                  disabled={loading}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: "50px auto", padding: 20 },
  card: {
    padding: 20,
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: "#fff",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.15)",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: 12, marginBottom: 15, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 },
  button: { padding: 12, backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" },
  requestCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
  },
};
