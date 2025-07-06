import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import * as crypto from 'crypto';

@Injectable()
export class PayosService {
  private payos: PayOS;

  constructor() {
    this.payos = new PayOS(
      process.env.PAYOS_CLIENT_ID!,
      process.env.PAYOS_API_KEY!,
      process.env.PAYOS_CHECKSUM_KEY!
    );
  }

  /**
   * ✅ Tạo liên kết thanh toán cho đơn hàng
   */
  async createPayment(
    orderCode: number,
    amount: number,
    description: string,
    returnUrl: string,
    cancelUrl: string,
  ) {
    return this.payos.createPaymentLink({
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
    });
  }

  /**
   * ✅ Kiểm tra tính hợp lệ của webhook từ PayOS
   */
  isValidWebhook(payload: any, xChecksum: string): boolean {
    const sortedPayload = Object.keys(payload)
      .sort()
      .map(key => `${key}=${payload[key]}`)
      .join('&');

    const generatedChecksum = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY!)
      .update(sortedPayload)
      .digest('hex');

    return generatedChecksum === xChecksum;
  }
  verifySignature(data: any, signature: string): boolean {
    const crypto = require('crypto');

    // ⚠️ Replace all null with empty string
    const normalized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === null || value === undefined ? '' : value,
      ])
    );

    const sorted = Object.keys(normalized)
      .sort()
      .map((key) => `${key}=${normalized[key]}`)
      .join('&');

    const expected = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY!)
      .update(sorted)
      .digest('hex');

    console.log('📦 Dữ liệu hash:', sorted);
    console.log('🔑 Kết quả hash:', expected);
    console.log('🔐 Signature nhận:', signature);

    return expected === signature;
  }

}
