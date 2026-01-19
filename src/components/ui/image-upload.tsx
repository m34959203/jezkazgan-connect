import { useState, useRef, useCallback } from 'react';
import { Upload, X, Link as LinkIcon, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImage } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'afisha/events',
  label = 'Изображение',
  className,
  maxSize = 5,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      setError('Неподдерживаемый формат. Используйте JPG, PNG или WebP');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Файл слишком большой. Максимум ${maxSize} МБ`);
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError('Ошибка загрузки изображения. Попробуйте еще раз');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [accept, folder, maxSize, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setShowUrlInput(false);
      setUrlInputValue('');
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>

      {value ? (
        // Image preview
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <img
            src={value}
            alt="Предпросмотр"
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : showUrlInput ? (
        // URL input mode
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="pl-9"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
            </div>
            <Button type="button" onClick={handleUrlSubmit} disabled={!urlInputValue.trim()}>
              Добавить
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowUrlInput(false)}
          >
            Отмена
          </Button>
        </div>
      ) : (
        // Upload area
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center py-8 px-4">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-full mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Перетащите изображение сюда
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  JPG, PNG или WebP до {maxSize} МБ
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Выбрать файл
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUrlInput(true)}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Указать URL
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
