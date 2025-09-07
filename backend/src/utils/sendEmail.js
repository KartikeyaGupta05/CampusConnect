import nodemailer from 'nodemailer';

export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // App password (not your real email password!)
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Project" <${process.env.SMTP_USER}>`,
      to, // Receiver email
      subject,
      html, // You can also use `text`
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};