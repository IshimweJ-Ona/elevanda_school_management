const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const deviceCheck = require("../middlewares/device.middleware");
const studentController = require("../controllers/student.controller")

// Protected routes
router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware(["STUDENT"]),
    deviceCheck,
    studentController.getStudentDashboard
);

module.exports = router;
