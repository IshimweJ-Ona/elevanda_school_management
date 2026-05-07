const prisma = require("../config/prisma");
const crypto = require("crypto");
const { hashPassword, comparePassword } = require("../utils/hash.util");
const { generateToken } = require("../utils/jwt.util");
const { backupEntity } = require("./backup.service");
const { sendLoginNotification, sendRegistrationPendingNotification, sendAccountCreatedNotification } = require("./email.service");


const generateTemporaryPassword = () => {
  return crypto.randomBytes(9).toString("base64url");
};

const createUser = async ({ name, email, phone_number, password, role, classId, admissionNumber, createdByAdmin }) => {
  const generatedPassword = password || generateTemporaryPassword();
  const normalizedPhone = phone_number || `school:${admissionNumber || crypto.randomUUID()}`;

  if (!name || !email || !generatedPassword || !role) {
    throw new Error("Missing required user fields");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phone_number: normalizedPhone }
      ]
    }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(generatedPassword);
  const isAdminCreatedOperationalUser = Boolean(createdByAdmin) && ["STUDENT", "TEACHER"].includes(role);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone_number: normalizedPhone,
      password: hashedPassword,
      role,
      status: role === "ADMIN" || isAdminCreatedOperationalUser ? "ACTIVE" : "PENDING",
      // V2 teacher/student accounts are manually created by admins and can sign in immediately.
      // Parent accounts remain pending for the Version 1 approval flow.
      isVerified: role === "ADMIN" || isAdminCreatedOperationalUser
    }
  });

  if (role === "STUDENT") {
    await prisma.student.create({
      data: {
        userId: user.id,
        classId: classId || null,
        admissionNumber: admissionNumber || null,
        feeAccount: {
          create: { balance: 0 }
        }
      }
    });
  }

  if (role === "TEACHER") {
    await prisma.teacher.create({
      data: { userId: user.id }
    });
  }

  if (role === "PARENT") {
    await prisma.parent.create({
      data: { userId: user.id }
    });
  }

  await prisma.device.create({
    data: {
      userId: user.id,
      isVerified: role === "ADMIN" || isAdminCreatedOperationalUser,
      verifiedAt: role === "ADMIN" || isAdminCreatedOperationalUser ? new Date() : null,
      verifiedById: createdByAdmin || null
    }
  });

  await backupEntity("user-creations", {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  });

  // Send credential + pending notice email for admin-created accounts
  if (createdByAdmin && role !== "ADMIN") {
    await sendAccountCreatedNotification(user, generatedPassword).catch((err) => {
      console.warn("Account creation email failed:", err.message);
    });
  }

  return user;
};

const registerParent = async (data) => {
  const { name, email, phone_number, password } = data;

  const user = await createUser({
    name,
    email,
    phone_number,
    password,
    role: "PARENT",
    createdByAdmin: null
  });

  await sendRegistrationPendingNotification(user).catch((err) => {
    console.warn("Parent registration email failed:", err.message);
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      isVerified: user.isVerified
    }
  };
};

const createSession = async (userId, token, tokenHash) => {
  return prisma.session.create({
    data: {
      userId,
      token,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
};

const login = async (data) => {
  const { email, phone_number, password } = data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        phone_number ? { phone_number } : undefined
      ].filter(Boolean)
    },
    include: { devices: true }
  });

  if (!user) throw new Error("User not found");

  const valid = comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid password");
  if (user.status === "SUSPENDED") throw new Error("Account is suspended. Contact the school administrator.");
  if (user.status === "REJECTED") throw new Error("Account request was rejected. Contact the school administrator.");
  if (user.status === "PENDING") {
    const pendingErr = new Error("Your account is pending admin approval. You will be notified by email once approved.");
    pendingErr.code = "PENDING_APPROVAL";
    throw pendingErr;
  }

  const device = user.devices[0];
  if (!device) {
    const pendingErr = new Error("Your account registration is still pending admin approval. You will receive an email once approved.");
    pendingErr.code = "PENDING_APPROVAL";
    throw pendingErr;
  }
  if (!device.isVerified) {
    const pendingErr = new Error("Your account is pending admin approval. This may take up to 48 hours. You will be notified by email.");
    pendingErr.code = "PENDING_APPROVAL";
    throw pendingErr;
  }

  const token = generateToken(user);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await createSession(user.id, token, tokenHash);

  await sendLoginNotification(user).catch((err) => {
    console.warn("Login email notification failed:", err.message);
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    },
    token
  };
};

module.exports = { createUser, registerParent, login, generateTemporaryPassword };

