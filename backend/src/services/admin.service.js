const prisma = require("../config/prisma");

const checkExistingStudent = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (student) {
    throw new Error("Student profile already exists");
  }

  return false;
};

const checkExistingParent = async (userId) => {
  const parent = await prisma.parent.findUnique({
    where: { userId }
  });

  if (parent) {
    throw new Error("Parent profile already exists");
  }

  return false;
};

const checkExistingTeacher = async (userId) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId }
  });

  if (teacher) {
    throw new Error("Teacher profile already exists");
  }

  return false;
};

/**
 * Safe user deletion with cascading deletes via transaction
 * Deletes:
 * - Sessions (auth records)
 * - Student/Teacher/Parent profiles (role data)
 * - Devices (user devices)
 * Nullifies:
 * - AdminActionLog.adminId (preserve audit trail)
 * - Device.verifiedById (preserve device records)
 * - Class.teacherId (allow deletion without cascade)
 * 
 * @param {string} userId - User ID to delete
 * @returns {Object} User that was deleted
 */
const deleteUser = async (userId) => {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Atomic deletion using transaction
  // Prisma's onDelete: Cascade will handle the cascading deletes
  const deletedUser = await prisma.$transaction(async (tx) => {
    // Delete the user (cascade will handle dependent records)
    return await tx.user.delete({
      where: { id: userId }
    });
  });

  return deletedUser;
};

module.exports = { checkExistingStudent, checkExistingParent, checkExistingTeacher, deleteUser };