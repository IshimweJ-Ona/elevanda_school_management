const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 */
router.get("/profile", authMiddleware, userController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   patch:
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 */
router.patch("/profile", authMiddleware, userController.updateProfile);
router.get("/export", authMiddleware, userController.exportData);

module.exports = router;
