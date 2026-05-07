# Elevanda School Management System V2

Version 2 is the admin, teacher, and student school operations system. It is frontend-separated from Version 1, but it intentionally uses the same database so Version 1 can continue handling the parent portal, parent registration, and parent approval workflow.

## Demo youtube video
[Watch the Elevanda School Management System demo](https://www.youtube.com/watch?v=m58axtMOSqw)


## Features

- JWT authentication with stored sessions
- Role-separated admin, teacher, and student dashboards
- Admin-created teacher and student accounts
- Parent account visibility and approval support for Version 1 users
- User status management: active, pending, suspended, rejected
- Class, teacher, and student assignment foundations
- Attendance, assignments, results, announcements, timetables, invoices, payments, and fee accounts
- Secure password hashing with backward compatibility for old SHA-512 hashes
- Resend-first email delivery with SMTP fallback
- Prisma migrations that extend the shared database without removing Version 1 tables

## Tech Stack

- Backend: Node.js, Express, Prisma, MySQL
- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts, lucide-react
- Auth: JWT plus database-backed session records
- Email: Resend preferred, SMTP supported

## Architecture

```text
elevanda_school_management/
  backend/
    prisma/
      schema.prisma
      migrations/
    scripts/
      create-admin.js
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
      utils/
  frontend/
    src/
      app/
        components/
      services/
      styles/
```

Version 1 and Version 2 share the same `DATABASE_URL`. Version 2 keeps the existing `user`, `parent`, `device`, and session-related data compatible, then adds operational tables for school management.

## Environment

Create `backend/.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=8000
CORS_ORIGINS="http://localhost:5001,http://localhost:5173,http://localhost:3000"

ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@school.local"
ADMIN_PHONE="+250780000000"
ADMIN_PASSWORD="Admin123!"

RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="Elevanda School <no-reply@yourdomain.com>"
SUPPORT_EMAIL="support@yourdomain.com"
```

SMTP fallback variables:

```env
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="smtp-user"
EMAIL_PASS="smtp-password"
```

Create `frontend/.env` if the API is not on `http://localhost:8000`:

```env
VITE_API_BASE_URL="http://localhost:8000"
```

## Install
Install dependencies in both folders:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

Run Prisma from the `backend/` folder.

```bash
cd backend
npm run prisma:generate
```

Sync the Prisma schema to the local/shared MySQL database:

```bash
npm run prisma:push
```

This project currently uses `prisma db push` because the repository does not include a committed `prisma/migrations/` history yet. Do not run `migrate reset` on the shared Version 1 database unless you intentionally want to delete data.

Equivalent direct Prisma commands:

```bash
npx prisma generate
npx prisma db push
```

When a migration history is added later, use `npx prisma migrate deploy` during deployment.

## Seed Admin

Admins are not publicly registered. Configure the `ADMIN_*` environment variables, then run:

```bash
npm run seed-admin
```

The script creates an `ADMIN` user with `ACTIVE` status, a verified device record, and a securely hashed password. If a matching email or phone already exists, it exits without creating a duplicate.

Default local admin credentials from the example `.env` are:

- Email: `admin@school.local`
- Password: `Admin123!`

## Run

Backend only:

```bash
npm run dev --prefix backend
```

Frontend only:

```bash
npm run dev --prefix frontend
```

Both:

```bash
npm run dev
```

Default local URLs:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5001`
- API health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/api/docs`

## Authentication Flow

1. User signs in through `/api/auth/login`.
2. Backend verifies password, account status, approval, and device verification.
3. Backend creates a session and returns a JWT.
4. Frontend stores the token and user profile in `localStorage`.
5. Protected API calls send `Authorization: Bearer <token>`.
6. Expired or invalid sessions return `401`; the frontend clears auth state and returns to login.

## Roles

- `ADMIN`: manages users, parent approvals, classes, devices, analytics, finance, announcements, and audit logs.
- `TEACHER`: sees assigned classes, manages attendance, assignments, exams/results, and class announcements.
- `STUDENT`: sees personal dashboard data: class, grades, attendance, assignments, announcements, timetable, and fee information.
- `PARENT`: retained in the shared database for Version 1 only. Version 2 does not expose parent-facing frontend pages.

## Default Admin Workflow

1. Run migrations.
2. Run `npm run seed-admin`.
3. Log in to Version 2 as admin.
4. Create classes.
5. Create teacher accounts and assign teachers to classes.
6. Create student accounts with admission number/username and assigned class.
7. Verify or suspend users as needed.
8. Use device verification for pending Version 1 parent accounts.

## Production Notes

- Use a strong `JWT_SECRET`.
- Use HTTPS in production and configure `CORS_ORIGINS` to the exact frontend domains.
- Use Resend with a verified sending domain for account and password emails.
- Run `npm run prisma:migrate` during deployment, not `migrate reset`.
- Store secrets in your hosting provider's secret manager.
- Keep Version 1 pointed at the same `DATABASE_URL`.

## Troubleshooting

- `Missing required environment variables`: set `DATABASE_URL` and `JWT_SECRET` in `backend/.env`.
- `Unknown argument status` or missing Prisma models: from `backend/`, run `npm run prisma:push`, then `npm run prisma:generate`.
- `Network error: Failed to fetch`: make sure the Version 2 backend is running on `http://localhost:8000`, `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`, and `backend/.env` includes `http://localhost:5001` in `CORS_ORIGINS`.
- Login says pending approval: the user is not `ACTIVE`, not verified, or has no verified device.
- Email transporter verification fails: fix SMTP credentials or leave email disabled for local testing; login and seeding still work because email failures are logged as warnings.
- Admin seed does nothing: an account already exists with the configured admin email or phone.

## Scalability Notes

The current structure keeps controllers, services, middleware, Prisma schema, and frontend service calls separated. As the system grows, add repositories for larger domains, route-level validation schemas, background email queues, and code-splitting for large frontend dashboard modules.
