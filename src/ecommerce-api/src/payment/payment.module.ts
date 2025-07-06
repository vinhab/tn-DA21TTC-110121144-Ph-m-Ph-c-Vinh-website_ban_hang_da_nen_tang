import { forwardRef, Module } from '@nestjs/common';
import { PayosService } from './payos.service';
import { OrdersModule } from 'src/orders/orders.module';
import { PayosWebhookController } from './payos-webhook.controller';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [PayosService],
  controllers: [PayosWebhookController],
  exports: [PayosService], // Cho phép OrdersModule dùng PayosService
})
export class PaymentModule {}
