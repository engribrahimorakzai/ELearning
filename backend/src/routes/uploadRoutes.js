import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadVideo, uploadImage, uploadDocument } from '../config/cloudinary.js';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Video upload (only instructors/admins)
router.post('/video', 
  authorize('instructor', 'admin'), 
  uploadVideo.single('file'), 
  uploadController.uploadVideo
);

// Image upload (thumbnails, avatars)
router.post('/image', 
  uploadImage.single('file'), 
  uploadController.uploadImage
);

// Document upload (PDFs, ZIPs)
router.post('/document', 
  authorize('instructor', 'admin'),
  uploadDocument.single('file'), 
  uploadController.uploadDocument
);

// Multiple files upload
router.post('/multiple', 
  authorize('instructor', 'admin'),
  uploadDocument.array('files', 10), 
  uploadController.uploadMultiple
);

// Legacy route for backward compatibility
router.post('/:type/multiple', authenticate, uploadDocument.array('files', 10), (async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    url: `/uploads/${req.params.type}/${file.filename}`,
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  }));

  res.json({
    message: 'Files uploaded successfully',
    files
  });
}));

export default router;
