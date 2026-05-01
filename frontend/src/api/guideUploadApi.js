import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/** Uploads one image; returns stored path e.g. /uploads/guide-123.jpg */
export async function uploadGuideImageFile(file) {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await axios.post(`${API_URL}/api/guides/upload-image`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data?.urlPath) throw new Error("Invalid upload response");
  return data.urlPath;
}
