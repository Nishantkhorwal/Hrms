
import { useState, useEffect } from "react";
import { Camera, Clock, MapPin, User } from "lucide-react";

const PendingOutTime = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [photoPreview, setPhotoPreview] = useState({});
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // ✅ Fetch today's pending attendance
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/today-pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setPendingList(data.data || []);
    } catch (err) {
      console.error("Error fetching:", err);
      setPendingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);
  
const compressImage = (file, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
    };
  });
};
  // ✅ Handle photo input (camera or upload)
  const handlePhotoChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview((prev) => ({
        ...prev,
        [id]: URL.createObjectURL(file),
      }));
    }
  };

  // ✅ Handle Mark Out Time
  // const handleMarkOut = async (id) => {
  //   const fileInput = document.getElementById(`outPhoto-${id}`);
  //   const file = fileInput?.files[0];
  //   if (!file) return alert("Please capture or select a photo first.");

  //   const formData = new FormData();
  //   formData.append("outPhoto", file);

  //   try {
  //     setUploadingId(id);
  //     const res = await fetch(`${API_BASE_URL}/api/attendance/out/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || "Failed to mark out time");

  //     alert("✅ Out time marked successfully!");
  //     setPendingList((prev) => prev.filter((a) => a._id !== id)); // Remove from list
  //   } catch (err) {
  //     alert(err.message);
  //   } finally {
  //     setUploadingId(null);
  //   }
  // };
  const handleMarkOut = async (id) => {
  const fileInput = document.getElementById(`outPhoto-${id}`);
  const file = fileInput?.files[0];
  if (!file) return alert("Please capture or select a photo first.");

  try {
    setUploadingId(id);

    // ✅ COMPRESS THE IMAGE HERE
    const compressedFile = await compressImage(file, 800, 0.6);

    const formData = new FormData();
    formData.append("outPhoto", compressedFile, `${id}-out.jpeg`); // filename added

    const res = await fetch(`${API_BASE_URL}/api/attendance/out/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to mark out time");

    alert("✅ Out time marked successfully!");
    setPendingList((prev) => prev.filter((a) => a._id !== id)); // Remove from list

  } catch (err) {
    alert(err.message);
  } finally {
    setUploadingId(null);
  }
};


  if (loading)
    return (
      <div className="text-center text-gray-500 py-10 text-lg font-medium">
        Loading pending records...
      </div>
    );

  if (!pendingList.length)
    return (
      <div className="text-center text-white py-10 text-lg font-medium">
        ✅ All out times marked for today!
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Pending Out-Time Records
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pendingList.map((record) => (
          <div
            key={record._id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <User className="text-gray-500" size={20} />
              <h2 className="font-semibold text-gray-800">{record.name}</h2>
            </div>

            <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin size={16} /> {record.siteName}
            </div>

            <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Clock size={16} /> In Time:{" "}
              {new Date(record.inTime).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            })}

            </div>

            <div className="mt-3">
              <input
                type="file"
                id={`outPhoto-${record._id}`}
                accept="image/*"
                capture="camera"
                className="hidden"
                onChange={(e) => handlePhotoChange(e, record._id)}
              />
              {photoPreview[record._id] ? (
                <img
                  src={photoPreview[record._id]}
                  alt="preview"
                  className="rounded-lg w-full h-40 object-cover mb-3 border"
                />
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-400 mb-3">
                  No photo selected
                </div>
              )}

              <div className="flex justify-between items-center">
                <label
                  htmlFor={`outPhoto-${record._id}`}
                  className="cursor-pointer flex items-center gap-2 text-blue-600 font-medium"
                >
                  <Camera size={18} /> Capture Photo
                </label>

                <button
                  onClick={() => handleMarkOut(record._id)}
                  disabled={uploadingId === record._id}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    uploadingId === record._id
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {uploadingId === record._id
                    ? "Marking..."
                    : "Mark Out Time"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOutTime;
