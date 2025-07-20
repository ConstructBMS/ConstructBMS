import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  FileIcon,
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface FileUploadProps {
  // in MB
  allowedTypes?: string[];
  bucket?: string;
  className?: string;
  folder?: string;
  maxFileSize?: number; 
  multiple?: boolean;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  type: string;
  url: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket = 'documents',
  folder = '',
  onUploadComplete,
  onUploadError,
  maxFileSize = 10, // 10MB default
  allowedTypes = ['*'],
  multiple = false,
  className = '',
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className='w-6 h-6' />;
    if (fileType.startsWith('video/')) return <Video className='w-6 h-6' />;
    if (fileType.startsWith('audio/')) return <Music className='w-6 h-6' />;
    if (
      fileType.includes('zip') ||
      fileType.includes('rar') ||
      fileType.includes('tar')
    )
      return <Archive className='w-6 h-6' />;
    if (
      fileType.includes('pdf') ||
      fileType.includes('doc') ||
      fileType.includes('txt')
    )
      return <FileText className='w-6 h-6' />;
    return <File className='w-6 h-6' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (allowedTypes[0] !== '*' && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    const fileId = Math.random().toString(36).substr(2, 9);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      progress: 0,
      status: 'uploading',
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Update file status
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                url: urlData.publicUrl,
                progress: 100,
                status: 'completed',
              }
            : f
        )
      );

      onUploadComplete?.(urlData.publicUrl, file.name);
    } catch (error) {
      console.error('Upload error:', error);

      setUploadedFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'error' } : f))
      );

      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    if (!multiple && fileArray.length > 1) {
      onUploadError?.('Multiple files not allowed');
      return;
    }

    fileArray.forEach(uploadFile);
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Drop files here or click to upload
        </h3>
        <p className='text-sm text-gray-500 mb-4'>
          Maximum file size: {maxFileSize}MB
          {allowedTypes[0] !== '*' && (
            <span className='block'>
              Allowed types: {allowedTypes.join(', ')}
            </span>
          )}
        </p>
        <button
          onClick={openFileInput}
          disabled={isUploading}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </button>
        <input
          ref={fileInputRef}
          type='file'
          multiple={multiple}
          accept={allowedTypes[0] !== '*' ? allowedTypes.join(',') : undefined}
          onChange={e => handleFileSelect(e.target.files)}
          className='hidden'
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-900'>Uploaded Files</h4>
          <div className='space-y-2'>
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : file.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  {getFileIcon(file.type)}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {file.name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {file.status === 'uploading' && (
                    <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                  )}
                  {file.status === 'completed' && (
                    <a
                      href={file.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className='p-1 hover:bg-gray-200 rounded transition-colors'
                  >
                    <X className='w-4 h-4 text-gray-400' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
