export default function AttendanceTable({
  data,
  loading,
  pagination,
  onPageChange
}) {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">In Photo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Out Photo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-500 font-medium">Loading attendance data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-400 text-lg mb-2">📭</p>
                    <p className="text-gray-500 font-medium">No attendance records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const checkIn = new Date(record.inTime);
                const checkOut = record.outTime ? new Date(record.outTime) : null;
                const duration = checkOut
                  ? Math.round((checkOut - checkIn) / (1000 * 60)) + ' min'
                  : 'Ongoing';

                return (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                      {index + 1 + (pagination.page - 1) * 10}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{record.vendor}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {record.department}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{record.siteName}</td>
                    <td className="px-6 py-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-700">
                          {checkIn.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {checkIn.toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {checkOut ? (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">✗</span>
                          <span className="text-gray-700">
                            {checkOut.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {duration}
                    </td>
                    <td className="px-6 py-3 text-sm">
                    {record.inPhoto ? (
                        <a href={`${API_BASE_URL}${record.inPhoto}`} target="_blank" rel="noopener noreferrer">
                        <img
                            src={`${API_BASE_URL}${record.inPhoto}`}
                            alt="In Photo"
                            className="w-12 h-12 object-cover rounded border"
                        />
                        </a>
                    ) : (
                        <span className="text-gray-400 text-sm">No Photo</span>
                    )}
                    </td>

                    <td className="px-6 py-3 text-sm">
                    {record.outPhoto ? (
                        <a href={`${API_BASE_URL}${record.outPhoto}`} target="_blank" rel="noopener noreferrer">
                        <img
                            src={`${API_BASE_URL}${record.outPhoto}`}
                            alt="Out Photo"
                            className="w-12 h-12 object-cover rounded border"
                        />
                        </a>
                    ) : (
                        <span className="text-gray-400 text-sm">No Photo</span>
                    )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              ← Previous
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
