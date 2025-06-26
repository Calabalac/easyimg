import React from 'react';

// TODO: реализовать отображение изображений, обработку кликов, стилизацию и пагинацию
export interface ImageGalleryProps {
  images: { id: string; url: string; alt?: string }[];
  onImageClick?: (id: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
  if (!images.length) {
    return <div className="text-gray-400 text-center">Нет изображений для отображения</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map(img => (
        <div key={img.id} className="cursor-pointer" onClick={() => onImageClick?.(img.id)}>
          <img src={img.url} alt={img.alt || ''} className="rounded shadow-sm w-full h-auto object-cover" />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
