import React, { useState } from "react";

const CreateAttendance = () => {

  const [formData, setFormData] = useState({
    name: "",
    vendor: "",
    mainCategory: "",
    department: "",
    inPhoto: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const vendors = [
    "High Stuff Services Pvt Ltd",
    "V Secure Services",
    "L4S Security Services Pvt Ltd",
    "High Level Security & Labour Suppliers",
    "Om Security Servicers",
    "SLV Security Services",
    "Enviro Facility"
  ];

  // 📌 DEPARTMENT GROUPS BASED ON MAIN CATEGORY
  const departmentGroups = {
    Technical: [
      "Estate Manager",
      "AFM",
      "Fire & Safety Officer",
      "Shift Engineer",
      "Accountant",
      "Help Desk",
      "Technical Supervisor",
      "MST / Electrician",
      "Machine Operator",
      "Plumber",
      "Mason",
      "Carpenter",
      "Painter",
      "Fire Technician",
      "Lift Operator",
      "STP Operator",
      "Technical Assistant",
    ],
    "Soft Service": [
      "Housekeeping Supervisor",
      "Pantry Boy",
      "Housekeeping Boy",
      "Head Gardener",
      "Gardener",
    ],
    Security: ["Security Supervisor", "Lady Guard", "Guards"],
  };

  const mainCategories = ["Technical", "Soft Service", "Security"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When mainCategory changes → reset department
    if (name === "mainCategory") {
      setFormData({
        ...formData,
        mainCategory: value,
        department: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMessage({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, inPhoto: file });

    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({ type: "error", text: "Please log in first." });
        setLoading(false);
        return;
      }

      if (!formData.inPhoto) {
        setMessage({ type: "error", text: "Please upload a photo." });
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("vendor", formData.vendor);
      fd.append("mainCategory", formData.mainCategory);
      fd.append("department", formData.department);
      fd.append("inPhoto", formData.inPhoto);

      const res = await fetch(`${API_BASE_URL}/api/attendance/create`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: fd,
        credentials: true
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });

        // Reset form
        setFormData({
          name: "",
          vendor: "",
          mainCategory: "",
          department: "",
          inPhoto: null,
        });

        setPreview(null);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments =
    formData.mainCategory ? departmentGroups[formData.mainCategory] : [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Mark In-Time
        </h2>

        {message.text && (
          <div
            className={`mb-4 text-center p-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="text-sm font-medium">Vendor</label>
            <select
              name="vendor"
              required
              value={formData.vendor}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* MAIN CATEGORY */}
          <div>
            <label className="text-sm font-medium">Main Category</label>
            <select
              name="mainCategory"
              required
              value={formData.mainCategory}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select Category</option>
              {mainCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* FILTERED DEPARTMENT */}
          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              disabled={!formData.mainCategory}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              
              onChange={handleFileChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 rounded-lg w-full"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Mark In-Time"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAttendance;

