# To do list app

Create a to do list app to store different list of tasks. Each list acts as a tab and contains tasks within each list.
Each task has a name, description, due date, priority, and status. The status can be "pending", "in progress", or "completed".
The app should allow user to add, edit, delete, and mark tasks as complete.

## Tech stack

### Frontend and UI
- Next.js
- Tailwind CSS
- TypeScript
- Lucide React

### Backend
- Next.js

### Storage
- PostgreSQL
- Prisma

Store users, lists and tasks. 
- Each list must be associated with a user id. 
- Each task must be associated with a user id and list id.

### Authentication
- Email + Password with tokens
- Nodemailer for account confirmation OTPs

Newly registering user have to confirm their account using OTP. Also provide Forgot Password feature with confirmation using OTP and resetting the password.