import * as XLSX from "xlsx-js-style";

import { saveAs } from "file-saver";

const AssetReportModal = ({ asset, onClose }) => {
  const current = asset.currentAssignment;

  // ---------------- EXPORT TO EXCEL ----------------
  const exportToExcel = () => {
  const current = asset.currentAssignment;

  const employeeName = current?.employeeName || "-";
  const email = current?.employeeEmail || "-";
  const mobile = current?.employeeMobile || "-";
  const department = current?.department || "-";
  const issuedDate = current?.issuedDate
    ? new Date(current.issuedDate).toLocaleDateString("en-CA")
    : "-";

  const data = [
    ["IT ASSET ISSUANCE FORM", "", "", "", "", ""],
    [],
    ["Asset Details", "", "", "", "Employee Details", ""],
    ["Field", "Information", "", "", "Field", "Information"],
    ["Asset Name", asset.assetDetails.assetName || "-", "", "", "Employee Name", employeeName],
    ["Asset Type", asset.assetDetails.assetType || "-", "", "", "Email ID", email],
    ["Serial Number", asset.assetDetails.serialNumber || "-", "", "", "Mobile Number", mobile],
    ["Status", asset.assetDetails.assetStatus || "-", "", "", "", ""],
    ["Issued Date", issuedDate, "", "", "", ""],
    ["Department", department, "", "", "", ""],
    [],
    ["", "", "", "", "Asset Condition at Issuance", ""],
    ["", "", "", "", "Item", "Status"],
    ["", "", "", "", asset.assetDetails.assetType || "-", asset.assetDetails.condition || "-"],
    [],
    ["Declaration", "", "", "", "", ""],
    [
      `I, ${employeeName}, acknowledge that I have received the above-mentioned IT asset in good working condition. I agree to use this asset responsibly and return it in proper condition when required or upon separation from the company.`,
      "",
      "",
      "",
      "",
      "",
    ],
    [],
    ["Signatories", "", "", "", "Location", "Head Office"],
    [],
    ["Role", "", "Name", "", "Signature", "Date"],
    ["Employee", "", employeeName, "", "__________", "__________"],
    ["IT Department", "", "__________________", "", "__________", "__________"],
    ["Authorized Signatory", "", "__________________", "", "__________", "__________"],
    [],
    ["Company Stamp", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],

  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!cols"] = [
    { wch: 20 },
    { wch: 25 },
    { wch: 3 },
    { wch: 3 },
    { wch: 20 },
    { wch: 25 },
  ];

  ws["!merges"] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
  { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } },
  { s: { r: 11, c: 4 }, e: { r: 11, c: 5 } },
  { s: { r: 15, c: 0 }, e: { r: 15, c: 5 } },
  { s: { r: 16, c: 0 }, e: { r: 16, c: 5 } },
  { s: { r: 18, c: 0 }, e: { r: 18, c: 2 } },
  { s: { r: 18, c: 4 }, e: { r: 18, c: 5 } },

  // Company stamp large box
  { s: { r: 25, c: 0 }, e: { r: 30, c: 5 } },
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
        font: { name: "Calibri", sz: 11 },
      };

      if (R === 0) {
        cell.s = {
          font: { bold: true, sz: 18 },
          alignment: center,
          fill: { fgColor: { rgb: "BDD7EE" } },
          border,
        };
      }

      if (R === 2 || R === 11 || R === 15 || R === 18) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: center,
          border,
        };
      }

      if (R === 3 || R === 12 || R === 20) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: center,
          border,
        };
      }

      if ([4, 5, 6, 7, 8, 9].includes(R) && (C === 0 || C === 4)) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F2F2F2" } },
          alignment: left,
          border,
        };
      }

      if (R === 16) {
        cell.s = {
          font: { italic: true },
          alignment: left,
          border,
        };
      }

      if (R >= 21 && C === 0) {
        cell.s = {
          font: { bold: true },
          alignment: left,
          border,
        };
      }
    }
  }

  ws["!rows"] = [
  { hpt: 30 },
  { hpt: 15 },
  { hpt: 25 },
  { hpt: 22 },
  { hpt: 20 },
  { hpt: 20 },
  { hpt: 20 },
  { hpt: 20 },
  { hpt: 20 },
  { hpt: 20 },
  { hpt: 15 },
  { hpt: 22 },
  { hpt: 22 },
  { hpt: 20 },
  { hpt: 15 },
  { hpt: 22 },
  { hpt: 40 },

  { hpt: 35 },
  { hpt: 35 },
  { hpt: 35 },
  { hpt: 35 },
  { hpt: 35 },
];


  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Asset Issuance Form");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${asset.assetDetails.assetName || "asset"}-issuance-form.xlsx`);
};



  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Asset Report: {asset.assetDetails.assetName}
        </h2>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        {/* Current Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><strong>Status:</strong> {asset.assetDetails.assetStatus}</div>
            <div><strong>Type:</strong> {asset.assetDetails.assetType}</div>
            <div><strong>Employee:</strong> {current?.employeeName || "-"}</div>
            <div><strong>Department:</strong> {current?.department || "-"}</div>
            <div><strong>Email:</strong> {current?.employeeEmail || "-"}</div>
            <div><strong>Mobile:</strong> {current?.employeeMobile || "-"}</div>
            <div>
              <strong>Issued Date:</strong>{" "}
              {current?.issuedDate ? new Date(current.issuedDate).toLocaleDateString() : "-"}
            </div>
            <div><strong>Serial Number:</strong> {asset.assetDetails.serialNumber || "-"}</div>
          </div>
        </div>

        {/* History Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">History</h3>
          {asset.history && asset.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Employee</th>
                    <th className="p-2 border">Department</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Mobile</th>
                    <th className="p-2 border">Issued Date</th>
                    <th className="p-2 border">Returned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.history.map((h, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 border">{h.employeeName || "-"}</td>
                      <td className="p-2 border">{h.department || "-"}</td>
                      <td className="p-2 border">{h.employeeEmail || "-"}</td>
                      <td className="p-2 border">{h.employeeMobile || "-"}</td>
                      <td className="p-2 border">{h.issuedDate ? new Date(h.issuedDate).toLocaleDateString() : "-"}</td>
                      <td className="p-2 border">{h.returnedDate ? new Date(h.returnedDate).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No history available for this asset.</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetReportModal;
