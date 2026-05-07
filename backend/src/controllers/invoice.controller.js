const prisma = require("../config/prisma");
const { logAction } = require("../services/audit.service");
const { backupEntity } = require("../services/backup.service");

const createInvoice = async (req, res) => {
  try {
    const { studentId, amount, dueDate } = req.body;

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        amount,
        dueDate,
        status: "PENDING"
      }
    });

    await logAction({
      adminId: req.user.id,
      action: "CREATE_INVOICE",
      entity: "Invoice",
      entityId: invoice.id
    });

    await backupEntity("invoices", {
      invoiceId: invoice.id,
      studentId,
      amount,
      dueDate,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString()
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {})
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createInvoice, getInvoices };

