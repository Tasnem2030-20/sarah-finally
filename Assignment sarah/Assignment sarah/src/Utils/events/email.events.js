import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../email/email.utils.js";
import { template } from "../email/generateHTML.js";

export const emailEvents = new EventEmitter();

emailEvents.on("confirmEmail", async (data) => {
  try {
    const name = data.username || data.firstName || "User";
    const subject = emailSubject?.confirmEmail || "Confirm Your Email";

    await sendEmail({
      to: data.to,
      subject,
      html: template(data.otp, name, subject),
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});

emailEvents.on("forgetPassword", async (data) => {
  try {
    const subject = emailSubject?.resetPassword || "Reset Password";
    const username = data.username || data.firstName || "User";

    await sendEmail({
      to: data.to,
      subject,
      html: template(data.otp, username, subject),
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});