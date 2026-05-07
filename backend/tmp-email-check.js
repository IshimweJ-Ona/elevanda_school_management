require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_HOST=', process.env.EMAIL_HOST);
console.log('EMAIL_PORT=', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE=', process.env.EMAIL_SECURE);
console.log('EMAI_SECURE=', process.env.EMAI_SECURE);
console.log('EMAIL_USER=', process.env.EMAIL_USER);
console.log('EMAIL_PASS=', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
console.log('EMAIL_FROM=', process.env.EMAIL_FROM);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: (process.env.EMAIL_SECURE || process.env.EMAI_SECURE) === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('VERIFY ERROR', err.message);
    process.exit(1);
  } else {
    console.log('Transporter OK');
    process.exit(0);
  }
});
