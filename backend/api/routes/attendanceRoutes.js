import express from "express";
import { createAttendance, getAllAttendance, getMonthlyAttendanceReport, getMonthlyAttendanceReportExcel, getMonthlyExtraPersons, getPersonMonthlyAttendance, getTodayAttendanceWithoutOutTime, updateExtraPersonStatus, updateOutTime } from "../controllers/attendanceController.js";
import { authenticateUser } from '../middleware/auth.js';
import upload from '../multerConfig.js';

const router = express.Router();

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Public (or protect with middleware later)
router.post("/create", authenticateUser, upload.single("inPhoto"), createAttendance);
router.get("/get",authenticateUser, getAllAttendance);
router.put("/out/:attendanceId", authenticateUser, upload.single("outPhoto"), updateOutTime);
router.get("/today-pending", authenticateUser, getTodayAttendanceWithoutOutTime);


router.get("/extra", authenticateUser, getMonthlyExtraPersons);
router.get("/report", authenticateUser, getMonthlyAttendanceReport);
router.get("/person", authenticateUser, getPersonMonthlyAttendance);
router.get("/report/excel", authenticateUser, getMonthlyAttendanceReportExcel);
// UPDATE extra status (approve / reject)
router.put("/extra/:attendanceId", authenticateUser, updateExtraPersonStatus);
router.get("/extra/stream", authenticateUser, (req, res) => {
  res.status(501).json({ message: "SSE not implemented yet" });
});



export default router;
