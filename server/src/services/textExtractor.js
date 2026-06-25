import { createRequire } from "module";
import Tesseract from "tesseract.js";
import sharp from "sharp";
import mammoth from "mammoth";
import { ocrImage } from "./aiService.js";

// pdf-parse is CommonJS; load its internal lib entry to avoid the package's
// debug-mode index that tries to read a test file on import.
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse.js");

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Returns plain text for an uploaded file.
 * - PDF   → parsed locally via pdf-parse.
 * - DOCX  → raw text via mammoth.
 * - Image → vision LLM OCR (tesseract fallback).
 *
 * @param {Object}  args
 * @param {Buffer}  args.buffer    raw file buffer
 * @param {string}  args.mimetype  uploaded file mimetype
 */
export async function extractText({ buffer, mimetype }) {
  const isImage = mimetype?.startsWith("image/");

  if (mimetype === DOCX_MIME) {
    const { value } = await mammoth.extractRawText({ buffer });
    return (value || "").trim();
  }

  if (!isImage) {
    const data = await pdf(buffer);
    return (data.text || "").trim();
  }

  // Primary: vision LLM (accurate on photographed printed text).
  try {
    const visionText = await ocrImage(buffer);
    if (visionText && visionText.length > 20) {
      console.log(`🔎 vision OCR → ${visionText.length} chars`);
      return visionText;
    }
  } catch (err) {
    console.warn(`⚠️  vision OCR failed (${err.message}); falling back to Tesseract`);
  }

  // Fallback: Tesseract with preprocessing, then raw bytes.
  const cleaned = await preprocessForOcr(buffer);
  let text = await ocr(cleaned);
  if (!text) text = await ocr(buffer);
  return text;
}

// Auto-orient, grayscale, contrast-stretch, upscale small images, sharpen.
async function preprocessForOcr(buffer) {
  try {
    return await sharp(buffer)
      .rotate() // honor EXIF orientation
      .grayscale()
      .normalize() // stretch contrast
      .resize({ width: 1800, withoutEnlargement: false }) // upscale small text
      .sharpen()
      .toBuffer();
  } catch {
    return buffer; // unreadable by sharp — let tesseract try the raw bytes
  }
}

async function ocr(buffer) {
  // First run downloads the eng model + wasm core (cached after).
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, "eng");
  return (text || "").trim();
}
