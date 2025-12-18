import express from "express";
import { createAttendance, getAllAttendance, getMonthlyAttendanceReport, getMonthlyAttendanceReportExcel, getMonthlyCategoryDepartmentReport, getMonthlyExtraPersons, getPersonMonthlyAttendance, getTodayAttendanceWithoutOutTime, updateExtraPersonStatus, updateOutTime } from "../controllers/attendanceController.js";
import { authenticateUser } from '../middleware/auth.js';
import upload from '../multerConfig.js';

const router = express.Router();

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Public (or protect with middleware later)
router.post(
  "/create",
  authenticateUser,
  (req, res, next) => {
    upload.single("inPhoto")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Upload failed", error: err.message });
      }
      next();
    });
  },
  createAttendance
);

router.get("/get",authenticateUser, getAllAttendance);
router.put("/out/:attendanceId", authenticateUser, upload.single("outPhoto"), updateOutTime);
router.get("/today-pending", authenticateUser, getTodayAttendanceWithoutOutTime);


router.get("/extra", authenticateUser, getMonthlyExtraPersons);
router.get("/report", authenticateUser, getMonthlyAttendanceReport);
router.get("/person", authenticateUser, getPersonMonthlyAttendance);
router.get("/getReport", authenticateUser, getMonthlyCategoryDepartmentReport);
router.get("/report/excel", authenticateUser, getMonthlyAttendanceReportExcel);
// UPDATE extra status (approve / reject)
router.put("/extra/:attendanceId", authenticateUser, updateExtraPersonStatus);
router.get("/extra/stream", authenticateUser, (req, res) => {
  res.status(501).json({ message: "SSE not implemented yet" });
});



export default router;
