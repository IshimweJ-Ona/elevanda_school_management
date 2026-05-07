const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const deviceCheck = require("../middlewares/device.middleware");

const teacherController = require("../controllers/teacher.controller");

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.getTeacherDashboard
);

router.post(
  "/attendance",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.markAttendance
);

router.post(
  "/exam",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.createExam
);

router.post(
  "/grade",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.gradeStudent
);

router.post(
  "/assignments",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.createAssignment
);

router.post(
  "/announcements",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  deviceCheck,
  teacherController.sendAnnouncement
);

module.exports = router;
