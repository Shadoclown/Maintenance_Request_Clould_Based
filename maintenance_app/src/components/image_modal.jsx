import React from "react";

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.content} onClick={handleContentClick}>
        <button type="button" style={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <img src={imageUrl} alt="Request attachment" style={styles.image} />
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
    cursor: "zoom-out",
  },
  content: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxWidth: "90vw",
    maxHeight: "90vh",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    cursor: "default",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "none",
    border: "none",
    color: "#333",
    fontSize: 24,
    cursor: "pointer",
    fontWeight: "bold",
  },
  image: {
    maxWidth: "80vw",
    maxHeight: "80vh",
    display: "block",
    borderRadius: 8,
  },
};
