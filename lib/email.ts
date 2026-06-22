import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@todoapp.com';
const smtpSecure = process.env.SMTP_SECURE === 'true';

const getTransporter = () => {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

export async function sendOtpEmail(email: string, name: string, otp: string) {
  const transporter = getTransporter();
  const subject = 'Verify your To-Do App Account';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">Welcome to To-Do App, ${name}!</h2>
      <p style="font-size: 16px; color: #374151;">Thank you for registering. Please confirm your account using the one-time password (OTP) below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937; background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; border: 1px dashed #d1d5db;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">This code is valid for 15 minutes. If you did not register for this account, please ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log('\n=========================================');
    console.log(`[DEV MODE] OTP Email for ${name} (${email}):`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: ${otp}`);
    console.log('=========================================\n');
    return { success: true, localDev: true };
  }

  try {
    await transporter.sendMail({
      from: `"To-Do App" <${smtpFromEmail}>`,
      to: email,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('SMTP sending error. Falling back to console logging.', error);
    console.log('\n=========================================');
    console.log(`[FALLBACK] OTP Email for ${name} (${email}):`);
    console.log(`OTP Code: ${otp}`);
    console.log('=========================================\n');
    return { success: true, fallback: true };
  }
}

export async function sendForgotPasswordEmail(email: string, name: string, otp: string) {
  const transporter = getTransporter();
  const subject = 'Reset your To-Do App Password';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">Hello, ${name}</h2>
      <p style="font-size: 16px; color: #374151;">We received a request to reset your password. Please use the verification code (OTP) below to reset your password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937; background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; border: 1px dashed #d1d5db;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">This code is valid for 15 minutes. If you did not request a password reset, please secure your account.</p>
    </div>
  `;

  if (!transporter) {
    console.log('\n=========================================');
    console.log(`[DEV MODE] Forgot Password Reset OTP for ${name} (${email}):`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: ${otp}`);
    console.log('=========================================\n');
    return { success: true, localDev: true };
  }

  try {
    await transporter.sendMail({
      from: `"To-Do App" <${smtpFromEmail}>`,
      to: email,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('SMTP sending error. Falling back to console logging.', error);
    console.log('\n=========================================');
    console.log(`[FALLBACK] Forgot Password Reset OTP for ${name} (${email}):`);
    console.log(`OTP Code: ${otp}`);
    console.log('=========================================\n');
    return { success: true, fallback: true };
  }
}
