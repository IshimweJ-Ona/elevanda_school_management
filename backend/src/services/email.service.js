const nodemailer = require("nodemailer");

const EMAIL_FROM = process.env.EMAIL_FROM || "Elevanda School <no-reply@elevandaschool.com>";

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email service is not configured. Set RESEND_API_KEY or SMTP EMAIL_HOST, EMAIL_USER and EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: (process.env.EMAIL_SECURE || process.env.EMAI_SECURE) === "true",
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html
      })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || "Resend email delivery failed");
    }

    return body;
  }

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  return info;
};

const sendLoginNotification = async (user) => {
  const subject = "Login Notification for Elevanda School";
  const text = `Hello ${user.name},\n\nYou have successfully logged in to Elevanda School at ${new Date().toLocaleString()}. If this was not you, contact your administrator immediately.`;

  return await sendEmail({ to: user.email, subject, text });
};

const sendPaymentNotification = async ({ user, invoice, amount, method }) => {
  const subject = "Payment Confirmation from Elevanda School";
  const text = `Hello ${user.name},\n\nYour payment of ${amount} for invoice ${invoice.id} was successful using ${method}. Thank you for your payment.\n\nInvoice amount: ${invoice.amount}\nStatus: ${invoice.status}`;

  return await sendEmail({ to: user.email, subject, text });
};

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@elevandaschool.com";

const sendRegistrationPendingNotification = async (user) => {
  const subject = "Registration Received – Elevanda School";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: #1D4ED8; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Elevanda School Management</h1>
      </div>
      <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
        <h2 style="color: #1e293b; margin-top: 0;">Thank you for registering, ${user.name}!</h2>
        <p style="color: #475569; line-height: 1.6;">Your account registration has been received and is currently under review by our administration team.</p>
        <div style="background: #EFF6FF; border-left: 4px solid #1D4ED8; padding: 16px; border-radius: 4px; margin: 24px 0;">
          <p style="color: #1e40af; margin: 0; font-weight: bold;">⏳ Awaiting Admin Approval</p>
          <p style="color: #3b5cc2; margin: 8px 0 0;">This process may take up to <strong>48 hours</strong>. You will receive an email notification once your account is approved or if further action is required.</p>
        </div>
        <p style="color: #475569; line-height: 1.6;">If you have any questions or concerns, please do not hesitate to contact us:</p>
        <p style="margin: 0;"><a href="mailto:${SUPPORT_EMAIL}" style="color: #1D4ED8; font-weight: bold;">${SUPPORT_EMAIL}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Elevanda School Management System &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text: `Hello ${user.name},\n\nThank you for registering with Elevanda School. Your account is under review and may take up to 48 hours to approve. You will receive an email once your registration is approved or denied.\n\nQuestions? Contact: ${SUPPORT_EMAIL}`,
    html
  });
};

const sendApprovalDecisionNotification = async (user, approved) => {
  if (approved) {
    const subject = "Your Elevanda School Account Has Been Approved ✅";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        <div style="background: #16a34a; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Elevanda School Management</h1>
        </div>
        <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
          <h2 style="color: #1e293b; margin-top: 0;">Great news, ${user.name}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">Your Elevanda School account has been reviewed and <strong style="color: #16a34a;">approved</strong> by an administrator.</p>
          <div style="background: #F0FDF4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #15803d; margin: 0; font-weight: bold;">✅ Account Approved</p>
            <p style="color: #166534; margin: 8px 0 0;">You can now log in to the Elevanda School portal using your registered credentials.</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">Welcome to the Elevanda School family! If you have any questions, feel free to reach out:</p>
          <p style="margin: 0;"><a href="mailto:${SUPPORT_EMAIL}" style="color: #1D4ED8; font-weight: bold;">${SUPPORT_EMAIL}</a></p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Elevanda School Management System &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    return await sendEmail({
      to: user.email,
      subject,
      text: `Hello ${user.name},\n\nYour Elevanda School account has been approved! You can now log in using your credentials.\n\nWelcome to the Elevanda School family!\n\nQuestions? Contact: ${SUPPORT_EMAIL}`,
      html
    });
  } else {
    const subject = "Your Elevanda School Account Request Has Been Declined";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
        <div style="background: #dc2626; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Elevanda School Management</h1>
        </div>
        <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
          <h2 style="color: #1e293b; margin-top: 0;">Hello, ${user.name}</h2>
          <p style="color: #475569; line-height: 1.6;">We regret to inform you that your request to access the Elevanda School portal has been <strong style="color: #dc2626;">declined</strong> by our administration team.</p>
          <div style="background: #FEF2F2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #991b1b; margin: 0; font-weight: bold;">❌ Access Request Declined</p>
            <p style="color: #7f1d1d; margin: 8px 0 0;">If you believe this is a mistake or would like further clarification, please contact our support team directly.</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">Contact us for further details:</p>
          <p style="margin: 0;"><a href="mailto:${SUPPORT_EMAIL}" style="color: #1D4ED8; font-weight: bold;">${SUPPORT_EMAIL}</a></p>
          <p style="color: #475569; line-height: 1.6; margin-top: 16px;">Thank you for your interest in the Elevanda School Management System.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Elevanda School Management System &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    return await sendEmail({
      to: user.email,
      subject,
      text: `Hello ${user.name},\n\nYour request to access our system has been denied. Please contact ${SUPPORT_EMAIL} for further details.\n\nThank you.`,
      html
    });
  }
};

const sendAccountCreatedNotification = async (user, password) => {
  const SUPPORT = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@elevandaschool.com";
  const subject = "Your Elevanda School Account Has Been Created";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: #1D4ED8; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Elevanda School Management</h1>
      </div>
      <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);">
        <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${user.name}!</h2>
        <p style="color: #475569; line-height: 1.6;">An administrator has created an account for you on the Elevanda School portal. Your login credentials are below:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #334155;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 8px 0 0; color: #334155;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <div style="background: #FFF7ED; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
          <p style="color: #92400e; margin: 0; font-weight: bold;">⏳ Pending Device Verification</p>
          <p style="color: #78350f; margin: 8px 0 0;">Your account access is subject to admin approval. You will receive a separate email once your device has been verified and you can log in. This may take up to <strong>48 hours</strong>.</p>
        </div>
        <p style="color: #475569; line-height: 1.6;">Once approved, please log in and change your password immediately.</p>
        <p style="color: #475569;">Questions? Contact: <a href="mailto:${SUPPORT}" style="color: #1D4ED8;">${SUPPORT}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Elevanda School Management System &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text: `Hello ${user.name},\n\nYour Elevanda School account has been created.\nEmail: ${user.email}\nTemporary Password: ${password}\n\nYour access is pending admin approval (up to 48 hours). Once approved you can log in and change your password.\n\nContact: ${SUPPORT}`,
    html
  });
};

const verifyEmailTransporter = async () => {
  if (process.env.RESEND_API_KEY) {
    return true;
  }
  const transporter = createTransporter();
  return transporter.verify();
};

module.exports = {
  sendEmail,
  sendLoginNotification,
  sendPaymentNotification,
  sendRegistrationPendingNotification,
  sendApprovalDecisionNotification,
  sendAccountCreatedNotification,
  verifyEmailTransporter
};
