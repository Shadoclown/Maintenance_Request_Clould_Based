// src/components/request_page.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./connect";
import RequestForm from "./request_form";
import ImageModal from "./image_modal";

export default function RequestPage({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const isUser = user.user_role === 1;
  const [activeTab, setActiveTab] = useState(isUser ? "submit" : "requests");
  const [activeImage, setActiveImage] = useState(null);

  const fetchRequests = useCallback(async () => {
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
  }, [user.user_id, user.user_role]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setActiveTab(user.user_role === 1 ? "submit" : "requests");
  }, [user.user_role]);

  const handleStatusChange = async (reqId, newStatus) => {
    setStatusLoading(true);
    const { error } = await supabase
      .from("request")
      .update({ status: newStatus })
      .eq("request_id", reqId);

    if (error) console.error(error);
    else fetchRequests();
    setStatusLoading(false);
  };

  const tabs = isUser
    ? [
        { id: "submit", label: "Submit Request" },
        { id: "requests", label: "My Requests" },
      ]
    : [
        { id: "requests", label: "Requests" },
        { id: "submit", label: "Submit Request" },
      ];

  const requestsTitle = isUser
    ? "Request History"
    : user.user_role === 2 || user.user_role === 3
    ? "Assigned Requests"
    : "Requests";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          type="button"
          onClick={onLogout}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={activeTab === tab.id ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "submit" && (
        <div style={styles.card}>
          <h2 style={styles.title}>Submit Request</h2>
          <RequestForm user={user} onSuccess={fetchRequests} />
        </div>
      )}

      {activeTab === "requests" && (
        <div style={styles.card}>
          <h2 style={styles.title}>{requestsTitle}</h2>
          {requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req.request_id} style={styles.requestCard}>
                <strong>{req.title}</strong>
                <p>{req.description}</p>
                {req.location && (
                  <p>
                    <strong>Location:</strong> {req.location}
                  </p>
                )}
                <p>Status: {req.status}</p>

                {req.image_urls && req.image_urls.length > 0 && (
                  <div style={styles.requestImagesContainer}>
                    <strong>Images:</strong>
                    <div style={styles.requestImagesGrid}>
                      {req.image_urls.map((url, index) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActiveImage(url)}
                          style={styles.imageButton}
                        >
                          <img src={url} alt={`Request ${index + 1}`} style={styles.requestImage} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(user.user_role === 2 || user.user_role === 3 || user.user_role === 4) && (
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                    disabled={statusLoading}
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
      )}

      <ImageModal imageUrl={activeImage} onClose={() => setActiveImage(null)} />
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: "50px auto", padding: 20 },
  header: { marginBottom: 20 },
  backButton: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    transition: "background-color 0.2s, border-color 0.2s",
  },
  tabsContainer: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  tabButton: {
    padding: "10px 18px",
    borderRadius: 999,
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#333",
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
  },
  tabButtonActive: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff",
  },
  card: {
    padding: 20,
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: "#fff",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.15)",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  requestCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
  },
  requestImagesContainer: {
    marginTop: 10,
  },
  requestImagesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  imageButton: {
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  requestImage: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
    border: "2px solid #ddd",
    cursor: "pointer",
  },
};
