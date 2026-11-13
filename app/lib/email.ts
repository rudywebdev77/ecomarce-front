import nodemailer from "nodemailer";

function getSmtpConfig() {
  const smtpHost =
    (process.env.SMTP_HOST || "").trim() ||
    (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : "");
  const smtpPort = process.env.SMTP_PORT || "465";
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
  const fromName = process.env.SMTP_FROM_NAME || "Sillhouete Atelier";

  if (!smtpUser || !smtpPass) {
    return null;
  }

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

  return {
    transporter: nodemailer.createTransport(transportConfig),
    smtpUser,
    fromName,
  };
}

// 1. Password Reset PIN Email
export async function sendResetPinEmail(toEmail: string, pin: string, customerName: string) {
  const mailSetup = getSmtpConfig();

  console.log(`\n=================================================`);
  console.log(`[CUSTOMER PASSWORD RESET PIN]`);
  console.log(`To: ${toEmail} (${customerName})`);
  console.log(`Verification PIN: ${pin}`);
  console.log(`Expires in: 15 minutes`);
  console.log(`SMTP Configured: ${Boolean(mailSetup)}`);
  console.log(`=================================================\n`);

  if (!mailSetup) {
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
    await mailSetup.transporter.sendMail({
      from: `"${mailSetup.fromName}" <${mailSetup.smtpUser}>`,
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

// 2. Real-Time Contact Inquiry Notification (Sent to Owner)
export async function sendContactInquiryNotification({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const mailSetup = getSmtpConfig();
  const targetEmail = (
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    "malikhasnain32897@gmail.com"
  ).trim();

  console.log(`\n=================================================`);
  console.log(`[REAL-TIME CONTACT INQUIRY RECEIVED]`);
  console.log(`Customer: ${name} <${email}>`);
  console.log(`Phone/WhatsApp: ${phone || "N/A"}`);
  console.log(`Subject: ${subject || "Customer Inquiry"}`);
  console.log(`Sending Real-Time Notification to: ${targetEmail}`);
  console.log(`SMTP Configured: ${Boolean(mailSetup)}`);
  console.log(`=================================================\n`);

  if (!mailSetup) {
    console.warn(`[EMAIL WARNING] SMTP not configured. Notification email not sent.`);
    return { sent: false, configured: false };
  }

  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace("+", "")}` : "";

  try {
    const info = await mailSetup.transporter.sendMail({
      from: `"${mailSetup.fromName}" <${mailSetup.smtpUser}>`,
      to: targetEmail,
      replyTo: `"${name}" <${email}>`, // Hitting Reply in Gmail goes directly to customer!
      subject: `New Store Inquiry: ${subject || "Customer Message"} - from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0e3359; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.12em; color: #0e3359; text-transform: uppercase;">SILLHOUETE</h2>
            <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #888888; text-transform: uppercase;">Real-Time Customer Inquiry Notification</p>
          </div>

          <div style="background-color: #f7fafc; border-left: 4px solid #0e3359; padding: 14px 18px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.5;">
              You have received a new customer inquiry submitted through the Sillhouete <strong>Contact Us</strong> page.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #718096; width: 120px; font-weight: 600;">Customer:</td>
              <td style="padding: 8px 0; color: #1a202c; font-weight: 700;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #1a202c;">
                <a href="mailto:${email}" style="color: #0e3359; text-decoration: underline;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-weight: 600;">Phone / WA:</td>
              <td style="padding: 8px 0; color: #1a202c;">${phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-weight: 600;">Subject:</td>
              <td style="padding: 8px 0; color: #1a202c;">${subject || "General Store Inquiry"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-weight: 600;">Received At:</td>
              <td style="padding: 8px 0; color: #1a202c;">${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</td>
            </tr>
          </table>

          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4a5568;">Customer's Message:</p>
            <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; font-size: 14px; color: #2d3748; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="text-align: center; margin: 24px 0; padding: 16px 0; border-top: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
            <a href="mailto:${email}?subject=${encodeURIComponent("Re: " + (subject || "Your Inquiry with Sillhouete"))}" 
               style="display: inline-block; background-color: #0e3359; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 8px;">
              ✉ Reply Directly via Email
            </a>
            ${
              waLink
                ? `<a href="${waLink}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                    💬 Chat on WhatsApp
                  </a>`
                : ""
            }
          </div>

          <p style="margin: 0; font-size: 12px; color: #718096; text-align: center; line-height: 1.5;">
            💡 <strong>Quick Reply:</strong> You can also simply hit <strong>Reply</strong> in your Gmail app/inbox and your message will be sent straight to ${name} (${email}).
          </p>
        </div>
      `,
    });

    console.log(`✓ Real-time inquiry notification email sent to ${targetEmail} (ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to send real-time inquiry notification:", err.message);
    return { sent: false, error: err.message };
  }
}

// 3. Real-Time Customer Reply Email (Sent from Admin to Customer)
export async function sendContactReplyEmail({
  toEmail,
  customerName,
  replyMessage,
  originalMessage,
  subject,
}: {
  toEmail: string;
  customerName: string;
  replyMessage: string;
  originalMessage?: string;
  subject?: string;
}) {
  const mailSetup = getSmtpConfig();
  const replyToEmail = (
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    "malikhasnain32897@gmail.com"
  ).trim();

  console.log(`\n=================================================`);
  console.log(`[SENDING REAL-TIME REPLY TO CUSTOMER]`);
  console.log(`To Customer: ${customerName} <${toEmail}>`);
  console.log(`Reply From: ${replyToEmail}`);
  console.log(`SMTP Configured: ${Boolean(mailSetup)}`);
  console.log(`=================================================\n`);

  if (!mailSetup) {
    console.warn(`[EMAIL WARNING] SMTP not configured. Customer reply email not sent.`);
    return { sent: false, configured: false };
  }

  try {
    const info = await mailSetup.transporter.sendMail({
      from: `"${mailSetup.fromName}" <${mailSetup.smtpUser}>`,
      to: toEmail,
      replyTo: replyToEmail,
      subject: `Re: ${subject || "Your Inquiry with Sillhouete"}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0e3359; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.12em; color: #0e3359; text-transform: uppercase;">SILLHOUETE</h2>
            <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #888888; text-transform: uppercase;">Customer Care & Support</p>
          </div>

          <p style="font-size: 15px; color: #2d3748; line-height: 1.6;">
            Dear <strong>${customerName || "Customer"}</strong>,
          </p>
          <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
            Thank you for reaching out to Sillhouete. In response to your inquiry:
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 6px; padding: 18px; margin: 20px 0; font-size: 15px; color: #166534; line-height: 1.6; white-space: pre-wrap;">
${replyMessage}
          </div>

          ${
            originalMessage
              ? `
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a0aec0;">Your Original Message:</p>
              <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; font-size: 13px; color: #718096; line-height: 1.5; font-style: italic;">
                "${originalMessage}"
              </div>
            </div>
            `
              : ""
          }

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; line-height: 1.6; text-align: center;">
            <p style="margin: 0 0 4px; font-weight: 600; color: #2d3748;">Sillhouete Atelier</p>
            <p style="margin: 0 0 4px;">DHA Phase 5, Lahore, Pakistan</p>
            <p style="margin: 0;">
              Email: <a href="mailto:${replyToEmail}" style="color: #0e3359;">${replyToEmail}</a> | WhatsApp: +92 331 0397865
            </p>
          </div>
        </div>
      `,
    });

    console.log(`✓ Real-time reply email sent to customer ${toEmail} (ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to send real-time reply email to customer:", err.message);
    return { sent: false, error: err.message };
  }
}
