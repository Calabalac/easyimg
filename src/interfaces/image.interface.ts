export interface ImageMetadata {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  shortUrl: string;
  tags?: string[];
  description?: string;
}

export interface ImageUploadResponse {
  id: string;
  originalName: string;
  size: number;
  mimetype: string;
  shortUrl: string;
  directUrl: string;
  uploadedAt: Date;
}

export interface ImageListResponse {
  images: ImageMetadata[];
  total: number;
  page: number;
  limit: number;
}
