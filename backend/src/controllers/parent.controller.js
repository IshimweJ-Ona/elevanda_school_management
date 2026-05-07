const prisma =  require("../config/prisma");

const getParentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const parent = await prisma.parent.findUnique({
            where: { userId },
            include: {
                students: {
                    include: {
                        student: {
                            include: {
                                user: true,
                                class: true,
                                feeAccount: true,
                                records: true,
                                invoices: {
                                    include: { payments: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        const children = parent.students.map(ps => ({
            id: ps.student.id,
            name: ps.student.user?.name || "Student",
            class: ps.student.class?.name,
            balance: ps.student.feeAccount?.balance || 0,
            grades: ps.student.records,
            invoices: ps.student.invoices.map((invoice) => ({
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
        }));

        res.json({ children });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getParentDashboard };
