import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, type, data } = body;

    if (!to || !type) {
      return NextResponse.json({ error: 'Missing required fields (to, type)' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let subject = '';
    let htmlContent = '';

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    if (type === 'reset_password') {
      subject = 'Reset Password Akun SIPANTAU Anda';
      const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(to)}`;
      
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SIPANTAU BPS</h1>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Permintaan Reset Password</h2>
            <p style="color: #475569; line-height: 1.6;">
              Halo, kami menerima permintaan untuk mengatur ulang password akun SIPANTAU Anda.
              Silakan klik tombol di bawah ini untuk melanjutkan proses reset password.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password Sekarang
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              Jika Anda tidak meminta reset password ini, Anda dapat mengabaikan email ini dengan aman.
              Tautan ini dikirimkan khusus untuk alamat email <strong>${to}</strong>.
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} SIPANTAU - Badan Pusat Statistik Kota Semarang.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'account_approved') {
      subject = 'Pendaftaran Akun SIPANTAU Disetujui';
      
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Selamat! Akun Disetujui 🎉</h1>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Pendaftaran Berhasil Diverifikasi</h2>
            <p style="color: #475569; line-height: 1.6;">
              Halo <strong>${data?.name || ''}</strong>,<br/><br/>
              Pendaftaran akun SIPANTAU Anda dengan email <strong>${to}</strong> telah disetujui oleh Administrator.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Anda sekarang dapat masuk (Login) ke dalam sistem dan mulai mengakses beranda serta tugas-tugas yang akan diberikan oleh mentor.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${origin}/" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Login ke SIPANTAU
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              Selamat bergabung dan selamat menjalankan aktivitas harian di BPS Kota Semarang!
            </p>
          </div>
        </div>
      `;
    } else if (type === 'account_rejected') {
      subject = 'Pendaftaran Akun SIPANTAU Ditolak';
      
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f43f5e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Status Pendaftaran Akun</h1>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Pendaftaran Ditolak Administrator</h2>
            <p style="color: #475569; line-height: 1.6;">
              Halo <strong>${data?.name || ''}</strong>,<br/><br/>
              Mohon maaf, pendaftaran akun SIPANTAU Anda dengan email <strong>${to}</strong> saat ini tidak dapat disetujui oleh Administrator.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Terdapat kemungkinan adanya ketidaksesuaian kelengkapan data diri, salah mengisi profil keanggotaan/peran, atau sedang tidak terdaftar dalam gelombang magang instansi saat ini.
            </p>
            <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="color: #e11d48; margin-top: 0; margin-bottom: 8px; font-size: 16px;">Ajukan Ulang / Re-appply</h3>
              <p style="color: #475569; line-height: 1.5; margin: 0; font-size: 14px;">
                Sistem membuka kesempatan bagi Anda untuk mengajukan ulang pendaftaran. Silakan kunjungi dasbor <a href="${origin}/" style="color: #f43f5e; font-weight: bold; text-decoration: none;">Login SIPANTAU</a> dengan akun ini, kemudian klik tombol <strong>Koreksi & Ajukan Ulang Pendaftaran</strong>.
              </p>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              Jika Anda merasa terdapat kekeliruan berlanjut, silakan hubungi pihak mentor magang BPS Kota Semarang.
            </p>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const mailOptions = {
      from: `"SIPANTAU BPS" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
