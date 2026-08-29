import nodemailer from "nodemailer";

export const emailSubject = {
  confirmEmail: "Confirm Your Email Address",
  resetPassword: "Reset Your Password",
};

export async function sendEmail({ to, subject, text, html, cc, bcc, attachments }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Route Academy" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
    });

    console.log(`Email Sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.log(`Error While sending Email: ${error}`);
    return error;
  }
}