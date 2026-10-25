import { ENV } from '../config/env.js';

export async function notifyProjectEnquiry(enquiry, fallbackRecipient) {
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    return false;
  }

  try {
    const nodemailerModule = await import('nodemailer');
    const nodemailer = nodemailerModule.default || nodemailerModule;
    const transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });

    const recipient = ENV.NOTIFY_EMAIL || fallbackRecipient || ENV.SMTP_USER;
    await transporter.sendMail({
      from: `"Lovanstrix Website" <${ENV.SMTP_USER}>`,
      to: recipient,
      subject: `[Lovanstrix Enquiry ${enquiry.referenceNumber}] ${enquiry.serviceNeeded} — ${enquiry.fullName}`,
      text: [
        `New Project Enquiry Received`,
        `Reference: ${enquiry.referenceNumber}`,
        `Name: ${enquiry.fullName}`,
        `Email: ${enquiry.email}`,
        `Phone: ${enquiry.phone || 'N/A'}`,
        `Company/Project: ${enquiry.companyOrProject || 'N/A'}`,
        `Service Needed: ${enquiry.serviceNeeded}`,
        `Budget Range: ${enquiry.budgetRange}`,
        `Timeline: ${enquiry.timeline}`,
        ``,
        `Project Details:`,
        enquiry.projectDetails,
      ].join('\n'),
    });
    return true;
  } catch (err) {
    console.warn('[EmailService] Notification skipped or failed:', err?.message || err);
    return false;
  }
}
