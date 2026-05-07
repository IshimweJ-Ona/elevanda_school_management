const prisma = require("../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count();

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    // Attendance for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: { date: { gte: currentMonth } },
      select: { status: true }
    });

    const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
    const attendancePercentage =
      attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

    // Revenue data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _sum: { amount: true }
    });

    const revenueData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleString("default", { month: "short" });
      const monthYear =
        date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

      const monthData = revenueByMonth.find((r) => {
        const d = new Date(r.createdAt);
        return (
          d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") ===
          monthYear
        );
      });

      return { month: monthName, revenue: monthData?._sum?.amount || 0 };
    });

    const studentGrowthData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString("default", { month: "short" }),
        students: totalStudents
      };
    });

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        revenue: revenue._sum?.amount || 0,
        attendance: attendancePercentage,
        revenueData,
        studentGrowthData,
        attendanceDistribution: {
          present: presentCount,
          absent: attendance.length - presentCount,
          late: 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
