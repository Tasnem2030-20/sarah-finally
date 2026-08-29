export const template = (otp, username, subject = "Confirm Your Email") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td align="center" style="background-color: #007bff; padding: 25px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Confirm Your Email</h1>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 30px; color: #333333;">
            <h2 style="color: #007bff; margin-top: 0; font-size: 20px; font-weight: bold;">Hello ${username},</h2>
            
            <p style="font-size: 14px; line-height: 1.5; color: #555555; margin-bottom: 25px;">
              Thank you for signing up with Route Academy. To complete your registration and start using your account, please get code to activate your account:
            </p>
            
            <!-- OTP Badge -->
            <div style="background-color: #007bff; color: #ffffff; font-size: 20px; font-weight: bold; padding: 10px 20px; display: inline-block; border-radius: 6px; letter-spacing: 2px; margin-bottom: 25px;">
              ${otp}
            </div>

            <p style="font-size: 13px; color: #555555; margin-bottom: 20px;">
              If you did not sign up for this account, please ignore this email.
            </p>

            <p style="font-size: 14px; color: #333333; margin: 0; line-height: 1.4;">
              Best regards,<br>
              <strong>Sara7a Application Team</strong>
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
};