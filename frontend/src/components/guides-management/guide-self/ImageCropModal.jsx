import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../utils/getCroppedImg";
import { useToast } from "../../../context/ToastContext";

/**
 * Modal: crop then call onComplete(File) — caller uploads.
 */
const ImageCropModal = ({ imageSrc, aspect, title, onCancel, onComplete, busy }) => {
  const toast = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      await onComplete(file);
    } catch (e) {
      console.error(e);
      toast.showToast("Could not crop image. Try another file.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 520,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 id="crop-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
            {title || "Crop image"}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
            Drag to reposition, use the slider to zoom, then apply.
          </p>
        </div>
        <div style={{ position: "relative", width: "100%", height: 320, background: "#111" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div style={{ padding: "12px 20px" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || busy}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: saving || busy ? "wait" : "pointer",
              color: "#374151",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving || busy || !croppedAreaPixels}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#22c55e",
              fontWeight: 600,
              fontSize: 14,
              cursor: saving || busy || !croppedAreaPixels ? "not-allowed" : "pointer",
              color: "#fff",
              opacity: !croppedAreaPixels ? 0.6 : 1,
            }}
          >
            {saving || busy ? "Working…" : "Apply & upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
