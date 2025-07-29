import React, { useEffect, useState } from "react";

const VideoTable = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/videos");
      const result = await res.json();

      if (res.ok && Array.isArray(result.data)) {
        const files = result.data.map((filename) => ({
          filename,
        }));
        setVideos(files);
      } else {
        console.error("Invalid data format:", result);
      }
    } catch (error) {
      console.error("❌ Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(`http://localhost:8080/api/videos/${filename}`);
      if (!res.ok) throw new Error("Failed to download video");


      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);    } catch (err) {
      console.error("❌ Download error:", err);
      alert("Download failed.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📁 Uploaded Videos</h2>

      {loading ? (
        <p>Loading videos...</p>
      ) : videos.length === 0 ? (
        <p>No videos found.</p>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Filename</th>
                <th className="py-2 px-4 border-b">Preview</th>
                <th className="py-2 px-4 border-b">Download</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video, index) => {
                const previewUrl = `http://localhost:8080/uploads/${video.filename}`;
                return (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-b">{video.filename}</td>
                    <td className="py-2 px-4 border-b">
                      <video
                        src={previewUrl}
                        controls
                        className="h-20 w-36 rounded shadow"
                      />
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => handleDownload(video.filename)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                      >
                        ⬇️ Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VideoTable;
