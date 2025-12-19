import { asyncHandler } from '../middleware/errorHandler.js';

// Upload video
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  res.json({
    message: 'Video uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename,
    type: 'video',
    size: req.file.size,
    format: req.file.format
  });
});

// Upload image (thumbnail, avatar)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  res.json({
    message: 'Image uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename,
    type: 'image',
    size: req.file.size,
    format: req.file.format
  });
});

// Upload document (PDF, ZIP, etc)
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No document file provided' });
  }

  res.json({
    message: 'Document uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename,
    type: 'document',
    size: req.file.size,
    originalName: req.file.originalname
  });
});

// Upload multiple files
export const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const uploadedFiles = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    type: file.resource_type,
    size: file.size,
    originalName: file.originalname
  }));

  res.json({
    message: `${uploadedFiles.length} files uploaded successfully`,
    files: uploadedFiles
  });
});
