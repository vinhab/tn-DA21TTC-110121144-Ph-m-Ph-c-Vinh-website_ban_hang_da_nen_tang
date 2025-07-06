import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import cloudinary from './cloudinary.config';
import { Readable } from 'stream';

@Controller('uploads')
export class UploadController {
    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) reject(new Error(error.message || 'Upload failed'));
                    else resolve(result);
                },
            );
            console.log('[ENV CHECK]');
            console.log('cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
            Readable.from(file.buffer).pipe(stream);
        });
        return {
            url: result['secure_url'],
            public_id: result['public_id'],
        };
    }

    @Post('gallery')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadGallery(@UploadedFiles() files: Express.Multer.File[]) {
        const uploads = await Promise.all(
            files.map(
                (file) =>
                    new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { folder: 'products/gallery' },
                            (error, result) => {
                                if (error) reject(new Error(error.message || 'Upload failed'));
                                else resolve(result);
                            },
                        );
                        Readable.from(file.buffer).pipe(stream);
                    }),
            ),
        );

        return uploads.map((result: any) => ({
            url: result.secure_url,
            public_id: result.public_id,
        }));
    }
}
