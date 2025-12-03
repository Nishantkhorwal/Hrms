// import { useEffect, useState } from 'react';
// import MetricsCard from '../components/Metrics-card';
// import FilterPanel from '../components/Filter-panel';
// import AttendanceTable from '../components/Attendance-table';

// const vendors_list = [
//   "High Stuff Services Pvt Ltd",
//   "V Secure Services",
//   "L4S Security Services Pvt Ltd",
//   "High Level Security & Labour Suppliers",
//   "Om Security Servicers",
//   "SLV Security Services"
// ];

// const departments_list = [
//   "House Keeping",
//   "Pantry Boy",
//   "Security Supervisor",
//   "Guard",
//   "Horticulture",
//   "Black Guard",
//   "Blue Guard",
//   "Gardener",
//   "Gun Man",
//   "Pantry"
// ];

// const sites_list = [
//   "Insignia Park-1",
//   "Insignia Park-2",
//   "Pravasa",
//   "Sukoon",
//   "I-City",
//   "Ambliss",
//   "Dlf Phase-1",
//   "Wazirpur",
//   "Hayatpur",
//   "Head Office"
// ];

// export default function AttendanceDashboard() {
//   const [attendances, setAttendances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reportModalOpen, setReportModalOpen] = useState(false);
//   const [reportViewModalOpen, setReportViewModalOpen] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [monthlyReport, setMonthlyReport] = useState(null);
//   const [reportLoading, setReportLoading] = useState(false);

//   const [metrics, setMetrics] = useState({
//     totalPresent: 0,
//     totalAbsent: 0,
//     presentToday: 0,
//     avgAttendance: 0
//   });

//   const [filters, setFilters] = useState({
//     name: "",
//     vendor: "",
//     department: "",
//     siteName: "",
//     from: "",
//     to: "",
//     extra: "",
//     page: 1,
//     limit: 10
//   });

//   const [pagination, setPagination] = useState({
//     page: 1,
//     totalPages: 1,
//     total: 0
//   });

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const fetchAttendance = async () => {
//     setLoading(true);
//     const token = localStorage.getItem("token");

//     const queryParams = new URLSearchParams(
//       Object.fromEntries(
//         Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
//       )
//     ).toString();

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/attendance/get?${queryParams}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "Failed to load data");
//         return;
//       }

//       setAttendances(data.data || []);
//       setPagination({
//       page: data.page || 1,
//       totalPages: data.totalPages || 1,
//       total: data.totalRecords || 0
//     });


//       // Calculate metrics
//       const today = new Date();
// today.setHours(0, 0, 0, 0);

// // Present today = attendance where inTime is today
// const presentTodayCount =
//   data.data?.filter((a) => {
//     const inDate = new Date(a.inTime);
//     inDate.setHours(0, 0, 0, 0);
//     return inDate.getTime() === today.getTime();
//   }).length || 0;

// // Total data fetched
// const totalCount = data.data?.length || 0;

// setMetrics({
//   totalPresent: presentTodayCount,               // People present today
//   totalAbsent: totalCount - presentTodayCount,   // Just comparing today's data
//   presentToday: presentTodayCount,               // Same as totalPresent
//   avgAttendance:
//     totalCount > 0
//       ? Math.round((presentTodayCount / totalCount) * 100)
//       : 0
// });

//       setError(null);
//     } catch (err) {
//       setError("Failed to fetch attendance data");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [filters]);

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     setFilters((prev) => ({ ...prev, page: newPage }));
//   };

//   const handleReset = () => {
//     setFilters({
//       name: "",
//       vendor: "",
//       department: "",
//       siteName: "",
//       from: "",
//       to: "",
//       extra: "",
//       page: 1,
//       limit: 10
//     });
//   };

//   const handleExport = () => {
//     const headers = ['Name', 'Vendor', 'Department', 'Site', 'In Time', 'Out Time'];
//     const rows = attendances.map(att => [
//       att.name,
//       att.vendor,
//       att.department,
//       att.siteName,
//       new Date(att.inTime).toLocaleString(),
//       att.outTime ? new Date(att.outTime).toLocaleString() : '---'
//     ]);

//     const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };
//   const fetchMonthlyReport = async () => {
//   if (!selectedMonth || !selectedYear) return;

//   setReportLoading(true);

//   const token = localStorage.getItem("token");

//   const res = await fetch(
//     `${API_BASE_URL}/api/attendance/report?month=${selectedMonth}&year=${selectedYear}`,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );

//   const data = await res.json();
//   setReportLoading(false);
//   setReportModalOpen(false);

//   if (res.ok) {
//     setMonthlyReport(data);
//     setReportViewModalOpen(true);
//   } else {
//     alert(data.message || "Failed to generate report");
//   }
// };

//    const downloadMonthlyExcel = async () => {
//   if (!selectedMonth || !selectedYear) {
//     alert("Select month and year first");
//     return;
//   }

//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(
//       `${API_BASE_URL}/api/attendance/report/excel?month=${selectedMonth}&year=${selectedYear}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         }
//       }
//     );

//     if (!res.ok) {
//       alert("Failed to download report");
//       return;
//     }

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `Attendance-${selectedMonth}-${selectedYear}.xlsx`;
//     a.click();
//     URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error(err);
//     alert("Error downloading file");
//   }
// };



//   return (
//     <div className="p-6 space-y-6">
//       {/* Metrics Cards */}
//       <div className="flex justify-end">
//         <button
//           onClick={() => setReportModalOpen(true)}
//           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
//         >
//           📅 Generate Monthly Report
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <MetricsCard
//           title="Present Today"
//           value={metrics.presentToday}
//           icon="✓"
//           color="green"
//         />
//         <MetricsCard
//           title="Total Records"
//           value={pagination.total}
//           icon="📋"
//           color="purple"
//         />
//       </div>

//       {/* Filter Panel */}
//       <FilterPanel
//         filters={filters}
//         onFilterChange={handleFilterChange}
//         onReset={handleReset}
//         onExport={handleExport}
//         vendors={vendors_list}
//         departments={departments_list}
//         sites={sites_list}
//       />

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <p className="text-red-700 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Attendance Table */}
//       <AttendanceTable
//         data={attendances}
//         loading={loading}
//         pagination={pagination}
//         onPageChange={handlePageChange}
//       />

//       {reportModalOpen && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//     <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg">
//       <h2 className="text-xl font-semibold mb-4">Select Month & Year</h2>

//       {/* Month Select */}
//       <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
//       <select
//         value={selectedMonth}
//         onChange={(e) => setSelectedMonth(e.target.value)}
//         className="w-full p-2 border rounded-lg mb-4"
//       >
//         <option value="">Select Month</option>
//         {Array.from({ length: 12 }).map((_, i) => (
//           <option key={i} value={i + 1}>
//             {new Date(0, i).toLocaleString("default", { month: "long" })}
//           </option>
//         ))}
//       </select>

//       {/* Year Select */}
//       <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
//       <select
//         value={selectedYear}
//         onChange={(e) => setSelectedYear(e.target.value)}
//         className="w-full p-2 border rounded-lg mb-4"
//       >
//         <option value="">Select Year</option>
//         {[2023, 2024, 2025, 2026].map((yr) => (
//           <option key={yr} value={yr}>
//             {yr}
//           </option>
//         ))}
//       </select>

//       <div className="flex justify-end gap-3 mt-4">
//         <button
//           onClick={() => setReportModalOpen(false)}
//           className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={fetchMonthlyReport}
//           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//         >
//           Generate
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     {reportViewModalOpen && (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
//         <div className="bg-white w-full max-w-5xl p-8 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-200">

//           {/* Title */}
//           <div className='flex flex-row justify-between items-center'>
//             <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
//             📊 Monthly Attendance Report – {monthlyReport?.summary?.month}
//           </h2>
//           <button
//             onClick={downloadMonthlyExcel}
//             className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md mb-6"
//           >
//             📥 Download Monthly Excel
//           </button>
//           </div>  
          


//           {reportLoading ? (
//             <p className="text-center py-6 text-gray-600">Loading...</p>
//           ) : (
//             <>
//               {/* Summary */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
//                 <div className="p-5 rounded-xl bg-gray-50 border shadow-sm">
//                   <p className="text-gray-600 text-sm">Total Employees</p>
//                   <p className="text-2xl font-bold">{monthlyReport?.summary?.totalEmployees}</p>
//                 </div>

//                 <div className="p-5 rounded-xl bg-gray-50 border shadow-sm">
//                   <p className="text-gray-600 text-sm">Extra Manpower</p>
//                   <p className="text-2xl font-bold">{monthlyReport?.summary?.extraManpowerCount}</p>
//                 </div>

//                 {/* Additional Summary Items can be added here */}
//               </div>

//               {/* Employees Table */}
//               <h3 className="font-semibold text-xl mb-3 text-gray-800">Employees Summary</h3>
//               <div className="overflow-x-auto mb-10">
//                 <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
//                   <thead className="bg-gray-100 text-gray-700">
//                     <tr>
//                       <th className="px-4 py-3 border">Name</th>
//                       <th className="px-4 py-3 border">Vendor</th>
//                       <th className="px-4 py-3 border">Dept</th>
//                       <th className="px-4 py-3 border">Site</th>  {/* NEW COLUMN */}
//                       <th className="px-4 py-3 border">Days</th>
//                       <th className="px-4 py-3 border">Hours</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {monthlyReport.groupedEmployees.map((emp, i) => (
//                       <tr key={i} className="border text-gray-800 hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 border">{emp.name}</td>
//                         <td className="px-4 py-3 border">{emp.vendor}</td>
//                         <td className="px-4 py-3 border">{emp.department}</td>
//                         <td className="px-4 py-3 border">{emp.siteName}</td> {/* NEW */}
//                         <td className="px-4 py-3 border text-center">{emp.attendanceDays}</td>
//                         <td className="px-4 py-3 border text-center">{emp.totalHours.toFixed(1)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Extra Manpower */}
//               <h3 className="font-semibold text-xl mt-8 mb-3 text-red-600">Extra Manpower</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
//                   <thead className="bg-red-100 text-gray-700">
//                     <tr>
//                       <th className="px-4 py-3 border">Name</th>
//                       <th className="px-4 py-3 border">Vendor</th>
//                       <th className="px-4 py-3 border">Dept</th>
//                       <th className="px-4 py-3 border">Site</th> {/* NEW */}
//                       <th className="px-4 py-3 border">Days</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {monthlyReport.extraManpower.map((emp, i) => (
//                       <tr key={i} className="hover:bg-red-50 transition">
//                         <td className="px-4 py-3 border">{emp.name}</td>
//                         <td className="px-4 py-3 border">{emp.vendor}</td>
//                         <td className="px-4 py-3 border">{emp.department}</td>
//                         <td className="px-4 py-3 border">{emp.siteName}</td> {/* NEW */}
//                         <td className="px-4 py-3 border text-center">{emp.totalDays}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}

//           {/* Close Button */}
//           <div className="text-center mt-8">
//             <button
//               onClick={() => setReportViewModalOpen(false)}
//               className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     )}


//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import MetricsCard from '../components/Metrics-card';
import FilterPanel from '../components/Filter-panel';
import AttendanceTable from '../components/Attendance-table';
import AttendanceCalendarModal from '../components/AttendanceCalendarModal';

/* --------------------------
   NEW MAIN CATEGORY SYSTEM
---------------------------*/
const mainCategories_list = ["Technical", "SoftService", "Security"];

const departmentGroups = {
  Technical: [
    "Estate Manager", "AFM", "Fire & Safety Officier", "Shift Engineer", "Accountant",
    "Help Desk", "Technical Supervisor", "MST/ Electrician", "Machine Operator",
    "Plumber", "Mason", "Carpanter", "Painter", "Fire Technician", "Lift Operator",
    "STP Operator", "Technical Assistant",
  ],
  SoftService: [
    "HouseKeeping Sup.", "Pentry Boy", "Housekeeping Boy", "Head Gardner", "Gardner",
  ],
  Security: [
    "Security Supervisor", "Lady Guard", "Guards",
  ],
};

const vendors_list = [
  "High Stuff Services Pvt Ltd",
  "V Secure Services",
  "L4S Security Services Pvt Ltd",
  "High Level Security & Labour Suppliers",
  "Om Security Servicers",
  "SLV Security Services",
  "Enviro Facility"
];

const sites_list = [
  "Insignia Park-1", "Insignia Park-2", "Pravasa", "Sukoon",
  "I-City", "Ambliss","Ananda", "Dlf Phase-1", "Wazirpur",
  "Hayatpur", "Head Office"
];

export default function AttendanceDashboard() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Metrics ---------- */
  const [metrics, setMetrics] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    presentToday: 0,
    avgAttendance: 0
  });

  /* ---------- Filters ---------- */
  const [filters, setFilters] = useState({
    name: "",
    vendor: "",
    mainCategory: "",
    department: "",
    siteName: "",
    from: "",
    to: "",
    extra: "",
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  /* ---------- Monthly Report ---------- */
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportViewModalOpen, setReportViewModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [personAttendance, setPersonAttendance] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personLoading, setPersonLoading] = useState(false);



  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* -----------------------------------------
     FETCH ATTENDANCE + UPDATE METRICS
  ------------------------------------------*/
  const fetchAttendance = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      )
    ).toString();

    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/get?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load data");
        return;
      }

      setAttendances(data.data || []);

      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.totalRecords || 0
      });

      /* ---------- Calculate Metrics ---------- */
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const presentTodayCount =
        data.data?.filter((a) => {
          const inDate = new Date(a.inTime);
          inDate.setHours(0, 0, 0, 0);
          return inDate.getTime() === today.getTime();
        }).length || 0;

      const totalCount = data.data?.length || 0;

      setMetrics({
        totalPresent: presentTodayCount,
        totalAbsent: totalCount - presentTodayCount,
        presentToday: presentTodayCount,
        avgAttendance:
          totalCount > 0
            ? Math.round((presentTodayCount / totalCount) * 100)
            : 0
      });

      setError(null);
    } catch (err) {
      setError("Failed to fetch attendance data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Auto Fetch on Filter Change ---------- */
  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  /* ---------- Filter Change ---------- */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "mainCategory" ? { department: "" } : {}),
      page: 1
    }));
  };

  /* ---------- Reset Filters ---------- */
  const handleReset = () => {
    setFilters({
      name: "",
      vendor: "",
      mainCategory: "",
      department: "",
      siteName: "",
      from: "",
      to: "",
      extra: "",
      page: 1,
      limit: 10
    });
  };

  /* ---------- Department List Based on Main Category ---------- */
  const filteredDepartments =
    filters.mainCategory ? departmentGroups[filters.mainCategory] : [];

  /* -----------------------------------------
       MONTHLY REPORT HANDLERS
  ------------------------------------------*/
  const fetchMonthlyReport = async () => {
    if (!selectedMonth || !selectedYear) return;

    setReportLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE_URL}/api/attendance/report?month=${selectedMonth}&year=${selectedYear}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    setReportLoading(false);
    setReportModalOpen(false);

    if (res.ok) {
      setMonthlyReport(data);
      setReportViewModalOpen(true);
    } else {
      alert(data.message || "Failed to generate report");
    }
  };

  const downloadMonthlyExcel = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Select month and year first");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/attendance/report/excel?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        alert("Failed to download report");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance-${selectedMonth}-${selectedYear}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading file");
    }
  };
  const fetchPersonMonthly = async (employee) => {
  setPersonLoading(true);

  // employee will be a full object from your attendance table row
  // e.g., { name, department, vendor, siteName }
  const { name, department, vendor, siteName } = employee;

  setSelectedPerson(name);

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/attendance/person?name=${encodeURIComponent(
        name
      )}&department=${encodeURIComponent(
        department
      )}&vendor=${encodeURIComponent(
        vendor
      )}&siteName=${encodeURIComponent(
        siteName
      )}&month=${selectedMonth}&year=${selectedYear}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to fetch monthly attendance");
      return;
    }

    setPersonAttendance(data.records || []);
    setPersonModalOpen(true);

  } catch (err) {
    console.error(err);
    alert("Error fetching record");
  } finally {
    setPersonLoading(false);
  }
};





  return (
    <div className="p-6 space-y-6">

      {/* ---------------- METRICS ---------------- */}
      <div className="flex justify-end">
        <button
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
        >
          📅 Generate Monthly Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard title="Present Today" value={metrics.presentToday} icon="✓" color="green" />
        <MetricsCard title="Total Records" value={pagination.total} icon="📋" color="purple" />
      </div>

      {/* ---------------- FILTER PANEL ---------------- */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        vendors={vendors_list}
        mainCategories={mainCategories_list}
        departments={filteredDepartments}
        sites={sites_list}
        onExport={() => {}}
      />

      {/* ---------------- ERROR ---------------- */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* ---------------- TABLE ---------------- */}
      <AttendanceTable
        data={attendances}
        loading={loading}
        pagination={pagination}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
      />

      {/* ---------------- MONTH SELECTION MODAL ---------------- */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Select Month & Year</h2>

            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="">Select Year</option>
              {[2023, 2024, 2025, 2026].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={fetchMonthlyReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}


      {personModalOpen && (
        <AttendanceCalendarModal
          isOpen={personModalOpen}
          onClose={() => setPersonModalOpen(false)}
          personName={selectedPerson}
          monthYear={`${selectedMonth}/${selectedYear}`}
          attendanceData={personAttendance}
          isLoading={personLoading}
        />
      )}


      {/* ---------------- REPORT VIEW MODAL ---------------- */}
      {reportViewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-5xl p-8 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                📊 Monthly Attendance Report – {monthlyReport?.summary?.month}
              </h2>
              <button
                onClick={downloadMonthlyExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                📥 Download Excel
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-gray-50 p-4 rounded-xl border">
                <p>Total Employees</p>
                <p className="text-xl font-bold">{monthlyReport?.summary?.totalEmployees}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <p>Extra Manpower</p>
                <p className="text-xl font-bold">{monthlyReport?.summary?.extraManpowerCount}</p>
              </div>
            </div>

            {/* Employee Table */}
            <table className="w-full border mb-8">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Vendor</th>
                  <th className="p-3 border">Dept</th>
                  <th className="p-3 border">Site</th>
                  <th className="p-3 border">Days</th>
                  <th className="p-3 border">Hours</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport?.groupedEmployees?.map((emp, i) => (
                  <tr key={i} className="border">
                    <td className="p-3 border">{emp.name}</td>
                    <td className="p-3 border">{emp.vendor}</td>
                    <td className="p-3 border">{emp.department}</td>
                    <td className="p-3 border">{emp.siteName}</td>
                    <td className="p-3 border">{emp.attendanceDays}</td>
                    <td className="p-3 border">{emp.totalHours.toFixed(1)}</td>
                    <td className="p-3 border text-center">
                    <button onClick={() => fetchPersonMonthly({
                      name: emp.name,
                      department: emp.department,
                      vendor: emp.vendor,
                      siteName: emp.siteName
                    })}>
                      View Attendance
                    </button>
                  </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* Extra Manpower */}
            <h3 className="text-lg font-bold text-red-600 mb-2">Extra Manpower</h3>
            <table className="w-full border mb-8">
              <thead className="bg-red-100">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Vendor</th>
                  <th className="p-3 border">Dept</th>
                  <th className="p-3 border">Site</th>
                  <th className="p-3 border">Days</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport?.extraManpower?.map((emp, i) => (
                  <tr key={i} className="border">
                    <td className="p-3 border">{emp.name}</td>
                    <td className="p-3 border">{emp.vendor}</td>
                    <td className="p-3 border">{emp.department}</td>
                    <td className="p-3 border">{emp.siteName}</td>
                    <td className="p-3 border">{emp.totalDays}</td>
                    <td className="p-3 border text-center">
                    <button onClick={() => fetchPersonMonthly({
                        name: emp.name,
                        department: emp.department,
                        vendor: emp.vendor,
                        siteName: emp.siteName
                      })}>
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-center">
              <button
                onClick={() => setReportViewModalOpen(false)}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}








