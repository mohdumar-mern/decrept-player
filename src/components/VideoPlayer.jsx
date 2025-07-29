import React, { useState, useEffect } from "react";

// Use Web Crypto API
const crypto = window.crypto || window.msCrypto;
console.log(crypto)
export default function VideoPlayer() {
  const [videoURL, setVideoURL] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Decryption function using Web Crypto API
  async function decryptVideo(encryptedBuffer, keyHex) {

    const keyBytes = new Uint8Array(
      keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC", length: 256 },
      false,
      ["decrypt"]
    );
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      encryptedData
    );
    return new Uint8Array(decrypted);
  }

  // Check if it's a valid MP4 file
  const isValidMP4 = (buffer) => {
    const view = new Uint8Array(buffer);
    const signature = String.fromCharCode(...view.slice(4, 8));
    return signature === "ftyp";
  };

  // Fetch and decrypt video
  const fetchAndPlayVideo = async (filename) => {
    try {
      const res = await fetch(`http://localhost:8080/api/videos/${filename}`);
      const data = await res.json();

      if (res.ok) {
        const encryptedBuffer = Uint8Array.from(atob(data.video), c => c.charCodeAt(0)); // Decode base64
        console.log(encryptedBuffer)

        const decrypted = await decryptVideo(encryptedBuffer, data.key);

        if (isValidMP4(decrypted)) {
          const blob = new Blob([decrypted], { type: "video/mp4" });
          const url = URL.createObjectURL(blob);
          setVideoURL(url);
          setMessage("✅ Video decrypted and loaded successfully.");
        } else {
          throw new Error("Decrypted data is not a valid MP4");
        }
      } else {
        throw new Error(data.message || "Failed to fetch video");
      }
    } catch (err) {
      setError(`❌ ${err.message}`);
      setVideoURL("");
    }
  };

  // Handle file upload (for local encrypted files)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("❌ Please select a video file.");
      return;
    }
    console.log(file.name)
    fetchAndPlayVideo(file.name);

  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, [videoURL]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-xl w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">
          🎥 Upload or Fetch & Play Encrypted Video
        </h2>
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 mb-4"
        />
        <button
          onClick={() => handleUpload} // Replace with actual filename
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Fetch Video
        </button>
        {message && <p className="text-green-500 mt-2">{message}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
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