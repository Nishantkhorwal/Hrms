import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AssetReportModal = ({ asset, onClose }) => {
  const current = asset.currentAssignment;

  // ---------------- EXPORT TO EXCEL ----------------
  const exportToExcel = () => {
    // 1️⃣ Prepare data
    const data = [];

    // Current assignment
    if (current) {
      data.push({
        Type: "Current Assignment",
        Employee: current.employeeName || "-",
        Department: current.department || "-",
        Email: current.employeeEmail || "-",
        Mobile: current.employeeMobile || "-",
        "Issued Date": current.issuedDate
          ? new Date(current.issuedDate).toLocaleDateString()
          : "-",
        "Returned Date": "-", // current is not returned yet
      });
    }

    // History
    if (asset.history && asset.history.length > 0) {
      asset.history.forEach((h) => {
        data.push({
          Type: "History",
          Employee: h.employeeName || "-",
          Department: h.department || "-",
          Email: h.employeeEmail || "-",
          Mobile: h.employeeMobile || "-",
          "Issued Date": h.issuedDate
            ? new Date(h.issuedDate).toLocaleDateString()
            : "-",
          "Returned Date": h.returnedDate
            ? new Date(h.returnedDate).toLocaleDateString()
            : "-",
        });
      });
    }

    // 2️⃣ Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 3️⃣ Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asset Report");

    // 4️⃣ Generate Excel file and trigger download
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `${asset.assetDetails.assetName}-report.xlsx`);
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
