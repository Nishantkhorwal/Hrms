// import React, { useState } from "react";

// const CreateExtraAttendance = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     vendor: "",
//     department: "",
//     category: "",
//     inPhoto: null,
//   });

//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const vendors = [
//     "High Stuff Services Pvt Ltd",
//     "V Secure Services",
//     "L4S Security Services Pvt Ltd",
//     "High Level Security & Labour Suppliers",
//     "Om Security Servicers",
//     "SLV Security Services"
//   ];

//   const departments = [
//     "House Keeping",
//     "Pantry Boy",
//     "Security Supervisor",
//     "Guard",
//     "Horticulture",
//     "Black Guard",
//     "Blue Guard",
//     "Gardener",
//     "Gun Man",
//     "Pantry"
//   ];

//   const categories = ["0–10k", "10k–20k", "20k–30k", "30k–40k", "40k–50k", "Above 50k"];

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setMessage({});
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, inPhoto: file });

//     if (file) {
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({});

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setMessage({ type: "error", text: "Please log in first." });
//         setLoading(false);
//         return;
//       }

//       if (!formData.inPhoto) {
//         setMessage({ type: "error", text: "Please upload a photo." });
//         setLoading(false);
//         return;
//       }

//       const fd = new FormData();
//       fd.append("name", formData.name);
//       fd.append("vendor", formData.vendor);
//       fd.append("department", formData.department);
//       fd.append("category", formData.category);
//       fd.append("inPhoto", formData.inPhoto);

//       // ✔ EXTRA PERSON FIELD
//       fd.append("isExtraPerson", "true");

//       const res = await fetch(`${API_BASE_URL}/api/attendance/create`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({ type: "success", text: data.message });

//         setFormData({
//           name: "",
//           vendor: "",
//           department: "",
//           category: "",
//           inPhoto: null,
//         });
//         setPreview(null);
//       } else {
//         setMessage({ type: "error", text: data.message });
//       }
//     } catch (error) {
//       setMessage({ type: "error", text: "Network error. Try again." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           Mark Extra Person Attendance
//         </h2>

//         {message.text && (
//           <div
//             className={`mb-4 text-center p-2 rounded ${
//               message.type === "success"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-sm font-medium">Name</label>
//             <input
//               type="text"
//               name="name"
//               required
//               value={formData.name}
//               onChange={handleChange}
//               className="mt-1 w-full border px-3 py-2 rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Vendor</label>
//             <select
//               name="vendor"
//               required
//               value={formData.vendor}
//               onChange={handleChange}
//               className="mt-1 w-full border px-3 py-2 rounded-lg"
//             >
//               <option value="">Select Vendor</option>
//               {vendors.map((v) => (
//                 <option key={v} value={v}>{v}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium">Department</label>
//             <select
//               name="department"
//               required
//               value={formData.department}
//               onChange={handleChange}
//               className="mt-1 w-full border px-3 py-2 rounded-lg"
//             >
//               <option value="">Select Department</option>
//               {departments.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium">Salary Category</label>
//             <select
//               name="category"
//               required
//               value={formData.category}
//               onChange={handleChange}
//               className="mt-1 w-full border px-3 py-2 rounded-lg"
//             >
//               <option value="">Select Category</option>
//               {categories.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-medium">Upload Photo</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               className="mt-1 w-full border px-3 py-2 rounded-lg"
//             />

//             {preview && (
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="mt-2 rounded-lg w-full"
//               />
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
//           >
//             {loading ? "Saving..." : "Mark Extra Person"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateExtraAttendance;


import React, { useState } from "react";

const CreateExtraAttendance = () => {
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

  // 📌 SAME DEPT GROUPS AS NORMAL ATTENDANCE FORM
  const departmentGroups = {
    Technical: [
      "Estate Manager",
      "AFM",
      "Fire & Safety Officier",
      "Shift Engineer",
      "Accountant",
      "Help Desk",
      "Technical Supervisor",
      "MST/ Electrician",
      "Machine Operator",
      "Plumber",
      "Mason",
      "Carpanter",
      "Painter",
      "Fire Technician",
      "Lift Operator",
      "STP Operator",
      "Technical Assistant",
    ],
    SoftService: [
      "HouseKeeping Sup.",
      "Pentry Boy",
      "Housekeeping Boy",
      "Head Gardner",
      "Gardner",
    ],
    Security: [
      "Security Supervisor",
      "Lady Guard",
      "Guards",
    ],
  };

  const categories = ["Technical", "SoftService", "Security"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If category changes → clear department
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

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
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
      fd.append("department", formData.department);
      fd.append("mainCategory", formData.mainCategory);
      fd.append("inPhoto", formData.inPhoto);

      // EXTRA PERSON FLAG
      fd.append("isExtraPerson", "true");

      const res = await fetch(`${API_BASE_URL}/api/attendance/create`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });

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

  // Filter departments
  const filteredDepartments =
    formData.mainCategory ? departmentGroups[formData.mainCategory] : [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Mark Extra Person Attendance
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
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Main Category */}
          <div>
            <label className="text-sm font-medium">Staff Category</label>
            <select
              name="mainCategory"
              required
              value={formData.mainCategory}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              disabled={!formData.mainCategory}
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
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
            className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Mark Extra Person"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExtraAttendance;
