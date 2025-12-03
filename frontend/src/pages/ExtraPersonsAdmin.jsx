"use client"

import { useEffect, useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TABS = [
  { key: "pending", label: "Pending", color: "from-amber-500 to-orange-600", badge: "warning" },
  { key: "approved", label: "Approved", color: "from-emerald-500 to-teal-600", badge: "success" },
  { key: "rejected", label: "Rejected", color: "from-rose-500 to-red-600", badge: "danger" },
]

function formatDateTime(iso) {
  if (!iso) return "-"
  const date = new Date(iso)
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  }
}

function getStatusBadge(status) {
  const badges = {
    pending: { bg: "bg-amber-500/20", text: "text-amber-700", label: "Pending" },
    approved: { bg: "bg-emerald-500/20", text: "text-emerald-700", label: "Approved" },
    rejected: { bg: "bg-rose-500/20", text: "text-rose-700", label: "Rejected" },
  }
  return badges[status] || badges.pending
}

export default function ExtraPersonsAdmin() {
  const [activeTab, setActiveTab] = useState("pending")
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageMeta, setPageMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 })
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, id: null, action: null })

  const token = localStorage.getItem("token")

  const fetchData = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        status: activeTab,
        page,
        limit: 20,
      })

      const res = await fetch(`${API_BASE_URL}/api/attendance/extra?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message || "Failed to load extra-person requests.")
        setRecords([])
        return
      }

      setRecords(json.data || [])

      setPageMeta({
        page: json.page || 1,
        totalPages: json.totalPages || 1,
        total: json.total || 0,
        limit: 20,
      })
    } catch (err) {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (attendanceId, action) => {
    setProcessingId(attendanceId)

    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/extra/${attendanceId}`, {
        method: "PUT",
        headers: {
          
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message || "Failed to update.")
      }

      fetchData(pageMeta.page)
    } catch (err) {
      setError("Failed to update")
    } finally {
      setProcessingId(null)
      setConfirm({ open: false, id: null, action: null })
    }
  }

  const handleConfirm = (id, action) => {
    setConfirm({ open: true, id, action })
  }

  const handleConfirmApply = () => {
    updateStatus(confirm.id, confirm.action)
  }

  useEffect(() => {
    fetchData(1)
  }, [activeTab])

  const gotoPage = (p) => {
    const newPage = Math.max(1, Math.min(p, pageMeta.totalPages))
    setPageMeta((prev) => ({ ...prev, page: newPage }))
    fetchData(newPage)
  }

  const openImage = (path) => {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`
    window.open(url, "_blank")
  }

  const currentTab = TABS.find((t) => t.key === activeTab)
  const dateTime = records.length > 0 ? formatDateTime(records[0]?.inTime) : null

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Monthly Extra Person</h1>
              <p className="">Manage and review additional personnel attendance requests</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-800">{pageMeta.total}</div>
              <p className="text-white text-sm">Total Requests</p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-8">
          <div className="flex gap-3 flex-wrap">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              const count = isActive ? records.length : 0
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setRecords([])
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-blue-500/30 scale-105`
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm font-medium">{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <div className="text-red-400 font-semibold">⚠ Error</div>
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    In Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-slate-400">Loading requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="text-slate-400">No requests found</div>
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => {
                    const dateTime = formatDateTime(r.inTime)
                    const statusBadge = getStatusBadge(r.extraStatus)
                    return (
                      <tr
                        key={r._id}
                        className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4 text-slate-300 font-medium">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <img
                            src={`${API_BASE_URL}${r.inPhoto}`}
                            alt={r.name}
                            className="w-10 h-10 rounded-lg object-cover cursor-pointer ring-2 ring-slate-600 hover:ring-blue-500 transition-all duration-200 group-hover:scale-110"
                            onClick={() => openImage(r.inPhoto)}
                          />
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">{r.name}</td>
                        <td className="px-6 py-4 text-slate-300">{r.vendor}</td>
                        <td className="px-6 py-4 text-slate-300">{r.department}</td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300 text-sm">
                            <div className="font-semibold">{dateTime.date}</div>
                            <div className="text-slate-500">{dateTime.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {activeTab === "pending" && (
                            <div className="flex gap-2">
                              <button
                                disabled={processingId === r._id}
                                onClick={() => handleConfirm(r._id, "approved")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === r._id ? "..." : "Approve"}
                              </button>
                              <button
                                disabled={processingId === r._id}
                                onClick={() => handleConfirm(r._id, "rejected")}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === r._id ? "..." : "Reject"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              Showing page <span className="font-semibold text-slate-200">{pageMeta.page}</span> of{" "}
              <span className="font-semibold text-slate-200">{pageMeta.totalPages}</span>
            </div>

            <div className="flex gap-3">
              <button
                disabled={pageMeta.page <= 1}
                onClick={() => gotoPage(pageMeta.page - 1)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              <button
                disabled={pageMeta.page >= pageMeta.totalPages}
                onClick={() => gotoPage(pageMeta.page + 1)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="mb-2 text-2xl">{confirm.action === "approved" ? "✓" : "✕"}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {confirm.action === "approved" ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="text-slate-400 mb-6">
              {confirm.action === "approved"
                ? "Are you sure you want to approve this extra person request?"
                : "Are you sure you want to reject this extra person request?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirm({ open: false })}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                  confirm.action === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                Yes, {confirm.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
