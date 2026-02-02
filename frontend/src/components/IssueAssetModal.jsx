import { useState } from "react";

const IssueAssetModal = ({ asset, onClose, onSuccess }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [form, setForm] = useState({
    employeeName: "",
    department: "",
    employeeMobile: "",
    employeeEmail: "",
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.employeeMobile.match(/^\d{10}$/)) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    if (!form.employeeEmail.includes("@")) {
      alert("Enter a valid email");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${asset._id}/issue`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Failed to issue asset");
      }
    } catch (error) {
      console.error("Issue Asset Error:", error);
      alert("Server error while issuing asset");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Issue Asset: {asset.assetName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="employeeName"
            placeholder="Employee Name"
            value={form.employeeName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="employeeMobile"
            placeholder="Mobile Number"
            value={form.employeeMobile}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="employeeEmail"
            placeholder="Email"
            value={form.employeeEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Issue Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueAssetModal;
