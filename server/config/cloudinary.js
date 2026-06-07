import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const getSafePublicId = (filename) =>
  `${Date.now()}-${filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9_-]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()}`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'orbitra-itineraries',
      resource_type: isPDF ? 'raw' : 'image',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      transformation: isPDF ? undefined : [{ quality: 'auto' }],
      public_id: getSafePublicId(file.originalname),
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Invalid file type. Upload a PDF, JPG, PNG, or WebP file.'));
      return;
    }

    cb(null, true);
  },
});

export { cloudinary, upload };
