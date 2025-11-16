import React, { useState, useEffect } from "react";
import mockData from "./mockdata.json";

export default function RequestPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0,16));

  useEffect(() => {
    if (user) setRequests(mockData.requests);
  }, [user]);

  if (!user) return <div>Loading...</div>;

  // Role-based visible requests
  let visibleRequests = [];
  if (user.role === "user") {
    visibleRequests = requests.filter(r => r.user_id === user.id);
  } else {
    visibleRequests = requests.filter(r => r.assignedTo === user.id);
  }

  // Status colors
  const statusColors = { "Pending": "#f0ad4e", "In Progress": "#5bc0de", "Completed": "#5cb85c" };

  // Handle new request (for user)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return alert("Title and description required");

    const newRequest = {
      id: requests.length + 1,
      title,
      description,
      date_time: dateTime,
      attachments: [],
      status: "Pending",
      user_id: user.id,
      assignedTo: "tech1" // auto-assign for mock
    };

    setRequests([newRequest, ...requests]);
    setTitle(""); setDescription(""); setDateTime(new Date().toISOString().slice(0,16));
  };

  // Handle status change (for technician / IT support)
  const handleStatusChange = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div style={styles.container}>
      {user.role === "user" && (
        <div style={styles.card}>
          <h2 style={styles.title}>Submit Request</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{...styles.input, height:100}} required />
            <label>Date and Time (optional):</label>
            <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} style={styles.input} />
            <button type="submit" style={styles.button}>Submit Request</button>
          </form>
        </div>
      )}

      <h2 style={{textAlign:"center"}}>{user.role === "user" ? "My Requests" : "Assigned Requests"}</h2>

      {visibleRequests.length > 0 ? visibleRequests.map(req => (
        <div key={req.id} style={styles.requestCard}>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <strong>{req.title}</strong>
            {user.role !== "user" ? (
              <select value={req.status} onChange={e => handleStatusChange(req.id, e.target.value)}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            ) : (
              <span style={{backgroundColor: statusColors[req.status], color:"#fff", padding:"3px 8px", borderRadius:5}}>{req.status}</span>
            )}
          </div>
          <small>{req.date_time}</small>
          <p>{req.description}</p>
        </div>
      )) : <p style={{textAlign:"center"}}>No requests to show.</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth:600, margin:"50px auto", padding:20 },
  card: { padding:20, marginBottom:30, borderRadius:12, backgroundColor:"#fff", boxShadow:"0px 5px 15px rgba(0,0,0,0.15)"},
  title: { fontSize:24, fontWeight:"bold", marginBottom:20 },
  form: { display:"flex", flexDirection:"column" },
  input: { padding:12, marginBottom:15, borderRadius:8, border:"1px solid #ccc", fontSize:16 },
  button: { padding:12, backgroundColor:"#007bff", color:"#fff", border:"none", borderRadius:8, fontSize:16, cursor:"pointer" },
  requestCard: { marginBottom:20, padding:15, borderRadius:8, border:"1px solid #ccc", backgroundColor:"#fff" }
};
