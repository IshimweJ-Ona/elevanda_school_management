const prisma = require("../config/prisma");
const deviceService = require("../services/device.service");
const { sendApprovalDecisionNotification } = require("../services/email.service");

const getPendingDevices = async (req, res) => {
    try {
        const devices = await deviceService.getUnverifiedDevices();
        res.json(devices);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const approveDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await deviceService.verifyDevice(deviceId, req.user.id);

        if (device.user) {
            await sendApprovalDecisionNotification(device.user, true).catch((err) => {
                console.warn("Approval email failed:", err.message);
            });
        }

        res.json({ message: "Device verified", device });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const denyDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await prisma.device.findUnique({
            where: { id: deviceId },
            include: { user: true }
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Delete the device record so the user cannot log in
        await prisma.device.delete({ where: { id: deviceId } });

        if (device.user) {
            await sendApprovalDecisionNotification(device.user, false).catch((err) => {
                console.warn("Denial email failed:", err.message);
            });
        }

        res.json({ message: "Device registration denied and user notified" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getPendingDevices,
    approveDevice,
    denyDevice
};
