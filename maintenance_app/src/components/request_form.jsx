import React, { useState } from "react";
import { supabase } from "./connect";

export default function RequestForm({ user, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationBuilding, setLocationBuilding] = useState("BKD");
  const [roomNumber, setRoomNumber] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocationBuilding("BKD");
    setRoomNumber("");
    setImages([]);
    imagePreview.forEach((url) => URL.revokeObjectURL(url));
    setImagePreview([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    imagePreview.forEach((url) => URL.revokeObjectURL(url));
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const nextImages = images.filter((_, i) => i !== index);
    const nextPreviews = imagePreview.filter((_, i) => i !== index);
    const removedPreview = imagePreview[index];
    if (removedPreview) URL.revokeObjectURL(removedPreview);
    setImages(nextImages);
    setImagePreview(nextPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !roomNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const location = `${locationBuilding}-${roomNumber}`;
      const imageUrls = [];

      for (let i = 0; i < images.length; i += 1) {
        const image = images[i];
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("request_picture")
          .upload(fileName, image, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          alert(
            `Failed to upload image ${i + 1}. Error: ${uploadError.message}\n\n` +
              "Please make sure:\n1. You ran the SQL policies script\n2. The bucket 'request_picture' exists\n3. You are logged in"
          );
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("request_picture")
          .getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("request").insert([
        {
          title,
          description,
          location,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          request_role: null,
          status: "Pending",
          created_by: user.user_id,
        },
      ]);

      if (error) throw error;

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
      <div style={styles.imageUploadContainer}>
        <label style={styles.label}>Upload Images (optional):</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={styles.fileInput}
        />
        {imagePreview.length > 0 && (
          <div style={styles.imagePreviewContainer}>
            {imagePreview.map((preview, index) => (
              <div key={preview} style={styles.imagePreviewItem}>
                <img src={preview} alt={`Preview ${index + 1}`} style={styles.previewImage} />
                <button type="button" onClick={() => removeImage(index)} style={styles.removeButton}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
  imageUploadContainer: {
    marginBottom: 15,
  },
  fileInput: {
    padding: 8,
    fontSize: 14,
    marginBottom: 10,
    cursor: "pointer",
  },
  imagePreviewContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  imagePreviewItem: {
    position: "relative",
    width: 100,
    height: 100,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 8,
    border: "2px solid #ddd",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 24,
    height: 24,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
};
