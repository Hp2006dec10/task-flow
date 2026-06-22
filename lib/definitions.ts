import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits.' }).regex(/^\d+$/, { message: 'OTP must contain only numbers.' }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits.' }).regex(/^\d+$/, { message: 'OTP must contain only numbers.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        otp?: string[];
      };
      message?: string;
      success?: boolean;
      activeOtp?: boolean;
    }
  | undefined;

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

export const ListSchema = z.object({
  name: z.string().min(1, { message: 'List name is required.' }).max(100).trim(),
});

export const TaskSchema = z.object({
  name: z.string().min(1, { message: 'Task name is required.' }).max(200).trim(),
  description: z.string().max(1000).trim().optional().nullable(),
  dueDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  listId: z.string().uuid({ message: 'A valid list ID is required.' }),
});

export type CreateListInput = z.infer<typeof ListSchema>;
export type CreateTaskInput = z.infer<typeof TaskSchema>;

