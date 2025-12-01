import { Resend } from 'resend';

// Singleton Resend client
export const resendClient = new Resend(process.env.RESEND_API_KEY!);
