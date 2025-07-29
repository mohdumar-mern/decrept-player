import React, { useState } from "react";

export default function VideoPlayer() {
  const [videoURL, setVideoURL] = useState("");

  // XOR Decryption function (must match backend key)
  const decryptVideo = (data) => {
    const key = [0x5f, 0x2a, 0x7b];
    const decrypted = new Uint8Array(data);
    for (let i = 0; i < decrypted.length; i++) {
      decrypted[i] = decrypted[i] ^ key[i % key.length];
    }
    return decrypted;
  };

  // Validate decrypted data (basic check to see if MP4 header is valid)
  const isValidMP4 = (buffer) => {
    const mp4Header = [0x00, 0x00, 0x00]; // simplified check
    return buffer[0] === 0x00 || buffer[0] === 0x1A || buffer[4] === 0x66; // 'f' in 'ftyp'
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("❌ Please select a video file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = new Uint8Array(event.target.result);

      try {
        // Try decrypting
        const decrypted = decryptVideo(buffer);
        if (isValidMP4(decrypted)) {
          const blob = new Blob([decrypted], { type: "video/mp4" });
          const url = URL.createObjectURL(blob);
          setVideoURL(url);
        } else {
          // fallback to original file
          const blob = new Blob([buffer], { type: "video/mp4" });
          const url = URL.createObjectURL(blob);
          setVideoURL(url);
        }
      } catch (err) {
        console.warn("Fallback to original file:", err);
        const blob = new Blob([buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-xl w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">
          🎥 Upload & Play Video (Encrypted or Normal)
        </h2>

        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="block w-full text-sm text-gray-700 
            file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 
            file:text-sm file:font-semibold 
            file:bg-blue-500 file:text-white 
            hover:file:bg-blue-600"
        />

        {videoURL ? (
          <div className="mt-6">
            <video
              src={videoURL}
              controls
              controlsList="nodownload"
              className="rounded-lg w-full h-96 object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="mt-6 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <span className="text-4xl">📼</span>
          </div>
        )}
      </div>
    </div>
  );
}
