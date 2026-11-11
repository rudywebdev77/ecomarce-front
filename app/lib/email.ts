import nodemailer from "nodemailer";

export async function sendResetPinEmail(toEmail: string, pin: string, customerName: string) {
  const smtpHost =
    (process.env.SMTP_HOST || "").trim() ||
    (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : "");
  const smtpPort = process.env.SMTP_PORT || "465";
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  console.log(`\n=================================================`);
  console.log(`[CUSTOMER PASSWORD RESET PIN]`);
  console.log(`To: ${toEmail} (${customerName})`);
  console.log(`Verification PIN: ${pin}`);
  console.log(`Expires in: 15 minutes`);
  console.log(`SMTP Configured: ${Boolean(smtpUser && smtpPass)}`);
  console.log(`=================================================\n`);

  if (!smtpUser || !smtpPass) {
    console.warn(
      `[EMAIL WARNING] Cannot send real email to ${toEmail}. SMTP_USER and SMTP_PASS are not configured.`
    );
    return {
      sent: false,
      configured: false,
      message: "SMTP email credentials (SMTP_USER / SMTP_PASS) are not configured.",
    };
  }

  try {
    const isGmail = smtpHost === "smtp.gmail.com" || (!smtpHost && smtpUser.includes("@gmail.com"));
    const transportConfig: any = isGmail
      ? {
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass },
        }
      : {
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: parseInt(smtpPort, 10) === 465,
          auth: { user: smtpUser, pass: smtpPass },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Sillhouete Atelier"}" <${smtpUser}>`,
      to: toEmail,
      subject: `Your Sillhouete Password Reset PIN: ${pin}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <div style="text-align: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.1em; color: #0e3359; text-transform: uppercase;">SILLHOUETE</h2>
            <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #888888; text-transform: uppercase;">Pakistani Luxury Couture</p>
          </div>
          <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            Dear <strong>${customerName || "Valued Customer"}</strong>,
          </p>
          <p style="font-size: 14px; color: #444444; line-height: 1.6;">
            We received a request to reset your password for your Sillhouete Customer Portal account. Please use the following 6-digit verification PIN to set a new password:
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <div style="display: inline-block; background-color: #f4f6f8; border: 2px dashed #0e3359; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #0e3359;">
              ${pin}
            </div>
            <p style="margin: 8px 0 0; font-size: 12px; color: #777777;">This PIN code is valid for 15 minutes.</p>
          </div>
          <p style="font-size: 13px; color: #666666; line-height: 1.6;">
            If you did not request this password reset, please ignore this email. Your current password remains safe and unchanged.
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #999999; text-align: center;">
            &copy; ${new Date().getFullYear()} Sillhouete Boutique. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log(`✓ Email sent successfully via SMTP to ${toEmail}`);
    return { sent: true, configured: true };
  } catch (err: any) {
    console.error("SMTP email sending failed:", err.message);
    return { sent: false, configured: true, error: err.message };
  }
}
