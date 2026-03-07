import { useState } from "react";
import { X, User, Phone, Mail, Building2 } from "lucide-react";

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
  const DEPARTMENTS = [
  "IT",
  "HR",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Admin",
];


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Issue Asset
            </h2>
            <p className="text-sm text-gray-500">
              Assign asset to employee
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Asset Info */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Asset Name</p>
              <p className="font-medium text-gray-800">
                {asset.assetName}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Asset Type</p>
              <p className="font-medium text-gray-800">
                {asset.assetType}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Serial Number</p>
              <p className="font-medium text-gray-800">
                {asset.serialNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Condition</p>
              <p className="font-medium text-gray-800">
                {asset.condition}
              </p>
            </div>

          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Employee Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Employee Name
            </label>

            <div className="flex items-center border rounded-lg px-3">
              <User size={16} className="text-gray-400 mr-2" />
              <input
                name="employeeName"
                value={form.employeeName}
                onChange={handleChange}
                required
                placeholder="Enter employee name"
                className="w-full py-2 outline-none text-sm"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Department
            </label>

            <div className="flex items-center border rounded-lg px-3">
              <Building2 size={16} className="text-gray-400 mr-2" />
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full py-2 outline-none text-sm bg-transparent"
              >
                <option value="">Select Department</option>

                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Mobile Number
            </label>

            <div className="flex items-center border rounded-lg px-3">
              <Phone size={16} className="text-gray-400 mr-2" />
              <input
                name="employeeMobile"
                value={form.employeeMobile}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
                className="w-full py-2 outline-none text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address
            </label>

            <div className="flex items-center border rounded-lg px-3">
              <Mail size={16} className="text-gray-400 mr-2" />
              <input
                name="employeeEmail"
                type="email"
                value={form.employeeEmail}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full py-2 outline-none text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
