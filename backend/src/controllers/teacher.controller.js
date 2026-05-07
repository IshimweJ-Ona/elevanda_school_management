const prisma = require("../config/prisma");
const { backupEntity } = require("../services/backup.service");

const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, status } = req.body;
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
      include: { classes: true }
    });

    if (!teacher || !teacher.classes.some((classRecord) => classRecord.id === classId)) {
      return res.status(403).json({ message: "You can only manage attendance for assigned classes" });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId,
          classId,
          date: new Date(new Date().toDateString())
        }
      },
      create: {
        studentId,
        classId,
        status,
        date: new Date(new Date().toDateString())
      },
      update: {
        status
      }
    });

    await backupEntity("attendance-records", attendance);

    res.json({ message: "Attendance recorded", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, subject, classId } = req.body;
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
      include: { classes: true }
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    if (!teacher.classes.some((classRecord) => classRecord.id === classId)) {
      return res.status(403).json({ message: "You can only create exams for assigned classes" });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        subject,
        classId,
        teacherId: teacher.id
      }
    });

    await backupEntity("exams", exam);

    res.status(201).json({ message: "Exam created", exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const gradeStudent = async (req, res) => {
  try {
    const { examId, studentId, score, grade } = req.body;

    // Verify teacher owns this exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { teacher: true }
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!exam.teacher || exam.teacher.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only grade exams you created" });
    }

    const result = await prisma.result.create({
      data: { examId, studentId, score, grade }
    });

    await backupEntity("results", result);

    res.status(201).json({ message: "Student graded", result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
      include: {
        classes: {
          include: {
            students: true,
            timetable: true
          }
        },
        exams: true
      }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      teacher: {
        id: teacher.id,
        classes: teacher.classes.map((cls) => ({
          id: cls.id,
          name: cls.name,
          studentCount: cls.students.length,
          timetable: cls.timetable
        })),
        exams: teacher.exams
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId, subjectId } = req.body;
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
      include: { classes: true }
    });

    if (!teacher || !teacher.classes.some((classRecord) => classRecord.id === classId)) {
      return res.status(403).json({ message: "You can only create assignments for assigned classes" });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        classId,
        subjectId: subjectId || null,
        teacherId: teacher.id
      }
    });

    await backupEntity("assignments", assignment);
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const sendAnnouncement = async (req, res) => {
  try {
    const { title, body, classId } = req.body;
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
      include: { classes: true }
    });

    if (!teacher || !teacher.classes.some((classRecord) => classRecord.id === classId)) {
      return res.status(403).json({ message: "You can only announce to assigned classes" });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        audience: "CLASS",
        classId,
        authorId: req.user.id
      }
    });

    res.status(201).json({ message: "Announcement sent", announcement });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { markAttendance, createExam, gradeStudent, getTeacherDashboard, createAssignment, sendAnnouncement };
