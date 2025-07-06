import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { PayosService } from './payos.service';
import { OrdersService } from 'src/orders/orders.service';

@Controller('webhook')
export class PayosWebhookController {
  constructor(
    private readonly payosService: PayosService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @Public()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const rawBody = (req as any).rawBody;

      if (!rawBody) {
        console.error('❌ Không có rawBody');
        return res.status(400).send('Missing rawBody');
      }

      let payload;
      try {
        payload = JSON.parse(rawBody.toString('utf8'));
      } catch (err) {
        console.error('❌ Lỗi parse JSON:', err);
        return res.status(400).send('Invalid JSON format');
      }

      const { data, signature } = payload;

      if (!data || !signature) {
        return res.status(400).send('Missing data or signature');
      }

      const isValid = this.payosService.verifySignature(data, signature);
      if (!isValid) {
        console.log('❌ Signature sai');
        return res.status(400).send('Invalid signature');
      }

      console.log('📦 DATA:', data);

      // Xử lý cập nhật trạng thái đơn hàng nếu cần
      if (data.orderCode) {
        const updated = await this.ordersService.markOrderAsPaid(Number(data.orderCode));
        console.log('✅ Đã cập nhật đơn hàng:', updated?._id ?? '(Không tìm thấy)');
      }

      return res.status(200).json({ message: '✅ Webhook xử lý thành công' });
    } catch (err) {
      console.error('❌ Webhook lỗi:', err);
      return res.status(500).json({ message: 'Webhook xử lý thất bại', error: String(err) });
    }
  }
}
