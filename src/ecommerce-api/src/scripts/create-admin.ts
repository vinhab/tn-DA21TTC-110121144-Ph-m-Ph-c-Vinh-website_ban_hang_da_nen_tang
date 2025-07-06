import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const email = 'admin@example.com';
  const exists = await userModel.findOne({ email });

  if (!exists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await userModel.create({
      name: 'Super Admin',
      email,
      password: hashed,
      role: 'admin',
    });
    console.log('✅ Admin created');
  } else {
    console.log('⚠️ Admin already exists');
  }

  await app.close();
}
createAdmin();
