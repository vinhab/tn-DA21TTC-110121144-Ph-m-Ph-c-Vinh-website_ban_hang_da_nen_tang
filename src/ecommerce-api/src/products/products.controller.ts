import {
    Controller, Get, Post, Put, Delete, Param, Body,
    UploadedFiles, UseInterceptors, HttpException, HttpStatus,
    Query, Patch,
    UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import cloudinary from '../upload/cloudinary.config';
import { Readable } from 'stream';
import { FilterProductDto } from './dto/filter-product.dto';
import { getSuggestedCategories } from './utils/suggestion.utils';
import { Product, ProductWithCategorySlug } from './schemas/product.schema';
import { Logger } from '@nestjs/common';

@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly service: ProductsService) { }

    // Public APIs

    @Public()
    @Get()
    findAll(@Query() filterDto: FilterProductDto) {
        return this.service.findWithFilter(filterDto);
    }

    @Public()
    @Get('search')
    searchByKeyword(@Query('keyword') keyword: string) {
        return this.service.searchByKeyword(keyword);
    }

    @Public()
    @Get(':id')
    findById(@Param('id') id: string): Promise<ProductWithCategorySlug> {
        return this.service.findById(id);
    }

    // Lấy variants theo product cha
    @Public()
    @Get(':parentId/variants')
    findVariants(@Param('parentId') parentId: string) {
        return this.service.findVariants(parentId);
    }

    // Admin APIs

    @Roles('admin')
    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    async createWithImages(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: CreateProductDto,
    ) {
        this.logger.debug(`createWithImages - received files: ${files.map(f => f.fieldname).join(', ')}`);
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            this.logger.error('Cloudinary config missing');
            throw new HttpException('Cloudinary config missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const image = files.find(f => f.fieldname === 'image');
        const gallery = files.filter(f => f.fieldname === 'gallery');

        if (!image) {
            this.logger.error('Missing image file for createWithImages');
            throw new HttpException('Ảnh đại diện (image) là bắt buộc.', HttpStatus.BAD_REQUEST);
        }

        this.logger.debug('Uploading main image...');
        const imageResult = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (err, result) => {
                    if (err) {
                        let message: string;
                        if (err instanceof Error) message = err.message;
                        else if (typeof err === 'string') message = err;
                        else message = JSON.stringify(err);
                        this.logger.error(`Upload image error: ${message}`);
                        reject(new Error(message));
                    } else {
                        resolve(result);
                    }
                },
            );
            Readable.from(image.buffer).pipe(stream);
        });

        const imageUrl = imageResult.secure_url;
        const thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_200,h_200,c_scale/');

        this.logger.debug(`Uploading gallery images count: ${gallery.length}`);
        const galleryResults = await Promise.all(
            gallery.map(file =>
                new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'products/gallery' },
                        (err, result) => {
                            if (err) {
                                this.logger.error(`Upload gallery image error: ${JSON.stringify(err)}`);
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        },
                    );
                    Readable.from(file.buffer).pipe(stream);
                }),
            ),
        );

        let specs = {};
        try {
            specs = typeof body.specifications === 'string'
                ? JSON.parse(body.specifications)
                : body.specifications || {};
        } catch {
            throw new HttpException('Invalid JSON in specifications', HttpStatus.BAD_REQUEST);
        }

        let variantAttributes = {};
        try {
            variantAttributes =
                typeof body.variantAttributes === 'string'
                    ? JSON.parse(body.variantAttributes)
                    : body.variantAttributes || {};
        } catch (e) {
            throw new HttpException('Invalid JSON in variantAttributes', HttpStatus.BAD_REQUEST);
        }

        const productData = {
            name: body.name,
            description: body.description,
            price: +body.price,
            originalPrice: body.originalPrice ? +body.originalPrice : undefined,
            stock: +body.stock,
            brand: body.brand,
            categoryId: body.categoryId,
            specifications: specs,
            imageUrl,
            thumbnailUrl,
            gallery: galleryResults.map(r => r.secure_url),
            parentId: body.parentId || null,
            variantAttributes: variantAttributes,
            isActive: body.isActive !== undefined ? body.isActive : true,
        };

        this.logger.debug(`Product data prepared for creation: ${JSON.stringify(productData)}`);

        return this.service.create(productData);
    }

    @Roles('admin')
    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        // Parse lại nếu nhận được dạng string (do FE dùng FormData + JSON.stringify)
        if (typeof body.galleryExisting === 'string') {
            try { body.galleryExisting = JSON.parse(body.galleryExisting); } catch { }
        }
        if (typeof body.galleryRemove === 'string') {
            try { body.galleryRemove = JSON.parse(body.galleryRemove); } catch { }
        }
        this.logger.debug(`Final gallery gửi vào update: ${JSON.stringify(body.gallery)}`);
        return this.service.update(id, body);
    }

    @Roles('admin')
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Roles('admin')
    @Patch(':id/activate')
    async activateProduct(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.service.update(id, { isActive });
    }

    @Public()
    @Get(':id/suggestions/grouped')
    async getGroupedSuggestions(@Param('id') id: string) {
        const mainProduct = await this.service.findById(id);
        const categorySlug = (mainProduct.categoryId as any)?.slug; // ✅ Tránh lỗi kiểu
        const suggestedCategories = getSuggestedCategories(categorySlug);

        const groupedSuggestions = await this.service.findByCategoriesGrouped(suggestedCategories, id);
        return { data: groupedSuggestions };
    }

    @Public()
    @Get(':id/similar')
    async getSimilar(@Param('id') id: string) {
        return this.service.findSimilarProducts(id);
    }

    @Public()
    @Get('/by-category-slug/:slug')
    getProductsByCategorySlug(@Param('slug') slug: string) {
        return this.service.findByCategorySlug(slug);
    }

    @Public()
    @Get('featured')
    findFeatured() {
        return this.service.findFeatured();
    }

    @Public()
    @Get('new-arrivals')
    findNewArrivals() {
        return this.service.findNewArrivals();
    }

    @Roles('admin')
    @Patch(':id')
    @UseInterceptors(AnyFilesInterceptor())
    async updateWithImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: any,
    ) {
        if (typeof body.galleryExisting === 'string') {
            try { body.galleryExisting = JSON.parse(body.galleryExisting); } catch { }
        }
        if (typeof body.galleryRemove === 'string') {
            try { body.galleryRemove = JSON.parse(body.galleryRemove); } catch { }
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const image = files.find(f => f.fieldname === 'image');
        const gallery = files.filter(f => f.fieldname === 'gallery');

        if (image) {
            this.logger.debug('Uploading new main image...');
            const imageResult = await new Promise<any>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (err, result) => {
                    if (err) {
                        this.logger.error(`Error uploading image: ${JSON.stringify(err)}`);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
                Readable.from(image.buffer).pipe(stream);
            });

            body.imageUrl = imageResult.secure_url;
            body.thumbnailUrl = body.imageUrl.replace('/upload/', '/upload/w_200,h_200,c_scale/');
            this.logger.debug(`New imageUrl set: ${body.imageUrl}`);
        } else {
            this.logger.debug('No new main image uploaded, keeping existing.');
        }

        // ==== SỬA Ở ĐÂY: MERGE GALLERY ====
        if (gallery.length > 0) {
            this.logger.debug(`Uploading ${gallery.length} new gallery images...`);
            const galleryResults = await Promise.all(
                gallery.map(file => new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'products/gallery' }, (err, result) => {
                        if (err) {
                            this.logger.error(`Error uploading gallery image: ${JSON.stringify(err)}`);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                    Readable.from(file.buffer).pipe(stream);
                })),
            );
            // Merge các ảnh gallery hiện giữ lại và ảnh mới upload
            let existing: string[] = [];
            if (typeof body.galleryExisting === 'string') {
                try { existing = JSON.parse(body.galleryExisting); } catch { existing = []; }
            } else if (Array.isArray(body.galleryExisting)) {
                existing = body.galleryExisting;
            }
            body.gallery = [...existing, ...galleryResults.map(r => r.secure_url)];
            this.logger.debug(`Merged gallery URLs: ${JSON.stringify(body.gallery)}`);
        } else {
            // Nếu không có ảnh gallery mới, chỉ giữ lại galleryExisting
            let existing: string[] = [];
            if (typeof body.galleryExisting === 'string') {
                try { existing = JSON.parse(body.galleryExisting); } catch { existing = []; }
            } else if (Array.isArray(body.galleryExisting)) {
                existing = body.galleryExisting;
            }
            body.gallery = existing;
        }

        try {
            if (typeof body.specifications === 'string') {
                body.specifications = JSON.parse(body.specifications);
                this.logger.debug(`Parsed specifications: ${JSON.stringify(body.specifications)}`);
            }
            if (typeof body.variantAttributes === 'string') {
                body.variantAttributes = JSON.parse(body.variantAttributes);
                this.logger.debug(`Parsed variantAttributes: ${JSON.stringify(body.variantAttributes)}`);
            }
        } catch (err) {
            this.logger.error('Invalid JSON in specifications or variantAttributes');
            throw new HttpException('Invalid JSON in specifications or variantAttributes', HttpStatus.BAD_REQUEST);
        }

        this.logger.debug(`Final update body vs img: ${JSON.stringify(body)}`);

        return this.service.update(id, body);
    }
    // Import products from Excel file
    @Post('import-excel')
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(@UploadedFile() file: Express.Multer.File) {
        return this.service.importProductsFromExcel(file);
    }
}
