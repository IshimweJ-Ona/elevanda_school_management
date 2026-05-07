const express = require("express");
const router = express.Router();

const deviceController = require("../controllers/device.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Admin access
router.get(
    "/pending",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deviceController.getPendingDevices
);

router.patch(
    "/verify/:deviceId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deviceController.approveDevice
);

router.delete(
    "/deny/:deviceId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deviceController.denyDevice
);

module.exports = router;
