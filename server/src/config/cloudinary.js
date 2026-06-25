import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// Memory storage: we keep the buffer so pdf-parse can read PDFs locally and so
// we control the adv_ocr flag when pushing images to Cloudinary.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type. Upload a PDF, DOCX, or image (PNG/JPG/WEBP)."));
  },
});

/**
 * Upload a file buffer to Cloudinary for storage only.
 * Images go up as `image`, PDFs as `raw`. Text extraction happens separately
 * (pdf-parse for PDFs, tesseract.js for images) — no OCR add-on required.
 */
export function uploadBuffer(buffer, { isImage }) {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: isImage ? "image" : "raw",
      folder: "study-platform",
    };
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

export default cloudinary;
