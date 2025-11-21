// src/components/admin_page.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./connect";
import RequestForm from "./request_form";
import ImageModal from "./image_modal";

export default function AdminPage({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchRequests();
  }, []);

  // Fetch roles (Technician, IT Support)
  const fetchRoles = async () => {
    const { data, error } = await supabase.from("role").select("*");
    if (error) console.error(error);
    else {
      const filteredRoles = data.filter((role) => {
        const name = role.role_name?.toLowerCase();
        return name !== "user" && name !== "admin";
      });
      setRoles(filteredRoles);
    }
  };

  // Fetch all requests
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("request")
      .select("*, created_by(*)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setRequests(data);
  };

  const handleAssignRole = async (reqId, selectedRoleId) => {
    setLoading(true);
    const roleId = selectedRoleId === "" ? null : Number(selectedRoleId);
    const { error } = await supabase
      .from("request")
      .update({ request_role: roleId })
      .eq("request_id", reqId);

    if (error) {
      console.error(error);
    } else {
      await fetchRequests();
    }
    setLoading(false);
  };

  const handleStatusChange = async (reqId, status) => {
    setLoading(true);
    const { error } = await supabase
      .from("request")
      .update({ status })
      .eq("request_id", reqId);

    if (error) {
      console.error(error);
    } else {
      await fetchRequests();
    }
    setLoading(false);
  };

  const tabs = [
    { id: "requests", label: "Requests" },
    { id: "submit", label: "Submit Request" },
  ];

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
          <RequestForm user={user} onSuccess={fetchRequests} />
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
                <p><strong>Created By:</strong> {req.created_by.user_email}</p>
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
                {Array.isArray(req.image_urls) && req.image_urls.length > 0 && (
                  <div style={styles.requestImagesContainer}>
                    <strong>Images:</strong>
                    <div style={styles.requestImagesGrid}>
                      {req.image_urls.map((url) => (
                        <button
                          key={url}
                          type="button"
                          style={styles.imageButton}
                          onClick={() => setActiveImage(url)}
                        >
                          <img src={url} alt="Request attachment" style={styles.requestImage} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

      <ImageModal imageUrl={activeImage} onClose={() => setActiveImage(null)} />
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "50px auto", padding: 20 },
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
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 8,
    border: "2px solid #ddd",
    cursor: "pointer",
  },
};
