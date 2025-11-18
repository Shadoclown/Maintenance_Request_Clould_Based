// src/components/admin_page.jsx
import React, { useState, useEffect } from "react";
import {
  fetchRoles,
  fetchRequests as fetchRequestsApi,
  updateRequestRole,
  updateRequestStatus,
} from "./connect";
import RequestForm from "./request_form";

export default function AdminPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    loadRoles();
    loadRequests();
  }, []);

  // Fetch roles (Technician, IT Support)
  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      const filteredRoles = (Array.isArray(data) ? data : []).filter((role) => {
        const name = role.role_name?.toLowerCase();
        return name !== "user" && name !== "admin";
      });
      setRoles(filteredRoles);
    } catch (err) {
      console.error("Failed to load roles", err);
    }
  };

  // Fetch all requests
  const loadRequests = async () => {
    try {
      const data = await fetchRequestsApi(user);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const handleAssignRole = async (reqId, selectedRoleId) => {
    setLoading(true);
    try {
      const roleId = selectedRoleId === "" ? null : Number(selectedRoleId);
      await updateRequestRole(reqId, roleId);
      await loadRequests();
    } catch (err) {
      console.error("Failed to assign role", err);
      alert("Could not assign role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reqId, status) => {
    setLoading(true);
    try {
      await updateRequestStatus(reqId, status);
      await loadRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Could not update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "requests", label: "Requests" },
    { id: "submit", label: "Submit Request" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Panel: Assign Requests</h2>

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
          <h3 style={styles.cardTitle}>Submit Request</h3>
          <RequestForm user={user} onSuccess={loadRequests} />
        </div>
      )}

      {activeTab === "requests" && (
        <div style={styles.card}>
          {requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req.request_id} style={styles.requestCard}>
                <p><strong>Title:</strong> {req.title}</p>
                <p><strong>Description:</strong> {req.description}</p>
                <p><strong>Created By:</strong> {req.created_by?.user_email || "Unknown user"}</p>
                {req.location && (
                  <p><strong>Location:</strong> {req.location}</p>
                )}
                <p>
                  <strong>Assigned Role:</strong>{" "}
                  <select
                    value={req.request_role ?? ""}
                    onChange={(e) => handleAssignRole(req.request_id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Unassigned</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "50px auto", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
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
  cardTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 18 },
  requestCard: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
  },
};
