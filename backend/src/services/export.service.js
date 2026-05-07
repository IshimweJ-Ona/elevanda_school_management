const prisma = require("../config/prisma");

const maskPassword = (value) => (value ? "********" : null);

const getScope = async (user) => {
  if (user.role === "ADMIN") return { kind: "admin" };

  if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: { classes: { select: { id: true } } }
    });
    return { kind: "teacher", classIds: (teacher?.classes || []).map((item) => item.id) };
  }

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    return { kind: "student", studentIds: student ? [student.id] : [] };
  }

  if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: { students: { select: { studentId: true } } }
    });
    return { kind: "parent", studentIds: (parent?.students || []).map((item) => item.studentId) };
  }

  return { kind: "none" };
};

const buildExportPayload = async (user) => {
  const scope = await getScope(user);
  const isAdmin = scope.kind === "admin";

  const studentWhere = isAdmin
    ? {}
    : scope.kind === "teacher"
      ? { classId: { in: scope.classIds || [] } }
      : { id: { in: scope.studentIds || [] } };

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      user: true,
      class: true
    }
  });

  const studentIds = students.map((item) => item.id);
  const userIds = students.map((item) => item.userId);
  const classIds = [...new Set(students.map((item) => item.classId).filter(Boolean))];

  const [users, teachers, parents, payments, invoices, attendance, results, devices, auditLogs] = await Promise.all([
    prisma.user.findMany({
      where: isAdmin ? {} : { id: { in: userIds } }
    }),
    prisma.teacher.findMany({
      where: isAdmin ? {} : { classes: { some: { id: { in: classIds } } } },
      include: { user: true, classes: true }
    }),
    prisma.parent.findMany({
      where: isAdmin ? {} : { students: { some: { studentId: { in: studentIds } } } },
      include: { user: true, students: true }
    }),
    prisma.payment.findMany({
      where: isAdmin ? {} : { invoice: { studentId: { in: studentIds } } },
      include: { invoice: true }
    }),
    prisma.invoice.findMany({
      where: isAdmin ? {} : { studentId: { in: studentIds } },
      include: { payments: true }
    }),
    prisma.attendance.findMany({
      where: isAdmin ? {} : { studentId: { in: studentIds } }
    }),
    prisma.result.findMany({
      where: isAdmin ? {} : { studentId: { in: studentIds } },
      include: { exam: true }
    }),
    prisma.device.findMany({
      where: isAdmin ? {} : { userId: { in: userIds } },
      include: { user: true }
    }),
    prisma.adminActionLog.findMany({
      where: isAdmin ? {} : { adminId: user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    exportedAt: new Date().toISOString(),
    exportedBy: { id: user.id, role: user.role },
    users: users.map((item) => ({
      ...item,
      password: maskPassword(item.password)
    })),
    students,
    teachers,
    parents,
    payments,
    invoices,
    attendance,
    results,
    deviceVerificationLogs: devices,
    auditLogs
  };
};

module.exports = { buildExportPayload };
