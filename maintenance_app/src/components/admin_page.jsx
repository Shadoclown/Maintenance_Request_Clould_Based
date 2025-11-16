// src/components/admin_page.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./connect";

export default function AdminPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchRequests();
  }, []);

  // Fetch roles (Technician, IT Support)
  const fetchRoles = async () => {
    const { data, error } = await supabase.from("role").select("*");
    if (error) console.error(error);
    else setRoles(data);
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

  const handleAssignRole = async (reqId, roleId) => {
    setLoading(true);
    const { error } = await supabase
      .from("request")
      .update({ request_role: roleId })
      .eq("request_id", reqId);

    if (error) console.error(error);
    else fetchRequests();
    setLoading(false);
  };

  const handleStatusChange = async (reqId, status) => {
    setLoading(true);
    const { error } = await supabase
      .from("request")
      .update({ status })
      .eq("request_id", reqId);

    if (error) console.error(error);
    else fetchRequests();
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Panel: Assign Requests</h2>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests.map((req) => (
          <div key={req.request_id} style={styles.requestCard}>
            <p><strong>Title:</strong> {req.title}</p>
            <p><strong>Description:</strong> {req.description}</p>
            <p><strong>Created By:</strong> {req.created_by.user_email}</p>
            <p>
              <strong>Assigned Role:</strong>{" "}
              <select
                value={req.request_role || ""}
                onChange={(e) => handleAssignRole(req.request_id, Number(e.target.value))}
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
  );
}

const styles = {
  container: { maxWidth: 700, margin: "50px auto", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  requestCard: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
  },
};
