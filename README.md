# TaskFlow 🚀

TaskFlow is a premium, high-aesthetic, tab-based task management application built using **Next.js**, **Tailwind CSS**, and **Prisma ORM** with a **PostgreSQL** database. It features secure email authentication utilizing secure One-Time Passwords (OTPs) and a responsive, modern light-theme user interface.

## ✨ Features

- **Dynamic Task Boards**: Create and organize custom task **Lists** (e.g., Work, Personal, Shopping).
- **Task Customization**:
  - Set Due Dates and specific Times using a detailed datetime selector.
  - Set Priority levels (`low`, `medium`, `high`) and Status tags (`pending`, `in_progress`, `completed`).
  - Search and filter tasks instantaneously.
- **Secure Email Authentication (OTP)**:
  - Sign up/Register with email confirmation.
  - A secure, 6-digit hashed OTP is sent to the user's inbox on signup, login-unverified, and password resets.
  - Expiry checking: OTPs are hashed using `bcrypt` and automatically cleaned up from the database upon validation or expiration check.
  - Rate limiting protects against spam/refresh loop abuses.
- **Robust Route Guarding**: Next.js route protection using stateless JWT session cookies managed securely via middleware (`proxy.ts`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: Custom JWT Session cookies + `bcrypt` password hashing + Gmail SMTP Nodemailer OTPs.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) and **npm** installed. You will also need a running **PostgreSQL** database.

### 1. Clone the repository and install dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory of the project and add your Database URL, Session Secret and SMTP credentials.

### 3. Initialize the Database

Push the database schema using Prisma:

```bash
npx prisma db push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience TaskFlow!

---

## 📂 Project Structure

- `app/`: Next.js frontend pages and API routing.
  - `api/auth/`: REST endpoints for login, signup, verification, resending OTP, password-reset.
  - `api/lists/` & `api/tasks/`: REST endpoints for list and task database CRUD actions.
  - `dashboard/`: The main interactive workspace.
- `lib/`: Utility modules, session handlers, database client singleton, validation schemas, and types.
- `prisma/`: Prisma schema file describing the relational models (`User`, `Otp`, `List`, `Task`).
- `proxy.ts`: Middleware proxy ensuring authorization for protected routes.
