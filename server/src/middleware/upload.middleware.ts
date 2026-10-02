import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads')
);

// Ensure directory exists safely
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Notice: Upload directory could not be created directly (normal in serverless):', err);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `waste-${uniqueSuffix}${ext}`);
  },
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, and WEBP images are supported.'));
    }
  },
});
