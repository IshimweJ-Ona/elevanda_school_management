const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const deviceCheck = require("../middlewares/device.middleware");

const parentController = require("../controllers/parent.controller");

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware(["PARENT"]),
    deviceCheck,
    parentController.getParentDashboard
);

module.exports = router;