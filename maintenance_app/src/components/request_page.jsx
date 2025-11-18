// src/components/request_page.jsx
import React, { useState, useEffect, useCallback } from "react";
import { fetchRequests as fetchRequestsApi, updateRequestStatus } from "./connect";
import RequestForm from "./request_form";

export default function RequestPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const isUser = user.user_role === 1;
  const [activeTab, setActiveTab] = useState(isUser ? "submit" : "requests");

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchRequestsApi(user);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    setActiveTab(user.user_role === 1 ? "submit" : "requests");
  }, [user.user_role]);

  const handleStatusChange = async (reqId, newStatus) => {
    setStatusLoading(true);
    try {
      await updateRequestStatus(reqId, newStatus);
      await loadRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Could not update status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
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
          <RequestForm user={user} onSuccess={loadRequests} />
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

    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: "50px auto", padding: 20 },
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
};
