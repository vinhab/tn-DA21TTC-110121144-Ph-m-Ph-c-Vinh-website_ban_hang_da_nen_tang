import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductWithCategorySlug } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Category, CategoryDocument } from 'src/categories/schemas/category.schema';
import { Review, ReviewDocument } from 'src/reviews/schemas/review.schema';
import * as XLSX from 'xlsx';

export interface ProductWithLabel extends Product {
  categoryLabel?: string;
  categorySlug?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>
  ) { }


  async findAll(): Promise<Product[]> {
    return this.model.find().populate('categoryId', 'name').exec();
  }



  async findById(id: string): Promise<ProductWithCategorySlug> {

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.model
      .findById(id)
      .populate('categoryId', 'name slug')
      .exec();

    if (!product) throw new NotFoundException('Product not found');

    const obj = product.toObject();

    // 🛠️ Fix quan trọng: ép specifications Map => Object thường
    const specs =
      obj.specifications instanceof Map
        ? Object.fromEntries(obj.specifications)
        : obj.specifications;

    return {
      ...obj,
      specifications: specs, // ✅ Ghi đè lại đúng kiểu plain object
      categorySlug: obj.categoryId?.slug ?? '',
    };
  }


  async create(dto: CreateProductDto): Promise<Product> {
    if (dto.parentId && !Types.ObjectId.isValid(dto.parentId)) {
      throw new NotFoundException('Parent product ID is invalid');
    }
    const created = new this.model(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const updateData: Partial<UpdateProductDto> = {};

    for (const [key, value] of Object.entries(dto) as [keyof UpdateProductDto, any][]) {
      if (
        value !== undefined &&
        value !== null &&
        (
          Array.isArray(value) ||                 // Giữ lại array (gallery)
          (!(typeof value === 'string') || value.trim() !== '')
        )
      ) {
        if (
          (key === 'specifications' || key === 'variantAttributes') &&
          typeof value === 'object' &&
          Object.keys(value).length === 0
        ) {
          continue;
        }
        (updateData as any)[key] = value;
      }
    }

    // *** Bỏ hoàn toàn block xử lý galleryExisting/galleryRemove ở đây ***
    // => Chỉ lấy đúng field gallery đã merge từ Controller

    const product = await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();

    console.log('UpdateData truyền vào Mongo:', updateData); // Để debug lần cuối
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }





  async delete(id: string): Promise<{ message: string }> {
    const product = await this.model.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted successfully' };
  }

  async findWithFilter(filterDto: FilterProductDto) {
    const {
      page = '1',
      limit = '100',
      categoryId,
      search,
      priceMin,
      priceMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const match: any = {};
    if (!filterDto.showInactive || filterDto.showInactive !== 'true') {
      match.isActive = true; // Mặc định chỉ show sản phẩm đang hoạt động
    }

    if (categoryId) {
      match.categoryId = new Types.ObjectId(categoryId);
    }

    if (search) {
      match.name = { $regex: search, $options: 'i' };
    }

    if (priceMin || priceMax) {
      match.price = {};
      if (priceMin) match.price.$gte = parseFloat(priceMin);
      if (priceMax) match.price.$lte = parseFloat(priceMax);
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const result = await this.model.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          ratingCount: { $size: '$reviews' },
          ratingAvg: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          reviews: 0, // loại bỏ danh sách đánh giá chi tiết
          'categoryInfo.__v': 0,
        },
      },
      { $sort: sortOptions },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    const total = await this.model.countDocuments(match);

    return {
      data: result.map((p) => ({
        ...p,
        categoryLabel: p.categoryInfo?.name || '',
        categorySlug: p.categoryInfo?.slug || '',
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }


  // Lấy variants theo parentId
  async findVariants(parentId: string): Promise<Product[]> {
    return this.model.find({ parentId: parentId, isActive: true }).exec();
  }

  async findByCategories(slugs: string[], excludeId?: string): Promise<ProductWithLabel[]> {
    const categories = await this.categoryModel
      .find({ slug: { $in: slugs } }, '_id')
      .lean()
      .exec();

    const categoryIds = categories.map(c => c._id);

    const products = await this.model
      .find({
        categoryId: { $in: categoryIds },
        ...(excludeId && { _id: { $ne: excludeId } }),
      })
      .populate('categoryId', 'name slug')
      .exec();

    return products.map(p => {
      const obj = p.toObject() as ProductWithLabel;
      obj.categoryLabel = (p.categoryId as any)?.name ?? 'Không rõ';
      obj.categorySlug = (p.categoryId as any)?.slug ?? '';
      return obj;
    });
  }

  async findByCategoriesGrouped(slugs: string[], excludeId?: string): Promise<Record<string, ProductWithLabel[]>> {
    const categories = await this.categoryModel
      .find({ slug: { $in: slugs } }, '_id name slug')
      .lean();

    const categoryMap = Object.fromEntries(categories.map(c => [c._id.toString(), c.name]));

    const products = await this.model
      .find({ categoryId: { $in: categories.map(c => c._id) }, _id: { $ne: excludeId } })
      .populate('categoryId', 'name slug')
      .exec();

    const grouped: Record<string, ProductWithLabel[]> = {};

    for (const p of products) {
      const obj = p.toObject() as ProductWithLabel;
      const cat = p.categoryId as any;
      obj.categoryLabel = cat?.name ?? 'Khác';
      obj.categorySlug = cat?.slug ?? 'other';

      const key = obj.categoryLabel;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(obj);
    }

    return grouped;
  }
  async findSimilarProducts(id: string): Promise<Product[]> {
    const main = await this.findById(id)
    const categoryId = (main.categoryId as any)?._id

    return this.model.find({
      categoryId,
      _id: { $ne: id },
      isActive: true,
    })
      .limit(100)
      .exec()
  }

  async searchByKeyword(keyword: string): Promise<Product[]> {
    const regex = new RegExp(keyword, 'i');

    return this.model
      .find({
        $or: [
          { name: regex },
          { description: regex },
          { brand: regex },
          { 'specifications.cpu': regex },
          { 'specifications.gpu': regex },
          { 'specifications.ram': regex },
          { 'specifications.storage': regex },
          { 'specifications.display': regex },
          { 'specifications.size': regex },
          { 'specifications.resolution': regex },
          { 'specifications.refresh': regex },
          { 'specifications.panel': regex },
          { 'specifications.led': regex },
          { 'specifications.wired': regex },
          // bạn có thể thêm các trường khác tùy sản phẩm
        ],
        isActive: true,
      })
      .populate('categoryId', 'name slug')
      .exec();
  }

  async findByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Category not found');

    return this.model.find({ categoryId: category._id, isActive: true })
      .populate('categoryId', 'name slug') // ✅ phải có populate
      .select('+specifications')           // ✅ nếu specs là select: false trong schema
      .exec();
  }

  async findFeatured(): Promise<Product[]> {
    return this.model.find({ isActive: true, isFeatured: true }).limit(100).exec();
  }

  async findNewArrivals(): Promise<Product[]> {
    return this.model.find({ isActive: true })
      .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
      .limit(100) // Giới hạn số lượng sản phẩm mới
      .exec();
  }

  // Nhập sản phẩm từ file Excel
  async importProductsFromExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    // Map fields phù hợp schema
    const products = await Promise.all(rows.map(async (p: any) => {
      // Lấy categoryId nếu có category name/slug
      let categoryId = undefined;
      if (p.category) {
        const cat = await this.categoryModel.findOne({
          $or: [
            { name: p.category },
            { slug: p.category },
          ]
        });
        categoryId = cat?._id;
      }
      // Parse specifications nếu có
      let specifications = {};
      try {
        if (p.specifications) {
          specifications = typeof p.specifications === 'string'
            ? JSON.parse(p.specifications)
            : p.specifications;
        }
      } catch {
        specifications = {};
      }
      const gallery = p.gallery
        ? (typeof p.gallery === 'string'
          ? p.gallery.split(',').map((x: string) => x.trim())
          : Array.isArray(p.gallery) ? p.gallery : [])
        : [];

      return {
        name: p.name,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        stock: Number(p.stock) || 0,
        brand: p.brand,
        description: p.description,
        imageUrl: p.imageUrl,
        thumbnailUrl: p.thumbnailUrl,
        gallery,
        isActive: p.isActive === false ? false : true,
        isFeatured: p.isFeatured === true,
        specifications,
        categoryId,
      };
    }));

    // Validate & insert
    const validProducts = products.filter(p => p.name && p.price);
    await this.model.insertMany(validProducts);

    return { message: `Đã thêm ${validProducts.length} sản phẩm thành công!` };
  }
}
