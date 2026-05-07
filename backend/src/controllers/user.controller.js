const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/hash.util");
const { backupEntity } = require("../services/backup.service");
const { buildExportPayload } = require("../services/export.service");

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone_number) updates.phone_number = phone_number;
    if (password) updates.password = await hashPassword(password);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update values provided" });
    }

    if (email || phone_number) {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            email ? { email } : undefined,
            phone_number ? { phone_number } : undefined
          ].filter(Boolean),
          id: { not: req.user.id }
        }
      });

      if (existing) {
        return res.status(400).json({ message: "Email or phone number already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        isVerified: true
      }
    });

    await backupEntity("user-updates", user);

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportData = async (req, res) => {
  try {
    const payload = await buildExportPayload(req.user);
    const fileName = `school-export-${req.user.role.toLowerCase()}-${Date.now()}.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, exportData };
