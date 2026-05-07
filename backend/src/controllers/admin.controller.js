const prisma = require("../config/prisma");
const { createUser } = require("../services/auth.service");
const { deleteUser: deleteUserService } = require("../services/admin.service");
const { hashPassword } = require("../utils/hash.util");
const { logAction } = require("../services/audit.service");
const { backupEntity } = require("../services/backup.service");


const createStudent = async (req, res) => {
  try {
    const { name, email, phone_number, password, classId, admissionNumber } = req.body;

    const user = await createUser({
      name,
      email,
      phone_number,
      password,
      role: "STUDENT",
      classId,
      admissionNumber,
      createdByAdmin: req.user.id
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_STUDENT",
      entity: "User",
      entityId: user.id
    });

    await backupEntity("student-creations", {
      userId: user.id,
      name,
      email,
      phone_number,
      classId,
      admissionNumber,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: "Student created successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    const user = await createUser({
      name,
      email,
      phone_number,
      password,
      role: "TEACHER",
      createdByAdmin: req.user.id
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_TEACHER",
      entity: "User",
      entityId: user.id
    });

    await backupEntity("teacher-creations", {
      userId: user.id,
      name,
      email,
      phone_number,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: "Teacher created successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createParent = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    const user = await createUser({
      name,
      email,
      phone_number,
      password,
      role: "PARENT",
      createdByAdmin: req.user.id
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_PARENT",
      entity: "User",
      entityId: user.id
    });

    await backupEntity("parent-creations", {
      userId: user.id,
      name,
      email,
      phone_number,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: "Parent created successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        teacher: true,
        parent: true,
        devices: true
      }
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const allowedRoles = ["STUDENT", "TEACHER", "PARENT", "ADMIN"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role assignment" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    await backupEntity("role-updates", {
      userId,
      newRole: role,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone_number, password, status, isVerified } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone_number) updates.phone_number = phone_number;
    if (password) updates.password = await hashPassword(password);
    if (status) updates.status = status;
    if (typeof isVerified === "boolean") updates.isVerified = isVerified;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    if (email || phone_number) {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            email ? { email } : undefined,
            phone_number ? { phone_number } : undefined
          ].filter(Boolean),
          id: { not: userId }
        }
      });

      if (existing) {
        return res.status(400).json({ message: "Email or phone number already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        status: true,
        isVerified: true
      }
    });

    await backupEntity("user-updates", {
      userId: user.id,
      updates,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid user status" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        isVerified: status === "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        status: true,
        isVerified: true
      }
    });

    await prisma.device.updateMany({
      where: { userId },
      data: {
        isVerified: status === "ACTIVE",
        verifiedAt: status === "ACTIVE" ? new Date() : null,
        verifiedById: status === "ACTIVE" ? req.user.id : null
      }
    });

    await logAction({
      adminId: req.user.id,
      action: `USER_${status}`,
      entity: "User",
      entityId: userId
    });

    res.json({ message: "User status updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: { include: { user: { select: { id: true, name: true, email: true } } } },
        students: { include: { user: { select: { id: true, name: true, email: true } } } },
        timetable: true
      },
      orderBy: { name: "asc" }
    });

    res.json({ classes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, level, academicYear, teacherId } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const classRecord = await prisma.class.create({
      data: { name, level, academicYear, teacherId: teacherId || null }
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_CLASS",
      entity: "Class",
      entityId: classRecord.id
    });

    res.status(201).json({ message: "Class created", class: classRecord });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId }
    });

    await logAction({
      adminId: req.user.id,
      action: "ASSIGN_STUDENT_CLASS",
      entity: "Student",
      entityId: studentId
    });

    res.json({ message: "Student assigned to class", student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    const classRecord = await prisma.class.update({
      where: { id: classId },
      data: { teacherId }
    });

    await logAction({
      adminId: req.user.id,
      action: "ASSIGN_TEACHER_CLASS",
      entity: "Class",
      entityId: classId
    });

    res.json({ message: "Teacher assigned to class", class: classRecord });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, body, audience = "ALL", classId } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        audience,
        classId: classId || null,
        authorId: req.user.id
      }
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: announcement.id
    });

    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Use service layer for atomic deletion with cascading deletes
    const deletedUser = await deleteUserService(userId);

    // Log the deletion action
    await logAction({
      adminId: req.user.id,
      action: "DELETE_USER",
      entity: "User",
      entityId: userId
    });

    // Backup the deletion event
    await backupEntity("user-deletions", {
      userId,
      deletedUserName: deletedUser.name,
      deletedUserEmail: deletedUser.email,
      deletedBy: req.user.id,
      deletedAt: new Date().toISOString()
    });

    res.json({ 
      success: true,
      message: "User deleted successfully",
      deletedUserId: userId
    });
  } catch (err) {
    // Return structured error response
    const statusCode = err.message === "User not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.adminActionLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createStudent,
  createTeacher,
  createParent,
  getAllUsers,
  updateUserRole,
  updateUser,
  updateUserStatus,
  deleteUser,
  getAuditLogs,
  getClasses,
  createClass,
  assignStudentToClass,
  assignTeacherToClass,
  createAnnouncement
};

