import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'general';
    const uploadPath = path.join(__dirname, '../../uploads', uploadType);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: /jpeg|jpg|png|gif|webp/,
    video: /mp4|avi|mov|wmv|flv|mkv/,
    document: /pdf|doc|docx|txt|xls|xlsx|ppt|pptx/,
    general: /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|mp4|zip|rar/
  };

  const uploadType = req.params.type || 'general';
  const allowedPattern = allowedTypes[uploadType] || allowedTypes.general;
  const extname = allowedPattern.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedPattern.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${uploadType}: ${allowedPattern}`));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: fileFilter
});

export default upload;
