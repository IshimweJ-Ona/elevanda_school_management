const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const controller = require("../controllers/invoice.controller");

router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.get("/", controller.getInvoices);
router.post("/", controller.createInvoice);
router.post("/create", controller.createInvoice);

module.exports = router;
