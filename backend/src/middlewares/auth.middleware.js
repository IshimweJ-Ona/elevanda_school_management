const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma =  require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = header.split(" ")[1];
    if (!token) {
      throw new Error("Invalid token");
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            status: true,
            isVerified: true
          }
        }
      }
    });

    if (
      !session ||
      !session.isActive ||
      session.expiresAt.getTime() < Date.now() ||
      session.userId !== decoded.id
    ) {
      throw new Error("Session expired");
    }

    if (!session.user || session.user.status !== "ACTIVE" || !session.user.isVerified) {
      throw new Error("Account is not active");
    }

    req.user = {
      id: session.user.id,
      role: session.user.role,
      status: session.user.status,
      isVerified: session.user.isVerified,
      tokenId: decoded.iat
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
