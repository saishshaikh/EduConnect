import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const uploadDir = "./public";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Strict whitelist for allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska"
]);

const ALLOWED_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
    ".mov",
    ".mkv"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Generate random safe unique filename
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
        const safeName = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
        return cb(new Error("Invalid file format. Only JPEG, PNG, WEBP, GIF images and MP4, WEBM, MOV videos are allowed."), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB max
    }
});

export default upload;
