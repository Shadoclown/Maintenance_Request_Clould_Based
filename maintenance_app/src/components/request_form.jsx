import React, { useState } from "react";
import { submitRequest } from "./connect";

export default function RequestForm({ user, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationBuilding, setLocationBuilding] = useState("BKD");
  const [roomNumber, setRoomNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocationBuilding("BKD");
    setRoomNumber("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !roomNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      await submitRequest({
        title,
        description,
        locationBuilding,
        roomNumber,
        userId: user.user_id,
      });

      resetForm();
      if (onSuccess) await onSuccess();
      alert("Request submitted successfully!");
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      <div style={styles.locationContainer}>
        <label style={styles.label}>Location:</label>
        <div style={styles.locationInputs}>
          <select
            value={locationBuilding}
            onChange={(e) => setLocationBuilding(e.target.value)}
            style={styles.select}
            required
          >
            <option value="BKD">BKD</option>
            <option value="RS">RS</option>
          </select>
          <input
            type="text"
            placeholder="Room Number (e.g., 101)"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            style={styles.roomInput}
            required
          />
        </div>
      </div>
      <button type="submit" style={styles.button} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column" },
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
    fontSize: 16,
    cursor: "pointer",
  },
  locationContainer: {
    marginBottom: 15,
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  locationInputs: {
    display: "flex",
    gap: 10,
  },
  select: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    flex: "0 0 100px",
    cursor: "pointer",
  },
  roomInput: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    flex: 1,
  },
};
