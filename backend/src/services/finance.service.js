const prisma = require("../config/prisma");

const createInvoice = async (studentId, amount, dueDate) => {
  return await prisma.invoice.create({
    data: {
      studentId,
      amount,
      dueDate,
      status: "PENDING"
    }
  });
};

const payInvoice = async (invoiceId, amount, method) => {
  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) throw new Error("Invoice not found");

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        method
      }
    });

    await tx.feeAccount.update({
      where: { studentId: invoice.studentId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    if (amount >= invoice.amount) {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" }
      });
    }

    return payment;
  });
};



const withdraw = async (studentId, amount) => {
    return await prisma.$transaction(async (tx) => {
        const account = await tx.feeAccount.findUnique({
            where: { studentId }
        });

        if (!account) throw new Error("Account not found");

        if (account.balance < amount) {
            throw new Error("Insufficient balance");
        }

        await tx.feeAccount.update({
            where: { studentId },
            data: {
                balance: {
                    decrement: amount
                }
            }
        });

        await tx.transaction.create({
            data: {
                studentId,
                type: "WITHDRAW",
                amount,
                status: "PENDING"
            }
        });

        return { message: "Withdraw request created" };
    });
};

const requestRefund = async (studentId, amount) => {
    const account = await prisma.feeAccount.findUnique({
        where: { studentId }
    });

    if (!account || account.balance < amount) {
        throw new Error("Insufficient balance");
    }

    return await prisma.transaction.create({
        data: {
            studentId,
            type: "WITHDRAW",
            amount,
            status: "PENDING"
        }
    });
};

const getBalance = async (studentId) => {
    return await prisma.feeAccount.findUnique({
        where: { studentId }
    });
};

const getPaymentHistory = async (studentId) => {
    return await prisma.payment.findMany({
        where: {
            invoice: {
                studentId
            }
        },
        include: {
            invoice: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

module.exports = { createInvoice, payInvoice, withdraw, requestRefund, getBalance, getPaymentHistory };
