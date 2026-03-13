import { useEffect, useState } from "react";
import IssueAssetModal from "../components/IssueAssetModal";
import AssetReportModal from "../components/AssetReportModal";
import * as XLSX from "xlsx-js-style";

import { saveAs } from "file-saver";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const IssueAsset = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [reportAsset, setReportAsset] = useState(null);
  const [reportFilterOpen, setReportFilterOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [range, setRange] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  const token = localStorage.getItem("token");

  /* ---------------- FETCH ASSETS ---------------- */
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        page,
        limit: 8,
      });

      const res = await fetch(`${API_BASE_URL}/api/assets/get/?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Fetch Assets Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search, status, page]);

  /* ---------------- MARK AS AVAILABLE ---------------- */
  const makeAvailable = async (asset) => {
    const confirmReturn = window.confirm(
      `Are you sure you want to mark "${asset.assetName}" as Available? This will return the asset from ${asset.employeeName}.`
    );
    if (!confirmReturn) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${asset._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Available" }),
      });
      const data = await res.json();
      if (data.success) fetchAssets();
      else alert(data.message);
    } catch (error) {
      console.error("Change Status Error:", error);
    }
  };

  /* ---------------- OPEN ISSUE MODAL ---------------- */
  const issueAsset = (asset) => setSelectedAsset(asset);

  /* ---------------- VIEW ASSET REPORT ---------------- */
  const viewReport = async (assetId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${assetId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReportAsset(data.data);
      else alert(data.message);
    } catch (error) {
      console.error("Fetch Asset Report Error:", error);
    }
  };
  const generateReport = async () => {
  try {
    const query = new URLSearchParams({
      range,
      ...(range === "custom" && { fromDate, toDate }),
    });

    const res = await fetch(
      `${API_BASE_URL}/api/assets/report?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (data.success) {
      setReportData(data.report);
      setReportFilterOpen(false);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Report Error:", error);
  }
};

const exportDashboardReport = () => {

  const data = [
    ["ASSET MANAGEMENT REPORT", "", "", "", "", ""],
    [`Generated On: ${new Date().toLocaleDateString()}`, "", "", "", "", ""],
    [],

    ["SUMMARY", "", "", "", "", ""],
    ["Metric", "Value", "", "", "", ""],

    ["Total Assets", reportData.summary.totalAssets],
    ["Available", reportData.summary.availableAssets],
    ["Issued", reportData.summary.issuedAssets],
    ["Issued In Period", reportData.activitySummary.issuedInRange],
    ["Returned In Period", reportData.activitySummary.returnedInRange],

    [],

    ["ASSETS BY TYPE", "", "", "", "", ""],
    ["Type", "Total", "Available", "Issued", "", ""],

    ...reportData.assetsByType.map(item => [
      item._id,
      item.total,
      item.available,
      item.issued
    ]),

    [],

    ["DEPARTMENT ASSET USAGE", "", "", "", "", ""],
    ["Department", "Asset Type", "Issued", "", "", ""],

    ...reportData.departmentAssetUsage.map(item => [
      item.department,
      item.assetType,
      item.totalIssued
    ]),

    [],

    ["ASSET ACTIVITY", "", "", "", "", ""],
    ["Asset", "Type", "Employee", "Department", "Issued Date", "Returned Date"],

    ...reportData.activity.map(item => [
      item.assetName,
      item.assetType,
      item.employeeName || "-",
      item.department || "-",
      item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "-",
      item.returnedDate ? new Date(item.returnedDate).toLocaleDateString() : "-"
    ]),

    [],

    ["FULL ASSET INVENTORY", "", "", "", "", ""],
    ["Asset Name", "Type", "Serial Number", "Status", "Employee", "Department"],

    ...reportData.allAssets.map(asset => [
      asset.assetName,
      asset.assetType,
      asset.serialNumber,
      asset.assetStatus,
      asset.employeeName || "-",
      asset.department || "-"
    ])
  ];


  const ws = XLSX.utils.aoa_to_sheet(data);


  ws["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ];


  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },

    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },

    { s: { r: 11, c: 0 }, e: { r: 11, c: 5 } },

    { s: { r: 16 + reportData.assetsByType.length, c: 0 }, e: { r: 16 + reportData.assetsByType.length, c: 5 } },

    { s: { r: 21 + reportData.assetsByType.length + reportData.departmentAssetUsage.length, c: 0 }, e: { r: 21 + reportData.assetsByType.length + reportData.departmentAssetUsage.length, c: 5 } },

    { s: { r: 26 + reportData.assetsByType.length + reportData.departmentAssetUsage.length + reportData.activity.length, c: 0 }, e: { r: 26 + reportData.assetsByType.length + reportData.departmentAssetUsage.length + reportData.activity.length, c: 5 } },
  ];


  const border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  const center = { horizontal: "center", vertical: "center", wrapText: true };
  const left = { horizontal: "left", vertical: "center", wrapText: true };


  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {

      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef];

      if (!cell) continue;

      cell.s = {
        border,
        alignment: center,
        font: { name: "Calibri", sz: 11 }
      };

      /* TITLE */

      if (R === 0) {
        cell.s = {
          font: { bold: true, sz: 18 },
          alignment: center,
          fill: { fgColor: { rgb: "BDD7EE" } },
          border
        };
      }

      /* SECTION HEADERS */

      if (
        cell.v === "SUMMARY" ||
        cell.v === "ASSETS BY TYPE" ||
        cell.v === "DEPARTMENT ASSET USAGE" ||
        cell.v === "ASSET ACTIVITY" ||
        cell.v === "FULL ASSET INVENTORY"
      ) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: center,
          border
        };
      }

      /* TABLE HEADERS */

      if (
        cell.v === "Metric" ||
        cell.v === "Type" ||
        cell.v === "Department" ||
        cell.v === "Asset" ||
        cell.v === "Asset Name"
      ) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: center,
          border
        };
      }

      if (C === 0) {
        cell.s.alignment = left;
      }
    }
  }


  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Assets Report");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(blob, "assets-dashboard-report.xlsx");
};




  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Asset Management</h1>

        <button
          onClick={() => setReportFilterOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Generate Report
        </button>
      </div>


      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search asset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Asset</th>
              <th className="p-3 text-center">Type</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-center">Issued Date</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No assets found
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{asset.assetName}</td>
                  <td className="p-3 text-center">{asset.assetType}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        asset.assetStatus === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {asset.assetStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    {asset.employeeName ? (
                      <>
                        <div>{asset.employeeName}</div>
                        <div className="text-xs text-gray-500">{asset.department}</div>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {asset.issuedDate
                      ? new Date(asset.issuedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    {asset.assetStatus === "Available" ? (
                      <button
                        onClick={() => issueAsset(asset)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                      >
                        Issue
                      </button>
                    ) : (
                      <button
                        onClick={() => makeAvailable(asset)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Mark Available
                      </button>
                    )}

                    <button
                      onClick={() => viewReport(asset._id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedAsset && (
        <IssueAssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSuccess={fetchAssets}
        />
      )}
      {reportFilterOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-[400px] p-6">
      <h2 className="text-xl font-semibold mb-4">Generate Asset Report</h2>

      <select
        value={range}
        onChange={(e) => {
          setRange(e.target.value);
          if (e.target.value !== "custom") {
            setFromDate("");
            setToDate("");
          }
        }}
        className="w-full border px-3 py-2 rounded mb-4"
      >
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="custom">Custom</option>
      </select>

      {range === "custom" && (
        <div className="space-y-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={() => setReportFilterOpen(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={generateReport}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Generate
        </button>
      </div>
    </div>
  </div>
)}


{reportData && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-[900px] max-h-[80vh] overflow-y-auto p-6">

      <div className="flex justify-between mb-4">
        <div className="justify-between items-center gap-5 flex flex-row">
        <h2 className="text-xl font-bold">Assets Report</h2>
        <button
          onClick={exportDashboardReport}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
        Download Excel
        </button>

        </div>

        <button
          onClick={() => setReportData(null)}
          className="text-red-500"
        >
          Close
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6 text-center">
  <div className="p-3 bg-gray-100 rounded">
    Total<br />{reportData.summary.totalAssets}
  </div>

  <div className="p-3 bg-green-100 rounded">
    Available<br />{reportData.summary.availableAssets}
  </div>

  <div className="p-3 bg-red-100 rounded">
    Issued<br />{reportData.summary.issuedAssets}
  </div>

  <div className="p-3 bg-blue-100 rounded">
    Issued In Period<br />{reportData.activitySummary.issuedInRange}
  </div>

  <div className="p-3 bg-purple-100 rounded">
    Returned In Period<br />{reportData.activitySummary.returnedInRange}
  </div>
</div>


      {/* Type Table */}
      <h3 className="font-semibold mb-2">Assets by Type</h3>

      <table className="w-full text-sm border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-left">Type</th>
            <th className="p-2 border text-center">Total</th>
            <th className="p-2 border text-center">Available</th>
            <th className="p-2 border text-center">Issued</th>
          </tr>
        </thead>

        <tbody>
          {reportData.assetsByType.map((item, index) => (
            <tr key={index}>
              <td className="p-2 border">{item._id}</td>
              <td className="p-2 border text-center">{item.total}</td>
              <td className="p-2 border text-center">{item.available}</td>
              <td className="p-2 border text-center">{item.issued}</td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Department Table */}
      <h3 className="font-semibold mb-2">Department Asset Usage</h3>

<table className="w-full text-sm border mb-6">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-2 border text-left">Department</th>
      <th className="p-2 border text-left">Asset Type</th>
      <th className="p-2 border text-center">Issued</th>
    </tr>
  </thead>

  <tbody>
    {reportData.departmentAssetUsage.map((item, index) => (
      <tr key={index}>
        <td className="p-2 border">{item.department}</td>
        <td className="p-2 border">{item.assetType}</td>
        <td className="p-2 border text-center">{item.totalIssued}</td>
      </tr>
    ))}
  </tbody>
</table>


<h3 className="font-semibold mb-2">Asset Activity</h3>

<table className="w-full text-sm border">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-2 border text-left">Asset</th>
      <th className="p-2 border text-left">Type</th>
      <th className="p-2 border text-left">Employee</th>
      <th className="p-2 border text-left">Department</th>
      <th className="p-2 border text-center">Issued</th>
      <th className="p-2 border text-center">Returned</th>
    </tr>
  </thead>

  <tbody>
    {reportData.activity.map((item, index) => (
      <tr key={index}>
        <td className="p-2 border">{item.assetName}</td>
        <td className="p-2 border">{item.assetType}</td>
        <td className="p-2 border">{item.employeeName || "-"}</td>
        <td className="p-2 border">{item.department || "-"}</td>
        <td className="p-2 border text-center">
          {item.issuedDate
            ? new Date(item.issuedDate).toLocaleDateString()
            : "-"}
        </td>
        <td className="p-2 border text-center">
          {item.returnedDate
            ? new Date(item.returnedDate).toLocaleDateString()
            : "-"}
        </td>
      </tr>
    ))}
  </tbody>
</table>


    </div>
  </div>
)}


      {reportAsset && (
        <AssetReportModal
          asset={reportAsset}
          onClose={() => setReportAsset(null)}
        />
      )}
    </div>
  );
};

export default IssueAsset;
