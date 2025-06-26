import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    // TODO: Реализовать загрузку через API
    
    // Имитация загрузки
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setUploading(false);
    navigate('/images');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Загрузить изображения</h1>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragOver 
              ? 'border-primary bg-primary/10' 
              : 'border-base-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <svg className="w-16 h-16 mx-auto text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <div>
              <p className="text-lg font-medium">
                Перетащите изображения сюда или{' '}
                <label className="link link-primary cursor-pointer">
                  выберите файлы
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                Поддерживаются: JPEG, PNG, WebP, GIF (до 10MB каждый)
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Выбранные файлы ({files.length})</h2>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-base-content/60">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploading && uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center space-x-2">
                        <progress 
                          className="progress progress-primary w-20" 
                          value={uploadProgress[file.name]} 
                          max="100"
                        ></progress>
                        <span className="text-sm">{uploadProgress[file.name]}%</span>
                      </div>
                    )}
                    
                    {!uploading && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFile(index)}
                        title="Удалить файл"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Очистить все
              </button>
              
              <button
                className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
              >
                {uploading ? 'Загрузка...' : `Загрузить ${files.length} файл(ов)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
