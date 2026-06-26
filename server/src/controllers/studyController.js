import StudyMaterial from "../models/StudyMaterial.js";
import { uploadBuffer } from "../config/cloudinary.js";
import { extractText } from "../services/textExtractor.js";
import {
  generateSummary,
  generateKeyTopics,
  generateQuiz,
  generateQuizFeedback,
  generateFlashcards,
  explainAnswer,
  askAboutMaterial,
} from "../services/aiService.js";

// Load a material the requesting user owns, or throw 404/403.
async function getOwnedMaterial(materialId, userId, res) {
  const material = await StudyMaterial.findById(materialId);
  if (!material) {
    res.status(404);
    throw new Error("Study material not found");
  }
  if (material.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized for this material");
  }
  return material;
}

// POST /api/upload   (multipart: file, topicName?)
export async function uploadMaterial(req, res, next) {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    const isImage = req.file.mimetype.startsWith("image/");

    const cloudinaryResult = await uploadBuffer(req.file.buffer, { isImage });
    const extractedText = await extractText({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
    });

    console.log(
      `📄 upload: ${req.file.originalname} (${req.file.mimetype}) → ${extractedText.length} chars extracted`
    );

    if (!extractedText) {
      const isDocx = req.file.mimetype.includes("wordprocessingml");
      res.status(422);
      throw new Error(
        isImage
          ? "No readable text found in this image. Use a clear, well-lit, straight photo of printed text (handwriting and blurry/angled shots don't OCR well)."
          : isDocx
          ? "This Word document appears to have no extractable text (it may be empty or only contain images)."
          : "No text found in this PDF. It's likely a scanned/image-only PDF with no text layer — re-upload the page as a photo (PNG/JPG) so OCR can read it."
      );
    }

    const topicName =
      req.body.topicName?.trim() ||
      req.file.originalname.replace(/\.[^.]+$/, "") ||
      "Untitled";

    const material = await StudyMaterial.create({
      userId: req.user._id,
      topicName,
      cloudinaryUrl: cloudinaryResult.secure_url,
      extractedText,
    });

    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
}

// POST /api/generate-summary   { materialId } or { text }
export async function generateSummaryHandler(req, res, next) {
  try {
    const { materialId, text } = req.body;

    if (materialId) {
      const material = await getOwnedMaterial(materialId, req.user._id, res);
      const summary = await generateSummary(material.extractedText);
      material.summary = summary;
      await material.save();
      return res.json({ summary, materialId: material._id });
    }

    if (!text) {
      res.status(400);
      throw new Error("Provide either materialId or text");
    }
    const summary = await generateSummary(text);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

// POST /api/generate-key-topics   { materialId } or { text }
export async function generateKeyTopicsHandler(req, res, next) {
  try {
    const { materialId, text } = req.body;

    if (materialId) {
      const material = await getOwnedMaterial(materialId, req.user._id, res);
      const keyTopics = await generateKeyTopics(material.extractedText);
      material.keyTopics = keyTopics;
      await material.save();
      return res.json({ keyTopics, materialId: material._id });
    }

    if (!text) {
      res.status(400);
      throw new Error("Provide either materialId or text");
    }
    const keyTopics = await generateKeyTopics(text);
    res.json({ keyTopics });
  } catch (err) {
    next(err);
  }
}

// POST /api/generate-flashcards   { materialId, count? }
export async function generateFlashcardsHandler(req, res, next) {
  try {
    const { materialId, text, count } = req.body;
    if (materialId) {
      const material = await getOwnedMaterial(materialId, req.user._id, res);
      const flashcards = await generateFlashcards(material.extractedText, count);
      material.flashcards = flashcards;
      await material.save();
      return res.json({ flashcards, materialId: material._id });
    }
    if (!text) {
      res.status(400);
      throw new Error("Provide either materialId or text");
    }
    res.json({ flashcards: await generateFlashcards(text, count) });
  } catch (err) {
    next(err);
  }
}

// POST /api/explain-answer   { question, options, correctAnswer, userAnswer }
export async function explainAnswerHandler(req, res, next) {
  try {
    const { question, options, correctAnswer, userAnswer } = req.body;
    if (!question || !correctAnswer) {
      res.status(400);
      throw new Error("question and correctAnswer are required");
    }
    const explanation = await explainAnswer({ question, options, correctAnswer, userAnswer });
    res.json({ explanation });
  } catch (err) {
    next(err);
  }
}

// POST /api/ask   { materialId | text, question }
export async function askHandler(req, res, next) {
  try {
    const { materialId, text, question } = req.body;
    if (!question) {
      res.status(400);
      throw new Error("question is required");
    }
    let context = text;
    if (materialId) {
      const material = await getOwnedMaterial(materialId, req.user._id, res);
      context = material.extractedText;
    }
    if (!context) {
      res.status(400);
      throw new Error("Provide materialId or text for context");
    }
    res.json({ answer: await askAboutMaterial(context, question) });
  } catch (err) {
    next(err);
  }
}

// POST /api/generate-quiz   { materialId, difficulty } or { text, difficulty }
export async function generateQuizHandler(req, res, next) {
  try {
    const { materialId, text, difficulty = "Medium", count = 5 } = req.body;

    if (materialId) {
      const material = await getOwnedMaterial(materialId, req.user._id, res);
      const quizData = await generateQuiz(material.extractedText, difficulty, count);
      material.quizData = quizData;
      await material.save();
      return res.json({ quizData, difficulty, materialId: material._id });
    }

    if (!text) {
      res.status(400);
      throw new Error("Provide either materialId or text");
    }
    const quizData = await generateQuiz(text, difficulty, count);
    res.json({ quizData, difficulty });
  } catch (err) {
    next(err);
  }
}

// POST /api/quiz-feedback   { topicName?, score, total, items: [...] }
export async function quizFeedbackHandler(req, res, next) {
  try {
    const { topicName, score, total, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("items array is required");
    }
    const feedback = await generateQuizFeedback({ topicName, score, total, items });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

// GET /api/materials   (list current user's materials, newest first)
export async function listMaterials(req, res, next) {
  try {
    const materials = await StudyMaterial.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(materials);
  } catch (err) {
    next(err);
  }
}

// POST /api/materials/:id/attempts   { score, total, difficulty }
export async function addQuizAttempt(req, res, next) {
  try {
    const material = await getOwnedMaterial(req.params.id, req.user._id, res);
    const { score, total, difficulty = "Medium" } = req.body;
    if (typeof score !== "number" || typeof total !== "number" || total <= 0) {
      res.status(400);
      throw new Error("score and total (number) are required");
    }
    const percentage = Math.round((score / total) * 100);
    material.quizAttempts.push({ score, total, percentage, difficulty });
    await material.save();
    res.status(201).json({ quizAttempts: material.quizAttempts });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/materials/:id   (remove one of the user's materials)
export async function deleteMaterial(req, res, next) {
  try {
    await getOwnedMaterial(req.params.id, req.user._id, res); // 404/403 guard
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ deleted: req.params.id });
  } catch (err) {
    next(err);
  }
}
