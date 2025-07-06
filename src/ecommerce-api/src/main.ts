import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; // ✅ Sửa tại đây
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const expressApp = express();

  // ✅ Gắn rawBody vào req để xử lý webhook PayOS
  expressApp.use(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }),
    (req, _, next) => {
      (req as any).rawBody = req.body;
      next();
    },
  );

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
  origin: true, // chấp nhận tất cả
  credentials: true,
});

  app.listen(5000, '0.0.0.0');
  
}
bootstrap();
