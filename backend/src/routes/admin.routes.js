const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminAnalyticsController = require("../controllers/admin.analytics.controller");

router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.post("/create-student", adminController.createStudent);
router.post("/create-teacher", adminController.createTeacher);
router.post("/create-parent", adminController.createParent);

router.get("/users", adminController.getAllUsers);
router.get("/audit-logs", adminController.getAuditLogs);
router.get("/dashboard", adminAnalyticsController.getDashboardStats);
router.get("/classes", adminController.getClasses);

router.patch("/role", adminController.updateUserRole);
router.patch("/user/:userId", adminController.updateUser);
router.patch("/user/:userId/status", adminController.updateUserStatus);
router.post("/classes", adminController.createClass);
router.post("/classes/assign-student", adminController.assignStudentToClass);
router.post("/classes/assign-teacher", adminController.assignTeacherToClass);
router.post("/announcements", adminController.createAnnouncement);
router.delete("/user/:userId", adminController.deleteUser);

module.exports = router;
