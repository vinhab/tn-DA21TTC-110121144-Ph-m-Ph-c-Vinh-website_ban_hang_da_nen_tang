import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    async sendConfirmationEmail(to: string, name: string, token: string) {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verifyLink = `${baseUrl}/verify-email/${token}`;

        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <p>Chào <strong>${name}</strong>,</p>
        <p>Bạn đã đăng ký tài khoản thành công. Để hoàn tất, vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào liên kết bên dưới:</p>
        <p><a href="${verifyLink}" style="color: #1a73e8;">👉 Xác minh email</a></p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Email này được gửi từ hệ thống tự động. Vui lòng không trả lời.</p>
      </div>
    `;

        return this.transporter.sendMail({
            from: `"Hệ thống" <${process.env.EMAIL_USER}>`,
            to,
            subject: '📩 Xác minh địa chỉ email của bạn',
            html,
        });
    }

    async sendResetPasswordEmail(to: string, name: string, token: string) {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password/${token}`;

        const html = `
    <p>Chào <strong>${name}</strong>,</p>
    <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
    <a href="${resetLink}">👉 Đặt lại mật khẩu</a>
    <p>Link sẽ hết hạn sau 15 phút.</p>
  `;

        return this.transporter.sendMail({
            from: `"Hệ thống" <${process.env.EMAIL_USER}>`,
            to,
            subject: '🔐 Đặt lại mật khẩu',
            html,
        });
    }


    async sendOrderConfirmation(email: string, name: string, orderCode: number) {
        const subject = `✅ Đơn hàng #${orderCode} đã được thanh toán thành công`;
        const html = `
      <p>Chào <strong>${name}</strong>,</p>
      <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được thanh toán thành công.</p>
      <p>Chúng tôi sẽ sớm xử lý và giao hàng đến bạn.</p>
    `;
        return this.sendMail(email, subject, html);
    }

    async sendOrderStatusUpdate(email: string, name: string, orderCode: number, status: string) {
        const subject = `📦 Đơn hàng #${orderCode} cập nhật trạng thái: ${status}`;
        const html = `
      <p>Chào <strong>${name}</strong>,</p>
      <p>Đơn hàng <strong>#${orderCode}</strong> của bạn vừa được cập nhật trạng thái:</p>
      <h3 style="color: #2e6da4;">${status.toUpperCase()}</h3>
    `;
        return this.sendMail(email, subject, html);
    }

    private async sendMail(to: string, subject: string, html: string) {
        return this.transporter.sendMail({
            from: `"Hệ thống" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    }
}
