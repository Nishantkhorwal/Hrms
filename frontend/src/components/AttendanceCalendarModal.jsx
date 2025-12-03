
export default function AttendanceCalendarModal({ isOpen, onClose, personName, monthYear, attendanceData, isLoading }) {
  if (!isOpen) return null
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();


  // Parse month and year
  const [month, year] = monthYear.split("/")
  const monthNum = Number.parseInt(month) - 1
  const yearNum = Number.parseInt(year)

  // Get first day of month and number of days
  const firstDay = new Date(yearNum, monthNum, 1).getDay()
  const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate()

  // Create a map of attendance by date for quick lookup
  const attendanceMap = {}
  attendanceData.forEach((record) => {
    if (record.inTime) {
      const date = new Date(record.inTime)
      const dateKey = date.getDate()
      attendanceMap[dateKey] = {
        inTime: record.inTime,
        outTime: record.outTime,
        date: date,
      }
    }
  })

  // Determine status color for a date
//   const getDateStatus = (date) => {
//     const record = attendanceMap[date]
//     if (!record) {
//       return { status: "absent", color: "#ef4444", label: "Absent" } // Red
//     }
//     if (record.inTime && !record.outTime) {
//       return { status: "incomplete", color: "#eab308", label: "Incomplete" } // Yellow
//     }
//     return { status: "present", color: "#22c55e", label: "Present" } // Green
//   }
const getDateStatus = (date) => {
  const isFuture =
    yearNum > currentYear ||
    (yearNum === currentYear && monthNum > currentMonth) ||
    (yearNum === currentYear && monthNum === currentMonth && date > currentDate);

  if (isFuture) {
    return { status: "future", color: "transparent", label: "" };
  }

  const record = attendanceMap[date];
  if (!record) {
    return { status: "absent", color: "#ef4444", label: "Absent" }; // Red
  }
  if (record.inTime && !record.outTime) {
    return { status: "incomplete", color: "#eab308", label: "Incomplete" }; // Yellow
  }

  return { status: "present", color: "#22c55e", label: "Present" }; // Green
};


  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get month name
  const monthName = new Date(yearNum, monthNum).toLocaleString("default", { month: "long", year: "numeric" })

  // Create calendar days array
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{personName}</h2>
              <p className="text-blue-100 text-sm mt-1">📅 {monthName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl font-bold hover:bg-blue-700 rounded-full w-10 h-10 flex items-center justify-center transition"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading attendance data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex gap-6 mb-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
                  <span className="text-sm font-medium text-gray-700">Present (Full Day)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
                  <span className="text-sm font-medium text-gray-700">Incomplete (Missing Out Time)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                  <span className="text-sm font-medium text-gray-700">Absent</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="bg-gray-50 px-4 py-3 text-center font-bold text-gray-700 text-sm border-r border-gray-200 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0">
                  {calendarDays.map((date, index) => {
                    if (date === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square bg-gray-50 border-r border-b border-gray-200"
                        />
                      )
                    }

                    const statusInfo = getDateStatus(date)
                    const record = attendanceMap[date]

                    return (
                      <div
                        key={date}
                        className="aspect-square border-r border-b border-gray-200 p-2 transition hover:shadow-lg cursor-pointer"
                        style={{
                          backgroundColor: statusInfo.color + "08",
                          borderLeftColor: statusInfo.color,
                        }}
                      >
                        <div className="h-full flex flex-col">
                          {/* Date number with status dot */}
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-bold text-lg text-gray-800">{date}</span>
                            {statusInfo.status !== "future" && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo.color }}></div>
                            )}

                          </div>

                          {/* Time info */}
                          <div className="flex-1 flex flex-col justify-end text-xs">
                           {statusInfo.status === "future" ? (
                            <span className="text-gray-300"> </span>
                            ) :
                            record ? (
                              <div className="space-y-0.5">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 font-semibold">In:</span>
                                  <span className="font-semibold" style={{ color: statusInfo.color }}>
                                    {formatTime(record.inTime)}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-500 font-semibold">Out:</span>
                                  <span
                                    className="font-semibold"
                                    style={{
                                      color: record.outTime ? statusInfo.color : "#eab308",
                                    }}
                                  >
                                    {formatTime(record.outTime)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary statistics */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <p className="text-green-600 text-sm font-semibold">Present Days</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {Object.values(attendanceMap).filter((r) => r.inTime && r.outTime).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <p className="text-yellow-600 text-sm font-semibold">Incomplete</p>
                  <p className="text-3xl font-bold text-yellow-700 mt-2">
                    {Object.values(attendanceMap).filter((r) => r.inTime && !r.outTime).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <p className="text-red-600 text-sm font-semibold">Absent Days</p>
                  <p className="text-3xl font-bold text-red-700 mt-2">
                    {daysInMonth - Object.keys(attendanceMap).length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
