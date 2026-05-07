const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const controller = require("../controllers/payment.controller");

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getPayments
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.payInvoice
);

router.post(
  "/pay",
  authMiddleware,
  roleMiddleware(["ADMIN", "PARENT"]),
  controller.payInvoice
);

router.post(
  "/refund",
  authMiddleware,
  roleMiddleware(["PARENT"]),
  controller.requestRefund
);

module.exports = router;
