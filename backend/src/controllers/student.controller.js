const prisma = require("../config/prisma");

const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                class: {
                    include: {
                        timetable: true,
                        assignments: true,
                        announcements: {
                            orderBy: { createdAt: "desc" },
                            take: 10
                        }
                    }
                },
                feeAccount: true,
                records: true,
                attendance: {
                    orderBy: { date: "desc" },
                    take: 10
                },
                invoices: {
                    include: {
                        payments: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({
            student: {
                id: student.id,
                admissionNumber: student.admissionNumber,
                class: student.class?.name,
                balance: student.feeAccount?.balance || 0,
                grades: student.records,
                assignments: student.class?.assignments || [],
                attendance: student.attendance,
                announcements: student.class?.announcements || [],
                timetable: student.class?.timetable || [],
                invoices: student.invoices.map((invoice) => ({
                    id: invoice.id,
                    amount: invoice.amount,
                    status: invoice.status,
                    dueDate: invoice.dueDate,
                    payments: invoice.payments.map((payment) => ({
                        id: payment.id,
                        amount: payment.amount,
                        method: payment.method,
                        createdAt: payment.createdAt
                    }))
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getStudentDashboard };
