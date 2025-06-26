import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Image {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  mime_type: string;
  url: string;
  created_at: string;
}

export const ImagesPage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // TODO: Загрузить изображения из API
    // Пока заглушка
    setTimeout(() => {
      const mockImages: Image[] = [
        {
          id: '1',
          filename: 'sunset.jpg',
          original_name: 'beautiful-sunset.jpg',
          size: 2048576,
          mime_type: 'image/jpeg',
          url: 'https://picsum.photos/400/300?random=1',
          created_at: '2025-06-22T10:00:00Z'
        },
        {
          id: '2',
          filename: 'mountain.jpg',
          original_name: 'mountain-landscape.jpg',
          size: 3145728,
          mime_type: 'image/jpeg',
          url: 'https://picsum.photos/400/300?random=2',
          created_at: '2025-06-22T09:30:00Z'
        },
        {
          id: '3',
          filename: 'city.jpg',
          original_name: 'city-night.jpg',
          size: 1572864,
          mime_type: 'image/jpeg',
          url: 'https://picsum.photos/400/300?random=3',
          created_at: '2025-06-22T09:00:00Z'
        }
      ];
      setImages(mockImages);
      setLoading(false);
    }, 1000);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(images.map(img => img.id));
  };

  const deselectAllImages = () => {
    setSelectedImages([]);
  };

  const deleteSelectedImages = () => {
    // TODO: Реализовать удаление через API
    setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
    setSelectedImages([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мои изображения</h1>
        <Link to="/upload" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Загрузить
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-24 h-24 mx-auto text-base-content/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Пока нет изображений</h2>
          <p className="text-base-content/60 mb-6">
            Загрузите свои первые изображения, чтобы начать работу
          </p>
          <Link to="/upload" className="btn btn-primary">
            Загрузить изображения
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6 p-4 bg-base-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-base-content/70">
                {images.length} изображений
              </span>
              
              {selectedImages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    Выбрано: {selectedImages.length}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline btn-error"
                    onClick={deleteSelectedImages}
                  >
                    Удалить
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={deselectAllImages}
                  >
                    Отменить
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={selectedImages.length === images.length ? deselectAllImages : selectAllImages}
              >
                {selectedImages.length === images.length ? 'Снять выделение' : 'Выбрать все'}
              </button>
              
              <div className="btn-group">
                <button 
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Сетка"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Список"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Images Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                  <figure className="relative">
                    <img 
                      src={image.url} 
                      alt={image.original_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                      />
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm font-medium truncate">
                      {image.original_name}
                    </h3>
                    <div className="text-xs text-base-content/60 space-y-1">
                      <p>{formatFileSize(image.size)}</p>
                      <p>{formatDate(image.created_at)}</p>
                    </div>
                    <div className="card-actions justify-end mt-2">
                      <button className="btn btn-sm btn-ghost" title="Скачать">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button className="btn btn-sm btn-ghost" title="Поделиться">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {images.map((image) => (
                <div key={image.id} className="flex items-center p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mr-4"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                  />
                  <img 
                    src={image.url} 
                    alt={image.original_name}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{image.original_name}</h3>
                    <p className="text-sm text-base-content/60">
                      {formatFileSize(image.size)} • {formatDate(image.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn btn-sm btn-ghost" title="Скачать">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button className="btn btn-sm btn-ghost" title="Поделиться">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
