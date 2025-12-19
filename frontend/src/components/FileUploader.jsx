import React, { useState } from 'react';
import { Upload, X, Video, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import toast from 'react-hot-toast';
import api from '../services/api';

export const FileUploader = ({ 
  type = 'image', // 'video', 'image', 'document'
  onUploadComplete,
  accept,
  maxSize = 5, // MB
  label
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const getAcceptTypes = () => {
    switch(type) {
      case 'video':
        return accept || 'video/mp4,video/webm,video/mov,video/avi';
      case 'image':
        return accept || 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
      case 'document':
        return accept || '.pdf,.doc,.docx,.zip,.rar';
      default:
        return accept || '*/*';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'video': return <Video className="w-8 h-8" />;
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      default: return <Upload className="w-8 h-8" />;
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setProgress(0);

      // Simulate progress (Cloudinary doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await api.post(`/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      toast.success(response.data.message || 'File uploaded successfully!');
      
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }

      // Reset
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setProgress(0);
        setUploading(false);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      clearInterval(progressInterval);
      const errorMessage = error?.response?.data?.error || error?.message || 'Upload failed';
      toast.error(errorMessage);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium mb-2 block">
            {label || `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </span>
          
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors">
              <input
                type="file"
                accept={getAcceptTypes()}
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${type}`}
              />
              <label htmlFor={`file-upload-${type}`} className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {getIcon()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size: {maxSize}MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {preview && type === 'image' && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getIcon()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Uploading... {progress}%
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {type}
                  </>
                )}
              </Button>
            </div>
          )}
        </label>
      </div>
    </Card>
  );
};
