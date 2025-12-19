import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dvhli9awv',
  api_key: '692746459479667',
  api_secret: '8ek1Pui9kersOFE5pi_fYl3_BGs'
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [{ quality: 'auto' }]
  }
});

// Storage for images (thumbnails, avatars)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

// Storage for documents (PDFs, ZIPs)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'rar', 'txt']
  }
});

// Multer upload middleware
export const uploadVideo = multer({ 
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

export const uploadImage = multer({ 
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

export const uploadDocument = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for documents
  }
});

// Helper function to delete from cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default cloudinary;
