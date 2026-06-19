import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { authenticateJWT } from '../middleware/auth';
import {
  getSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
} from '../controllers/slides.controller';

const router = Router();

// ─── Multer Configuration ────────────────────────────────────────────

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadsDir);
  },
  filename(_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_PDF_MIMES = ['application/pdf'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (file.fieldname === 'file') {
    if (ALLOWED_PDF_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for the file field'));
    }
  } else if (file.fieldname === 'preview_image') {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP images are allowed for preview'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB global limit (per-field handled below)
  },
});

const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview_image', maxCount: 1 },
]);

// ─── Multer error-handling wrapper ───────────────────────────────────

import { Response, NextFunction } from 'express';

function handleMulterUpload(req: Request, res: Response, next: NextFunction): void {
  uploadFields(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: `Upload error: ${err.message}` });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Enforce per-field size limits after upload
    const files = req.files as { file?: Express.Multer.File[]; preview_image?: Express.Multer.File[] } | undefined;
    if (files?.preview_image && files.preview_image[0] && files.preview_image[0].size > 5 * 1024 * 1024) {
      // Clean up the oversized file
      fs.unlinkSync(files.preview_image[0].path);
      res.status(400).json({ error: 'Preview image must be under 5 MB' });
      return;
    }

    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────

// Public routes
router.get('/', getSlides);
router.get('/:id', getSlideById);

// Protected routes
router.post('/', authenticateJWT, handleMulterUpload, createSlide);
router.put('/:id', authenticateJWT, updateSlide);
router.delete('/:id', authenticateJWT, deleteSlide);

export default router;
