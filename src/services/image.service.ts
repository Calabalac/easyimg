import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import * as sharp from 'sharp';
import {
  ImageMetadata,
  ImageUploadResponse,
  ImageListResponse,
} from '../interfaces/image.interface';
import { UpdateImageDto, ImageQueryDto } from '../dto/image.dto';
import { ConfigurationService } from './configuration.service';
import { SubscriptionService } from './subscription.service';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class ImageService {
  private readonly uploadPath = join(process.cwd(), 'uploads');
  private readonly metadataPath = join(process.cwd(), 'metadata');
  private baseUrl = 'http://localhost:8347'; // Будет загружаться из конфигурации

  constructor(
    private configurationService: ConfigurationService,
    private subscriptionService: SubscriptionService,
  ) {
    this.ensureDirectories();
    this.loadBaseUrl();
  }

  private async loadBaseUrl() {
    try {
      const config = await this.configurationService.loadConfiguration();
      this.baseUrl = config.domain || 'http://localhost:8347';
    } catch (error) {
      console.warn('Failed to load domain from config, using default');
    }
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }

    try {
      await fs.access(this.metadataPath);
    } catch {
      await fs.mkdir(this.metadataPath, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    userId?: string,
    userRole?: UserRole,
  ): Promise<ImageUploadResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    console.log('🔍 Upload attempt:', {
      userId,
      userRole,
      isAdmin: userRole === UserRole.ADMIN,
    });

    // Check user quota if userId provided and user is not admin/manager
    if (
      userId &&
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.MANAGER
    ) {
      console.log('⚠️ Checking quota for regular user');
      const canUpload =
        await this.subscriptionService.canUserUploadImage(userId);
      if (!canUpload) {
        throw new ForbiddenException(
          'Upload quota exceeded. Please upgrade your subscription plan.',
        );
      }
    } else {
      console.log('✅ Admin/Manager user - skipping quota check');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 10MB');
    }

    const id = nanoid();
    const shortUrl = nanoid(8);
    const fileExtension = this.getFileExtension(file.originalname);
    const filename = `${id}${fileExtension}`;
    const filePath = join(this.uploadPath, filename);

    try {
      console.log('🔄 Processing image:', { filename, filePath });

      // Ensure directories exist
      await this.ensureDirectories();

      // Get image dimensions
      const imageBuffer = file.buffer;
      console.log('📊 Image buffer size:', imageBuffer.length);

      const metadata = await sharp(imageBuffer).metadata();
      console.log('📐 Image metadata:', metadata);

      // Save original file
      await fs.writeFile(filePath, imageBuffer);
      console.log('💾 Original file saved:', filePath);

      // Create thumbnail
      const thumbnailPath = join(this.uploadPath, `thumb_${filename}`);
      await sharp(imageBuffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      console.log('🖼️ Thumbnail created:', thumbnailPath);

      // Save metadata
      const imageMetadata: ImageMetadata = {
        id,
        originalName: file.originalname,
        filename,
        mimetype: file.mimetype,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        uploadedAt: new Date(),
        shortUrl,
        tags: [],
        description: '',
      };

      await this.saveMetadata(id, imageMetadata);
      console.log('📝 Metadata saved');

      // Increment user's image count only for regular users (not admins)
      if (
        userId &&
        userRole !== UserRole.ADMIN &&
        userRole !== UserRole.MANAGER
      ) {
        try {
          await this.subscriptionService.incrementImageCount(userId);
        } catch (error) {
          console.warn('Failed to increment image count:', error.message);
        }
      } else {
        console.log('⏭️ Skipping image count increment for admin/manager');
      }

      console.log('✅ Image processing completed successfully');

      return {
        id,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        shortUrl: `${this.baseUrl}/i/${shortUrl}`,
        directUrl: `${this.baseUrl}/images/${filename}`,
        uploadedAt: imageMetadata.uploadedAt,
      };
    } catch (error) {
      console.error('❌ Image processing error:', error);
      console.error('Error stack:', error.stack);

      // Clean up file if metadata save fails
      try {
        await fs.unlink(filePath);
      } catch {}
      throw new BadRequestException(
        'Failed to process image: ' + error.message,
      );
    }
  }

  async getImageById(id: string): Promise<ImageMetadata> {
    const metadata = await this.loadMetadata(id);
    if (!metadata) {
      throw new NotFoundException('Image not found');
    }
    return metadata;
  }

  async getImageByShortUrl(shortUrl: string): Promise<ImageMetadata> {
    const files = await fs.readdir(this.metadataPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadata = await this.loadMetadata(file.replace('.json', ''));
        if (metadata && metadata.shortUrl === shortUrl) {
          return metadata;
        }
      }
    }

    throw new NotFoundException('Image not found');
  }

  async updateImage(
    id: string,
    updateDto: UpdateImageDto,
  ): Promise<ImageMetadata> {
    const metadata = await this.getImageById(id);

    if (updateDto.description !== undefined) {
      metadata.description = updateDto.description;
    }

    if (updateDto.tags !== undefined) {
      metadata.tags = updateDto.tags;
    }

    await this.saveMetadata(id, metadata);
    return metadata;
  }

  async deleteImage(id: string): Promise<void> {
    const metadata = await this.getImageById(id);

    // Delete files
    const filePath = join(this.uploadPath, metadata.filename);
    const thumbnailPath = join(this.uploadPath, `thumb_${metadata.filename}`);
    const metadataPath = join(this.metadataPath, `${id}.json`);

    try {
      await fs.unlink(filePath);
    } catch {}

    try {
      await fs.unlink(thumbnailPath);
    } catch {}

    try {
      await fs.unlink(metadataPath);
    } catch {}
  }

  async listImages(query: ImageQueryDto): Promise<ImageListResponse> {
    const files = await fs.readdir(this.metadataPath);
    const allImages: ImageMetadata[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadata = await this.loadMetadata(file.replace('.json', ''));
        if (metadata) {
          allImages.push(metadata);
        }
      }
    }

    // Filter images
    let filteredImages = allImages;

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredImages = filteredImages.filter(
        (img) =>
          img.originalName.toLowerCase().includes(searchTerm) ||
          img.description?.toLowerCase().includes(searchTerm),
      );
    }

    if (query.tags && query.tags.length > 0) {
      filteredImages = filteredImages.filter((img) =>
        query.tags.some((tag) => img.tags?.includes(tag)),
      );
    }

    // Sort by upload date (newest first)
    filteredImages.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    return {
      images: paginatedImages,
      total: filteredImages.length,
      page,
      limit,
    };
  }

  async getImageFile(filename: string): Promise<Buffer> {
    const filePath = join(this.uploadPath, filename);

    try {
      return await fs.readFile(filePath);
    } catch {
      throw new NotFoundException('Image file not found');
    }
  }

  async getThumbnail(filename: string): Promise<Buffer> {
    const thumbnailPath = join(this.uploadPath, `thumb_${filename}`);

    try {
      return await fs.readFile(thumbnailPath);
    } catch {
      throw new NotFoundException('Thumbnail not found');
    }
  }

  private async saveMetadata(
    id: string,
    metadata: ImageMetadata,
  ): Promise<void> {
    const metadataPath = join(this.metadataPath, `${id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async loadMetadata(id: string): Promise<ImageMetadata | null> {
    const metadataPath = join(this.metadataPath, `${id}.json`);

    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }
}
