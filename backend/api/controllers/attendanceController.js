import HrmsAttendance from "../models/attendanceModel.js";
import HrmsSiteSettings from '../models/siteSettingsModel.js';
import ExcelJS from "exceljs";

// Create new attendance record

export const createAttendance = async (req, res) => {
  try {
    const { name, vendor, department, mainCategory, isExtraPerson } = req.body;
    const user = req.user;
    const siteName = user.site;

    const inPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    // VALIDATION (updated)
    if (!req.file) {
      return res.status(400).json({ message: "Image is missing" });
    }

    // Current time
    const inTime = new Date();
    const today = new Date();

    const startOfDay = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59
    ));

    // SITE SETTINGS
    const siteSettings = await HrmsSiteSettings?.findOne({ siteName });
    const dailyLimit = siteSettings?.dailyLimit ?? 0;

    // Count today's entries
    const todayCount = await HrmsAttendance.countDocuments({
      siteName,
      extraManpower: false,
      inTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Block normal entries if limit reached
    if (dailyLimit > 0 && todayCount >= dailyLimit && isExtraPerson !== "true") {
      return res.status(400).json({
        message: `Daily limit reached for ${siteName}. Only extra manpower can be added.`
      });
    }

    // Save Attendance (UPDATED FIELDS)
    const newAttendance = await HrmsAttendance.create({
      name,
      vendor,
      department,
      mainCategory, // <-- NEW FIELD
      inTime,
      inPhoto,
      siteName,
      createdBy: user.id,
      outTime: null,
      outPhoto: null,

      extraManpower: isExtraPerson === "true",
      extraStatus: isExtraPerson === "true" ? "pending" : "none",
      requestedBy: isExtraPerson === "true" ? user.id : null,
    });

    res.status(201).json({
      message:
        isExtraPerson === "true"
          ? "Extra person request sent to admin"
          : "In-time marked successfully",
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};





export const updateOutTime = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const outPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    const attendance = await HrmsAttendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (attendance.outTime) {
      return res.status(400).json({ message: "Out time already recorded" });
    }

    if (!outPhoto) {
      return res.status(400).json({ message: "Out photo is required." });
    }

    // ✅ Save current UTC time
    const outTime = new Date();

    if (outTime <= attendance.inTime) {
      return res.status(400).json({
        message: "Out time must be greater than in time.",
      });
    }

    attendance.outTime = outTime;
    attendance.outPhoto = outPhoto;

    await attendance.save();

    res.status(200).json({
      message: "Out time updated successfully",
      attendance,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};






export const getAllAttendance = async (req, res) => {
  try {
    const user = req.user;

    if (!["Admin", "SuperAdmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Only Admin or SuperAdmin can view attendance."
      });
    }

    const {
      name,
      vendor,
      siteName,
      department,
      mainCategory, // <-- NEW
      from,
      to,
      extra,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // TEXT SEARCH
    if (name) query.name = { $regex: name, $options: "i" };

    // EXACT MATCH FILTERS
    if (vendor) query.vendor = vendor;
    if (siteName) query.siteName = siteName;
    if (department) query.department = department;

    // NEW: Filter by mainCategory
    if (mainCategory) query.mainCategory = mainCategory;

    // 🔥 Only include:
    // - normal manpower
    // - approved extra manpower
    query.$or = [
      { extraManpower: { $ne: true } },
      { extraManpower: true, extraStatus: "approved" }
    ];

    // 📅 Date Range
    if (from || to) {
      const dateFilter = {};

      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }

      query.inTime = dateFilter;
    }

    const skip = (page - 1) * limit;

    const totalRecords = await HrmsAttendance.countDocuments(query);

    const records = await HrmsAttendance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayQuery = {
        ...query,
        inTime: { $gte: todayStart, $lte: todayEnd }
      };

      const presentToday = await HrmsAttendance.countDocuments(todayQuery);

    return res.status(200).json({
      message: "Attendance records fetched successfully",
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      presentToday,
      totalPages: Math.ceil(totalRecords / limit),
      data: records,
    });

  } catch (error) {
    console.error("Error fetching attendance:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};





export const getTodayAttendanceWithoutOutTime = async (req, res) => {
  try {
    const user = req.user;
    const siteName = user.site;

    // ✅ Get current date
    const today = new Date();

    // ✅ Define today's UTC range directly (since DB stores UTC times)
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    // ✅ Build query (no name filter)
    const query = {
      siteName,
      outTime: null,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    };

    const records = await HrmsAttendance.find(query).sort({ inTime: -1 });

    // ✅ Return even if none found
    res.status(200).json({
      message: "Today's attendance without outTime fetched successfully",
      count: records.length,
      data: records,
      debug: { startOfDay, endOfDay },
    });

  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



export const getMonthlyExtraPersons = async (req, res) => {
  try {
    const user = req.user;

    // Only Admin / SuperAdmin allowed
    if (!["Admin", "SuperAdmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Only Admin or SuperAdmin can view extra persons."
      });
    }

    // Extract filters
    const { status = "pending", page = 1, limit = 20 } = req.query;

    // Validate status
    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be pending, approved or rejected."
      });
    }

    // Determine date range for CURRENT MONTH
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

    // Query
    const query = {
      extraManpower: true,
      extraStatus: status,
      inTime: { $gte: startOfMonth, $lte: endOfMonth }
    };

    const skip = (page - 1) * limit;

    // Count for pagination
    const total = await HrmsAttendance.countDocuments(query);

    // Fetch records
    const records = await HrmsAttendance.find(query)
      .sort({ inTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      message: "Extra persons fetched successfully",
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: records
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






export const updateExtraPersonStatus = async (req, res) => {
  try {
    const user = req.user;

    // Only Admin / SuperAdmin can approve/reject
    if (!["Admin", "SuperAdmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Only Admin or SuperAdmin can update status."
      });
    }

    const { attendanceId } = req.params;
    const { status } = req.body; // expected: "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const record = await HrmsAttendance.findById(attendanceId);

    if (!record || record.extraManpower !== true) {
      return res.status(404).json({ message: "Extra person record not found." });
    }

    // Update status
    record.extraStatus = status;
    record.approvedBy = user.id;

    await record.save();

    return res.status(200).json({
      message: `Extra person ${status} successfully.`,
      data: record
    });

  } catch (error) {
    console.error("Error updating extra person status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const user = req.user;

    if (!["Admin", "SuperAdmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Only Admin / SuperAdmin can access monthly reports"
      });
    }

    const { month, year, vendor, department, mainCategory, name, siteName, extra } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required."
      });
    }

    // Month date range
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const query = {
      inTime: { $gte: startDate, $lte: endDate }
    };

    // Optional filters
    if (vendor) query.vendor = vendor;
    if (department) query.department = department;
    if (mainCategory) query.mainCategory = mainCategory;   // <-- NEW FIELD
    if (siteName) query.siteName = siteName;
    if (name) query.name = { $regex: name, $options: "i" };

    // Filter extra manpower
    if (extra === "true") query.extraManpower = true;
    if (extra === "false") query.extraManpower = false;

    const records = await HrmsAttendance.find(query).sort({ inTime: 1 });

    // If empty
    if (records.length === 0) {
      return res.status(200).json({
        message: "No attendance found for selected month.",
        summary: {
          month: `${startDate.toLocaleString("default", { month: "long" })} ${year}`,
          filtersApplied: { month, year, vendor, department, mainCategory, name, siteName, extra },
          totalEmployees: 0,
          extraManpowerCount: 0,
          totalPresentDays: 0,
        },
        groupedEmployees: [],
        extraManpower: [],
      });
    }

    // ============================
    // 1️⃣ Group Normal Employees
    // ============================

    const map = new Map();

    records.forEach((rec) => {
      if (!rec.extraManpower) {
        const key = `${rec.name}_${rec.vendor}_${rec.department}`;

        if (!map.has(key)) {
          map.set(key, {
            name: rec.name,
            vendor: rec.vendor,
            department: rec.department,
            mainCategory: rec.mainCategory,   // <-- NEW FIELD
            siteName: rec.siteName,
            attendanceDays: 0,
            totalHours: 0,
            firstSeen: rec.inTime,
            lastSeen: rec.inTime,
            detailedRecords: []
          });
        }

        const emp = map.get(key);

        emp.attendanceDays++;

        if (rec.inTime < emp.firstSeen) emp.firstSeen = rec.inTime;
        if (rec.inTime > emp.lastSeen) emp.lastSeen = rec.inTime;

        if (rec.outTime) {
          const hours = (rec.outTime - rec.inTime) / (1000 * 60 * 60);
          emp.totalHours += hours;
        }

        emp.detailedRecords.push({
          date: rec.inTime,
          inTime: rec.inTime,
          outTime: rec.outTime,
          hoursWorked: rec.outTime
            ? (rec.outTime - rec.inTime) / (1000 * 60 * 60)
            : 0
        });
      }
    });

    const groupedEmployees = Array.from(map.values());

    // ===================================
    // 2️⃣ EXTRA MANPOWER REPORT
    // ===================================

    const extraRecords = records.filter((r) => r.extraManpower === true);
    const extraMap = new Map();

    extraRecords.forEach((rec) => {
      const key = `${rec.name}_${rec.vendor}_${rec.department}`;

      if (!extraMap.has(key)) {
        extraMap.set(key, {
          name: rec.name,
          vendor: rec.vendor,
          department: rec.department,
          mainCategory: rec.mainCategory,  // <-- NEW FIELD
          status: rec.extraStatus,
          siteName: rec.siteName,
          totalDays: 0,
          firstDay: rec.inTime,
          lastDay: rec.inTime,
          dateRanges: []
        });
      }

      const e = extraMap.get(key);

      e.totalDays++;

      if (rec.inTime < e.firstDay) e.firstDay = rec.inTime;
      if (rec.inTime > e.lastDay) e.lastDay = rec.inTime;

      e.dateRanges.push({
        date: rec.inTime,
        inTime: rec.inTime,
        outTime: rec.outTime
      });
    });

    const extraManpower = Array.from(extraMap.values());

    // ============================
    // 3️⃣ FINAL SUMMARY
    // ============================

    const responseSummary = {
      month: `${startDate.toLocaleString("default", { month: "long" })} ${year}`,
      filtersApplied: { month, year, vendor, department, mainCategory, name, siteName, extra },
      totalEmployees: groupedEmployees.length,
      extraManpowerCount: extraManpower.length,
      totalPresentDays: records.length
    };

    // ============================
    // 4️⃣ RESPONSE
    // ============================

    res.status(200).json({
      message: "Monthly attendance report generated successfully",
      summary: responseSummary,
      groupedEmployees,
      extraManpower
    });

  } catch (error) {
    console.error("Monthly Report Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};




export const getMonthlyAttendanceReportExcel = async (req, res) => {
  try {
    // 1️⃣ Get JSON report using the existing report logic
    req.query.download = true;
    const jsonReport = await new Promise((resolve) => {
      const fakeRes = {
        status: () => fakeRes,
        json: (data) => resolve(data),
      };
      getMonthlyAttendanceReport(req, fakeRes);
    });

    const { groupedEmployees, extraManpower, summary } = jsonReport;

    // 2️⃣ Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ROF Attendance System";
    workbook.created = new Date();

    // ----------------------------------------------------
    //  SHEET 1 ➜ NORMAL EMPLOYEES
    // ----------------------------------------------------
    const sheet1 = workbook.addWorksheet("Employees");

    sheet1.columns = [
      { header: "Name", key: "name", width: 22 },
      { header: "Vendor", key: "vendor", width: 20 },
      { header: "Main Category", key: "mainCategory", width: 20 },   // <-- ADDED
      { header: "Department", key: "department", width: 20 },
      { header: "Site Name", key: "siteName", width: 20 },
      { header: "Attendance Days", key: "attendanceDays", width: 18 },
      { header: "Total Hours", key: "totalHours", width: 15 },
      { header: "First Seen", key: "firstSeen", width: 22 },
      { header: "Last Seen", key: "lastSeen", width: 22 },
    ];

    groupedEmployees.forEach((emp) => {
      sheet1.addRow({
        name: emp.name,
        vendor: emp.vendor,
        mainCategory: emp.mainCategory,   // <-- NEW FIELD
        department: emp.department,
        siteName: emp.siteName,
        attendanceDays: emp.attendanceDays,
        totalHours: emp.totalHours.toFixed(2),
        firstSeen: new Date(emp.firstSeen).toLocaleString(),
        lastSeen: new Date(emp.lastSeen).toLocaleString(),
      });
    });

    // ----------------------------------------------------
    //  SHEET 2 ➜ EXTRA MANPOWER
    // ----------------------------------------------------
    const sheet2 = workbook.addWorksheet("Extra Manpower");

    sheet2.columns = [
      { header: "Name", key: "name", width: 22 },
      { header: "Vendor", key: "vendor", width: 20 },
      { header: "Main Category", key: "mainCategory", width: 20 },  // <-- ADDED
      { header: "Department", key: "department", width: 20 },
      { header: "Status", key: "status", width: 14 },
      { header: "Site Name", key: "siteName", width: 20 },
      { header: "Total Days", key: "totalDays", width: 15 },
      { header: "First Day", key: "firstDay", width: 22 },
      { header: "Last Day", key: "lastDay", width: 22 },
    ];

    extraManpower.forEach((emp) => {
      sheet2.addRow({
        name: emp.name,
        vendor: emp.vendor,
        mainCategory: emp.mainCategory,  // <-- NEW FIELD
        department: emp.department,
        status: emp.status,
        siteName: emp.siteName,
        totalDays: emp.totalDays,
        firstDay: new Date(emp.firstDay).toLocaleString(),
        lastDay: new Date(emp.lastDay).toLocaleString(),
      });
    });

    // ----------------------------------------------------
    //  3️⃣ SEND FILE RESPONSE
    // ----------------------------------------------------
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_Report_${summary.month}.xlsx`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("Excel Export Error:", error);
    res.status(500).json({ message: "Excel export failed", error: error.message });
  }
};

export const getPersonMonthlyAttendance = async (req, res) => {
  try {
    const user = req.user;

    const { name, vendor, department, mainCategory, siteName, month, year } = req.query;

    // Required fields
    if (!name) return res.status(400).json({ message: "Name is required." });
    if (!month || !year)
      return res.status(400).json({ message: "Month and year are required." });

    // Month range
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // 🔥 SUPER STRICT FILTERS — No partial matches allowed
    const query = {
      // Exact name match (case insensitive)
      name: { $regex: `^${name}$`, $options: "i" },

      // date range
      inTime: { $gte: startDate, $lte: endDate }
    };

    // Vendor must match exactly
    if (vendor) query.vendor = vendor;

    // Department must match exactly
    if (department) query.department = department;

    // Main category must match exactly
    if (mainCategory) query.mainCategory = mainCategory;

    // Site restrictions
    if (user.role !== "Admin" && user.role !== "SuperAdmin") {
      // Normal user → must match their site
      query.siteName = user.site;
    } else {
      // Admin → match only if provided
      if (siteName) query.siteName = siteName;
    }

    // Fetch
    const records = await HrmsAttendance.find(query).sort({ inTime: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        message: "No attendance found for this month",
        month,
        year,
        totalPresentDays: 0,
        totalHoursWorked: 0,
        records: [],
      });
    }

    // Calculate
    let totalHoursWorked = 0;
    const detailed = records.map((rec) => {
      const hoursWorked = rec.outTime
        ? (rec.outTime - rec.inTime) / (1000 * 60 * 60)
        : 0;

      totalHoursWorked += hoursWorked;

      return {
        date: rec.inTime,
        inTime: rec.inTime,
        outTime: rec.outTime,
        hoursWorked: Number(hoursWorked.toFixed(2)),
        siteName: rec.siteName,
        vendor: rec.vendor,
        department: rec.department,
        mainCategory: rec.mainCategory,
      };
    });

    res.status(200).json({
      message: "Monthly attendance fetched successfully",
      name,
      month,
      year,
      totalPresentDays: records.length,
      totalHoursWorked: Number(totalHoursWorked.toFixed(2)),
      records: detailed,
    });

  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






// export const createAttendance = async (req, res) => {
//   try {
//     const { name, vendor, department, category, isExtraPerson } = req.body;
//     const user = req.user;
//     const siteName = user.site;

//     const inPhoto = req.file ? `/uploads/${req.file.filename}` : null;

//     if (!name || !vendor || !department || !category || !inPhoto) {
//       return res.status(400).json({
//         message: "Name, vendor, department, category and photo are required."
//       });
//     }

//     // Current time
//     const inTime = new Date();
//     const today = new Date();
//     const startOfDay = new Date(Date.UTC(
//       today.getUTCFullYear(),
//       today.getUTCMonth(),
//       today.getUTCDate(),
//       0,0,0
//     ));

//     const endOfDay = new Date(Date.UTC(
//       today.getUTCFullYear(),
//       today.getUTCMonth(),
//       today.getUTCDate(),
//       23,59,59
//     ));
//     const siteSettings = await HrmsSiteSettings?.findOne({ siteName });

//     const dailyLimit = siteSettings?.dailyLimit ?? 0; // 0 = unlimited

//     // Count today's non-extra attendance for this site
//     const todayCount = await HrmsAttendance.countDocuments({
//       siteName,
//       extraManpower: false, // only normal entries count in limit
//       inTime: { $gte: startOfDay, $lte: endOfDay }
//     });

//     // Block normal attendance when limit exceeded
//     if (dailyLimit > 0 && todayCount >= dailyLimit && isExtraPerson !== "true") {
//       return res.status(400).json({
//         message: `Daily limit reached for ${siteName}. Only extra manpower can be added.`
//       });
//     }

//     const newAttendance = await HrmsAttendance.create({
//       name,
//       vendor,
//       department,
//       category,
//       inTime,
//       inPhoto,
//       siteName,
//       createdBy: user.id,
//       outTime: null,
//       outPhoto: null,

//       // NEW fields:
//       extraManpower: isExtraPerson === "true",
//       extraStatus: isExtraPerson === "true" ? "pending" : "none",
//       requestedBy: isExtraPerson === "true" ? user.id : null,
//     });

//     res.status(201).json({
//       message:
//         isExtraPerson === "true"
//           ? "Extra person request sent to admin"
//           : "In-time marked successfully",
//       attendance: newAttendance,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// export const getAllAttendance = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!["Admin", "SuperAdmin"].includes(user.role)) {
//       return res.status(403).json({
//         message: "Access denied. Only Admin or SuperAdmin can view attendance."
//       });
//     }

//     const {
//       name,
//       vendor,
//       siteName,
//       department,
//       from,
//       to,
//       extra, // <-- new
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const query = {};

//     if (name) query.name = { $regex: name, $options: "i" };
//     if (vendor) query.vendor = vendor;
//     if (siteName) query.siteName = siteName;
//     if (department) query.department = department;
//     query.$or = [
//       { extraManpower: { $ne: true } },             // normal entries
//       { extraManpower: true, extraStatus: "approved" } // only approved extras
//     ];


//     // 📅 Date Range Filter
//     if (from || to) {
//       const dateFilter = {};

//       if (from) {
//         const fromDate = new Date(from);
//         fromDate.setHours(0, 0, 0, 0);
//         dateFilter.$gte = fromDate;
//       }

//       if (to) {
//         const toDate = new Date(to);
//         toDate.setHours(23, 59, 59, 999);
//         dateFilter.$lte = toDate;
//       }

//       query.inTime = dateFilter;
//     }

//     const skip = (page - 1) * limit;

//     const totalRecords = await HrmsAttendance.countDocuments(query);

//     const records = await HrmsAttendance.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     return res.status(200).json({
//       message: "Attendance records fetched successfully",
//       page: Number(page),
//       limit: Number(limit),
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / limit),
//       data: records,
//     });

//   } catch (error) {
//     console.error("Error fetching attendance:", error);

//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// export const getMonthlyAttendanceReportExcel = async (req, res) => {
//   try {
//     // 1️⃣ First get the JSON report (reuse existing logic)
//     req.query.download = true; // Optional flag if needed
//     const jsonReport = await new Promise((resolve, reject) => {
//       const fakeRes = {
//         status: () => fakeRes,
//         json: (data) => resolve(data)
//       };
//       getMonthlyAttendanceReport(req, fakeRes);
//     });

//     const { groupedEmployees, extraManpower, summary } = jsonReport;

//     // 2️⃣ Create workbook
//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "ROF Attendance System";
//     workbook.created = new Date();

//     // ----------------------------------------------------
//     //  SHEET 1 ➜ NORMAL EMPLOYEES
//     // ----------------------------------------------------
//     const sheet1 = workbook.addWorksheet("Employees");

//     sheet1.columns = [
//       { header: "Name", key: "name", width: 22 },
//       { header: "Vendor", key: "vendor", width: 20 },
//       { header: "Department", key: "department", width: 20 },
//       { header: "Category", key: "category", width: 15 },
//       { header: "Site Name", key: "siteName", width: 20 },
//       { header: "Attendance Days", key: "attendanceDays", width: 18 },
//       { header: "Total Hours", key: "totalHours", width: 15 },
//       { header: "First Seen", key: "firstSeen", width: 22 },
//       { header: "Last Seen", key: "lastSeen", width: 22 },
//     ];

//     groupedEmployees.forEach((emp) => {
//       sheet1.addRow({
//         name: emp.name,
//         vendor: emp.vendor,
//         department: emp.department,
//         category: emp.category,
//         siteName: emp.siteName,
//         attendanceDays: emp.attendanceDays,
//         totalHours: emp.totalHours.toFixed(2),
//         firstSeen: new Date(emp.firstSeen).toLocaleString(),
//         lastSeen: new Date(emp.lastSeen).toLocaleString(),
//       });
//     });

//     // ----------------------------------------------------
//     //  SHEET 2 ➜ EXTRA MANPOWER
//     // ----------------------------------------------------
//     const sheet2 = workbook.addWorksheet("Extra Manpower");

//     sheet2.columns = [
//       { header: "Name", key: "name", width: 22 },
//       { header: "Vendor", key: "vendor", width: 20 },
//       { header: "Department", key: "department", width: 20 },
//       { header: "Status", key: "status", width: 14 },
//       { header: "Site Name", key: "siteName", width: 20 },
//       { header: "Total Days", key: "totalDays", width: 15 },
//       { header: "First Day", key: "firstDay", width: 22 },
//       { header: "Last Day", key: "lastDay", width: 22 },
//     ];

//     extraManpower.forEach((emp) => {
//       sheet2.addRow({
//         name: emp.name,
//         vendor: emp.vendor,
//         department: emp.department,
//         status: emp.status,
//         siteName: emp.siteName,
//         totalDays: emp.totalDays,
//         firstDay: new Date(emp.firstDay).toLocaleString(),
//         lastDay: new Date(emp.lastDay).toLocaleString(),
//       });
//     });

//     // ----------------------------------------------------
//     //  3️⃣ SEND FILE RESPONSE
//     // ----------------------------------------------------
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=Attendance_Report_${summary.month}.xlsx`
//     );

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     await workbook.xlsx.write(res);
//     res.status(200).end();

//   } catch (error) {
//     console.error("Excel Export Error:", error);
//     res.status(500).json({ message: "Excel export failed", error: error.message });
//   }
// };


// export const getMonthlyAttendanceReport = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!["Admin", "SuperAdmin"].includes(user.role)) {
//       return res.status(403).json({
//         message: "Only Admin / SuperAdmin can access monthly reports"
//       });
//     }

//     // MAIN FILTERS
//     const { month, year, vendor, department, name, siteName, extra } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         message: "Month and year are required."
//       });
//     }

//     // Build month range
//     const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
//     const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

//     // MAIN QUERY
//     const query = {
//       inTime: { $gte: startDate, $lte: endDate }
//     };

//     // Optional filters
//     if (vendor) query.vendor = vendor;
//     if (department) query.department = department;
//     if (siteName) query.siteName = siteName;
//     if (name) query.name = { $regex: name, $options: "i" };

//     // Extra manpower filter
//     if (extra === "true") query.extraManpower = true;
//     if (extra === "false") query.extraManpower = false;

//     // Fetch month records
//     const records = await HrmsAttendance.find(query).sort({ inTime: 1 });

//     if (records.length === 0) {
//       return res.status(200).json({
//         message: "No attendance found for selected month with filters.",
//         summary: {
//           month: `${startDate.toLocaleString("default", { month: "long" })} ${year}`,
//           site: "N/A",
//           filtersApplied: { month, year, vendor, department, name, siteName, extra },
//           totalEmployees: 0,
//           extraManpowerCount: 0,
//           totalPresentDays: 0,
//         },
//         groupedEmployees: [],
//         extraManpower: [],
//       });
// }


//     // ============================
//     // 1️⃣ GROUP NORMAL EMPLOYEES
//     // ============================
//     const map = new Map();

//     records.forEach((rec) => {
//       const key = `${rec.name}_${rec.vendor}_${rec.department}`;

//       if (!rec.extraManpower) {
//         if (!map.has(key)) {
//           map.set(key, {
//             name: rec.name,
//             vendor: rec.vendor,
//             department: rec.department,
//             category: rec.category,
//             siteName: rec.siteName,
//             attendanceDays: 0,
//             totalHours: 0,
//             firstSeen: rec.inTime,
//             lastSeen: rec.inTime,
//             detailedRecords: []
//           });
//         }

//         const emp = map.get(key);

//         emp.attendanceDays++;

//         if (rec.inTime < emp.firstSeen) emp.firstSeen = rec.inTime;
//         if (rec.inTime > emp.lastSeen) emp.lastSeen = rec.inTime;

//         if (rec.outTime) {
//           const hours = (rec.outTime - rec.inTime) / (1000 * 60 * 60);
//           emp.totalHours += hours;
//         }

//         emp.detailedRecords.push({
//           date: rec.inTime,
//           inTime: rec.inTime,
//           outTime: rec.outTime,
//           hoursWorked: rec.outTime
//             ? (rec.outTime - rec.inTime) / (1000 * 60 * 60)
//             : 0
//         });
//       }
//     });

//     const groupedEmployees = Array.from(map.values());

//     // ===================================
//     // 2️⃣ EXTRA MANPOWER REPORT
//     // ===================================
//     const extraRecords = records.filter((r) => r.extraManpower === true);
//     const extraMap = new Map();

//     extraRecords.forEach((rec) => {
//       const key = `${rec.name}_${rec.vendor}_${rec.department}`;

//       if (!extraMap.has(key)) {
//         extraMap.set(key, {
//           name: rec.name,
//           vendor: rec.vendor,
//           department: rec.department,
//           status: rec.extraStatus,
//           siteName: rec.siteName,
//           totalDays: 0,
//           firstDay: rec.inTime,
//           lastDay: rec.inTime,
//           dateRanges: []
//         });
//       }

//       const e = extraMap.get(key);

//       e.totalDays++;

//       if (rec.inTime < e.firstDay) e.firstDay = rec.inTime;
//       if (rec.inTime > e.lastDay) e.lastDay = rec.inTime;

//       e.dateRanges.push({
//         date: rec.inTime,
//         inTime: rec.inTime,
//         outTime: rec.outTime
//       });
//     });

//     const extraManpower = Array.from(extraMap.values());

//     // ============================
//     // 3️⃣ MONTH SUMMARY
//     // ============================
//     const responseSummary = {
//       month: `${startDate.toLocaleString("default", { month: "long" })} ${year}`,
//       filtersApplied: { month, year, vendor, department, name, siteName, extra },
//       totalEmployees: groupedEmployees.length,
//       extraManpowerCount: extraManpower.length,
//       totalPresentDays: records.length
//     };

//     // ============================
//     // 4️⃣ RESPONSE
//     // ============================
//     res.status(200).json({
//       message: "Monthly attendance report generated successfully",
//       summary: responseSummary,
//       groupedEmployees,
//       extraManpower
//     });

//   } catch (error) {
//     console.error("Monthly Report Error:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: error.message
//     });
//   }
// };







