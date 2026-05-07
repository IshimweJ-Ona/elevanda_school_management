const prisma = require("../config/prisma");
const { logAction } = require("../services/audit.service");
const { backupEntity } = require("../services/backup.service");
const { sendPaymentNotification } = require("../services/email.service");

const payInvoice = async (req, res) => {
  const { invoiceId, amount, method } = req.body;

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status === "PAID") {
        throw new Error("Invoice already paid");
      }

      const paymentRecord = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method
        }
      });

      const totalPaid = await tx.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true }
      });

      const paidAmount = totalPaid._sum.amount || 0;
      if (paidAmount >= invoice.amount) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" }
        });
      }

      await tx.feeAccount.update({
        where: { studentId: invoice.studentId },
        data: {
          balance: {
            decrement: amount
          }
        }
      });

      return paymentRecord;
    });

    await logAction({
      adminId: req.user.id,
      action: "PAY_INVOICE",
      entity: "Payment",
      entityId: payment.id
    });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { student: { include: { user: true } } } });
    if (invoice?.student?.user) {
      await sendPaymentNotification({
        user: invoice.student.user,
        invoice,
        amount,
        method
      }).catch((err) => {
        console.warn("Payment email notification failed:", err.message);
      });
    }

    await backupEntity("payments", {
      paymentId: payment.id,
      invoiceId,
      amount,
      method,
      paidBy: req.user.id,
      createdAt: new Date().toISOString()
    });

    res.json({ message: "Payment successful", payment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { invoiceId } = req.query;
    const payments = await prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : {},
      include: {
        invoice: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true, email: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requestRefund = async (req, res) => {
  const { amount, reason } = req.body;

  try {
    if (!amount || amount <= 0) {
      throw new Error("Please provide a valid refund amount");
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { feeAccount: true }
    });

    if (!student) {
      throw new Error("Student profile not found");
    }

    const balance = student.feeAccount?.balance || 0;

    if (amount > balance) {
      throw new Error("Refund amount cannot exceed available balance");
    }

    const transaction = await prisma.transaction.create({
      data: {
        studentId: student.id,
        type: "WITHDRAW",
        amount,
        status: "PENDING"
      }
    });

    await backupEntity("refund-requests", {
      transactionId: transaction.id,
      studentId: student.id,
      amount,
      reason,
      requestedBy: req.user.id,
      createdAt: new Date().toISOString()
    });

    res.json({ message: "Refund request submitted", transaction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { payInvoice, requestRefund, getPayments };
