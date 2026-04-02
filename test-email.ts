import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  try {
    // Verifikasi koneksi
    await transporter.verify();
    console.log("✅ Koneksi SMTP berhasil!");

    // Kirim email test
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // kirim ke diri sendiri
      subject: "Test Email NarasiKota",
      text: "Berhasil! Nodemailer berjalan dengan baik.",
    });

    console.log("✅ Email terkirim! Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

test();