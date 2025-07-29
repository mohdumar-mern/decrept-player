import React, { useState } from "react";

const UploadVideo = () => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected || !selected.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No video selected.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Video uploaded successfully!");
        console.log("Server response:", data);
      } else {
        alert("❌ Upload failed!");
        console.error("Upload error:", data);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("An error occurred while uploading the video.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📤 Upload a Video</h2>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload a video file
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
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Upload
      </button>
    </div>
  );
};

export default UploadVideo;
