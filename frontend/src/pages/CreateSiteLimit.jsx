import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Pencil } from "lucide-react";

const siteOptions = [
  "Insignia Park-1", "Insignia Park-2", "Pravasa", "Sukoon",
  "I-City", "Ambliss","Ananda", "Dlf Phase-1", "Wazirpur",
  "Hayatpur", "Head Office"
];

export default function CreateSiteLimit() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [siteName, setSiteName] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const [limits, setLimits] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch limits
  const fetchLimits = async (pageNumber = 1) => {
    try {
      setFetching(true);
      const res = await fetch(
        `${API_BASE_URL}/api/auth/getSiteLimits?page=${pageNumber}&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setLimits(data.data || []);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Error fetching limits");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLimits(page);
  }, [page]);

  // Create New Limit
  const handleSaveLimit = async (e) => {
    e.preventDefault();

    if (!siteName) return toast.error("Please select a site");
    if (dailyLimit === "") return toast.error("Please enter a daily limit");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/setSiteLimit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ siteName, dailyLimit: Number(dailyLimit) })
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Site limit saved");

      setSiteName("");
      setDailyLimit("");
      fetchLimits(page);

    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Update Limit
  const handleUpdate = async (limit) => {
    if (editValue === "") return toast.error("Please enter a limit");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/setSiteLimit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          siteName: limit.siteName,
          dailyLimit: Number(editValue)
        })
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Updated successfully");

      setEditId(null);
      setEditValue("");
      fetchLimits(page);

    } catch {
      toast.error("Error updating");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* FORM */}
      <div className="bg-white shadow-md border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Set Daily Limit for Sites
        </h2>

        <form onSubmit={handleSaveLimit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Select Site</label>
            <select
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full p-3 rounded-lg border"
            >
              <option value="">-- Select a Site --</option>
              {siteOptions.map((site) => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Daily Limit</label>
            <input
              type="number"
              min="0"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full p-3 rounded-lg border"
              placeholder="0 = No limit"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
            >
              {loading ? "Saving..." : "Save Limit"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md border rounded-2xl p-6">

        <h3 className="text-lg font-semibold mb-4 text-gray-800">Existing Site Limits</h3>

        {fetching ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : limits.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No limits added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Site Name</th>
                  <th className="p-3 border">Daily Limit</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>

              <tbody>
                {limits.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.siteName}</td>

                    <td className="p-3 border">
                      {editId === item._id ? (
                        <input
                          className="border p-2 rounded w-28"
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        item.dailyLimit
                      )}
                    </td>

                    <td className="p-3 border">

                      {editId === item._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(item)}
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => { setEditId(null); setEditValue(""); }}
                            className="px-3 py-1 bg-gray-400 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditId(item._id);
                            setEditValue(item.dailyLimit);
                          }}
                          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          <Pencil size={18} />
                        </button>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
