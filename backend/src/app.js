const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const { env } = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const deviceRoutes = require("./routes/device.routes");
const studentRoutes = require("./routes/student.routes");
const parentRoutes = require("./routes/parent.routes");
const teacherRoutes = require("./routes/teacher.routes");
const adminRoutes = require("./routes/admin.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const paymentRoutes = require("./routes/payment.routes");
const userRoutes = require("./routes/user.routes");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Elevanda School API",
    version: "1.0.0",
    description: "School management backend API for admins, teachers, students, and parents."
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/controllers/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const app = express();

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy does not allow this origin"));
    },
    credentials: true
  })
);
app.use(helmet());

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests
});

app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
