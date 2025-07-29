import React, { useState } from "react";

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      setError("Please select a video file.");
      setFile(null);
      return;
    }
    if (!selected.type.startsWith("video/")) {
      setError("Please select a valid video file (e.g., MP4).");
      setFile(null);
      return;
    }
    if (selected.size > 100 * 1024 * 1024) { // 100MB limit
      setError("File size exceeds 100MB limit.");
      setFile(null);
      return;
    }
    setFile(selected);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("No video selected.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("http://localhost:8080/api/upload", { // Updated URL
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data)


      if (res.ok) {
        setMessage("✅ Video uploaded and encrypted successfully!");
        console.log("Server response:", data);
        localStorage.setItem("key", data.key); // Store the key in local storage
        // Optionally store the key for decryption (e.g., in state or context)
        // setKey(data.key); // Uncomment if using key for playback
      } else {
        setError(`❌ Upload failed: ${data.message || "Unknown error"}`);
        console.error("Upload error:", data);
      }
    } catch (error) {
      setError("❌ Network error occurred.");
      console.error("Network error:", error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📤 Upload a Video</h2>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload a video file (max 100MB)
      </label>

      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="block w-full text-sm text-gray-700 
          file:mr-4 file:py-2 file:px-4 
          file:rounded-full file:border-0 
          file:text-sm file:font-semibold 
          file:bg-blue-500 file:text-white 
          hover:file:bg-blue-600 mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={!file}
        className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${!file ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        Upload
      </button>

      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default UploadVideo;