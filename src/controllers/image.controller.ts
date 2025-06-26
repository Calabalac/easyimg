import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImageService } from '../services/image.service';
import { UpdateImageDto, ImageQueryDto } from '../dto/image.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { AuthUser } from '../interfaces/user.interface';
import { memoryStorage } from 'multer';

@Controller('api/images')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.MANAGER)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('📁 File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
    });
    return this.imageService.uploadImage(file, user.id, user.role);
  }

  @Get()
  @Public()
  async listImages(@Query() query: ImageQueryDto) {
    return this.imageService.listImages(query);
  }

  @Get(':id')
  @Public()
  async getImage(@Param('id') id: string) {
    return this.imageService.getImageById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateImage(
    @Param('id') id: string,
    @Body() updateDto: UpdateImageDto,
    @CurrentUser() _user: AuthUser,
  ) {
    return this.imageService.updateImage(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteImage(@Param('id') id: string, @CurrentUser() _user: AuthUser) {
    await this.imageService.deleteImage(id);
    return { message: 'Image deleted successfully' };
  }
}

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImageFileController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':filename')
  @Public()
  async getImageFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const imageBuffer = await this.imageService.getImageFile(filename);
      const metadata = await this.imageService.getImageById(
        filename.split('.')[0],
      );

      res.set({
        'Content-Type': metadata.mimetype,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      });

      res.send(imageBuffer);
    } catch (error) {
      res.status(404).json({ message: 'Image not found' });
    }
  }

  @Get('thumb/:filename')
  @Public()
  async getThumbnail(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const thumbnailBuffer = await this.imageService.getThumbnail(filename);

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': thumbnailBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      });

      res.send(thumbnailBuffer);
    } catch (error) {
      res.status(404).json({ message: 'Thumbnail not found' });
    }
  }
}

@Controller('i')
@UseGuards(JwtAuthGuard)
export class ShortUrlController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':shortUrl')
  @Public()
  async redirectToImage(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
  ) {
    try {
      const metadata = await this.imageService.getImageByShortUrl(shortUrl);
      const imageBuffer = await this.imageService.getImageFile(
        metadata.filename,
      );

      res.set({
        'Content-Type': metadata.mimetype,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      });

      res.send(imageBuffer);
    } catch (error) {
      res.status(404).json({ message: 'Image not found' });
    }
  }
}
