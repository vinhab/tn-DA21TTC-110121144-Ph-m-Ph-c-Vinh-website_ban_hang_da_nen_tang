import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { UploadController } from '../upload/upload.controller';
import { Category, CategorySchema } from 'src/categories/schemas/category.schema';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Product.name, schema: ProductSchema
    },
    {
      name: Category.name, schema: CategorySchema

    },
    {
      name: Category.name, schema: CategorySchema

    }
    ]),
    ReviewsModule
  ],
  controllers: [ProductsController, UploadController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
