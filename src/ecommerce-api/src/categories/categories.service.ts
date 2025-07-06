import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll() {
    // Lấy tất cả category, lean để lấy plain object
    const categories = await this.categoryModel.find().lean().exec();

    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const productCount = await this.productModel.countDocuments({ categoryId: c._id });
        // Nếu isActive chưa có (null hoặc undefined) thì mặc định true khi trả về
        const isActive = c.isActive === undefined ? true : c.isActive;
        return { ...c, productCount, isActive };
      }),
    );

    return categoriesWithCount;
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    // Nếu dto không có isActive thì mặc định true
    const isActive = dto.isActive !== undefined ? dto.isActive : true;
    const created = new this.categoryModel({ ...dto, slug, isActive });
    return created.save();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    // Nếu client không truyền isActive, giữ nguyên giá trị cũ
    // Nếu client truyền isActive, cập nhật luôn
    // Để đảm bảo, ta có thể fetch trước rồi merge, hoặc cập nhật trực tiếp
    const existing = await this.categoryModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Category not found');

    const updateData = {
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
    };

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updated;
  }

  async delete(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Category not found');
    return { message: 'Category deleted' };
  }
}
