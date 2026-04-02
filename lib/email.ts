import nodemailer from "nodemailer";

// ── Konfigurasi transporter ─────────────────────────────────────
// Pastikan variabel berikut ada di .env:
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=587
//   EMAIL_USER=youremail@gmail.com
//   EMAIL_PASS=your_app_password   ← bukan password Gmail biasa, tapi App Password
//   EMAIL_FROM="NarasiKota CMS <youremail@gmail.com>"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true hanya untuk port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendOtpEmailOptions {
  to: string;
  name: string;
  otp: string;
  expiresInMinutes?: number;
}

export async function sendOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}: SendOtpEmailOptions): Promise<void> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Kode OTP - NarasiKota CMS</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:22px;font-weight:700;color:#18181b;letter-spacing:-0.5px;">
                NarasiKota <span style="color:#3b82f6;">CMS</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;padding:40px 36px;">

              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#eff6ff;border-radius:50%;padding:16px;">
                  <span style="font-size:28px;">🔐</span>
                </div>
              </div>

              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;text-align:center;">
                Kode OTP Anda
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#71717a;text-align:center;line-height:1.6;">
                Halo <strong style="color:#18181b;">${name}</strong>, gunakan kode berikut untuk
                mereset password akun NarasiKota CMS Anda.
              </p>

              <!-- OTP Box -->
              <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">
                  Kode Verifikasi
                </p>
                <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#18181b;font-family:monospace;">
                  ${otp}
                </div>
              </div>

              <!-- Warning -->
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#c2410c;">
                  ⏱ Kode ini hanya berlaku selama <strong>${expiresInMinutes} menit</strong>.
                  Jangan bagikan kode ini kepada siapapun.
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#71717a;text-align:center;line-height:1.6;">
                Jika Anda tidak meminta reset password, abaikan email ini.
                Akun Anda tetap aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                © 2026 CMS NarasiKota. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"NarasiKota CMS" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} - Kode OTP Reset Password NarasiKota CMS`,
    html: htmlContent,
    text: `Kode OTP reset password Anda: ${otp}\nBerlaku selama ${expiresInMinutes} menit.\nJangan bagikan kode ini.`,
  });
}