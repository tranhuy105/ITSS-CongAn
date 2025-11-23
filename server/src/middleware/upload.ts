import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const dishesDir = path.join(uploadDir, 'dishes');
const restaurantsDir = path.join(uploadDir, 'restaurants');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, dishesDir, restaurantsDir, tempDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        // Determine destination based on route
        let dest = tempDir;
        if (req.path.includes('/dishes')) {
            dest = dishesDir;
        } else if (req.path.includes('/restaurants')) {
            dest = restaurantsDir;
        }
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter to accept only images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};

// Configure multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

// Middleware for single file upload
export const uploadSingle = upload.single('image');

// Middleware for multiple file uploads (max 5)
export const uploadMultiple = upload.array('images', 5);
