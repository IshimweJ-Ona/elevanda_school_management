const prisma = require("../config/prisma");

const deviceCheck = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const device = await prisma.device.findFirst({
            where: {
                userId,
                isVerified: true
            }
        });

        if (!device) {
            return res.status(403).json({
                message: "No verified device"
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: "Device check failed" });
    }
};

module.exports = deviceCheck;