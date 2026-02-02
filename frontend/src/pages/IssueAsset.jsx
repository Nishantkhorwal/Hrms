import { useEffect, useState } from "react";
import IssueAssetModal from "../components/IssueAssetModal";
import AssetReportModal from "../components/AssetReportModal";

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Asset Management</h1>

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
