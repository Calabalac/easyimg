import React, { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ImageUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number; // в байтах
  acceptedTypes?: string[];
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFileObject = (file: File): UploadedFile => ({
    id: Math.random().toString(36).substr(2, 9),
    file,
    preview: URL.createObjectURL(file),
    progress: 0,
    status: 'pending'
  });

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Неподдерживаемый тип файла. Разрешены: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return `Файл слишком большой. Максимальный размер: ${formatFileSize(maxFileSize)}`;
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach(file => {
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Превышено максимальное количество файлов (${maxFiles})`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      newFiles.push(createFileObject(file));
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Освобождаем URL объекта
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const simulateUpload = async (file: UploadedFile) => {
    // Имитация загрузки с прогрессом
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
    ));

    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress } : f
      ));
    }

    // Случайно симулируем ошибку
    const hasError = Math.random() < 0.1;
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { 
        ...f, 
        status: hasError ? 'error' as const : 'success' as const,
        error: hasError ? 'Ошибка загрузки файла' : undefined
      } : f
    ));
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      if (onUpload) {
        await onUpload(pendingFiles.map(f => f.file));
      } else {
        // Симуляция загрузки
        await Promise.all(pendingFiles.map(simulateUpload));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-primary bg-primary/10' 
            : 'border-base-300 hover:border-primary/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Перетащите изображения сюда или нажмите для выбора
            </h3>
            <p className="text-sm text-base-content/60">
              Поддерживаются: JPEG, PNG, GIF, WebP
            </p>
            <p className="text-sm text-base-content/60">
              Максимальный размер: {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Выбранные файлы ({files.length})</h4>
            <div className="space-x-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || files.every(f => f.status !== 'pending')}
                className={`btn btn-primary btn-sm ${isUploading ? 'loading' : ''}`}
              >
                {isUploading ? 'Загрузка...' : 'Загрузить'}
              </button>
              <button
                onClick={clearAll}
                className="btn btn-outline btn-sm"
                disabled={isUploading}
              >
                Очистить
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map(file => (
              <div key={file.id} className="card bg-base-100 shadow-sm border">
                <div className="card-body p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <p className="text-sm text-base-content/60">
                        {formatFileSize(file.file.size)}
                      </p>
                      
                      {/* Progress */}
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Загрузка...</span>
                            <span>{file.progress}%</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full h-2" 
                            value={file.progress} 
                            max="100"
                          />
                        </div>
                      )}

                      {/* Status */}
                      {file.status === 'success' && (
                        <div className="badge badge-success badge-sm mt-2">
                          Загружено
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="mt-2">
                          <div className="badge badge-error badge-sm">
                            Ошибка
                          </div>
                          {file.error && (
                            <p className="text-xs text-error mt-1">{file.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="btn btn-ghost btn-xs"
                      disabled={file.status === 'uploading'}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
