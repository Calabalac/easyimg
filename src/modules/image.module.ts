import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ImageController,
  ImageFileController,
  ShortUrlController,
} from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { ConfigurationModule } from './configuration.module';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
    ConfigurationModule,
    SubscriptionModule,
  ],
  controllers: [ImageController, ImageFileController, ShortUrlController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
