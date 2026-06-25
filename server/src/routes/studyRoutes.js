import { Router } from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";
import {
  uploadMaterial,
  generateSummaryHandler,
  generateKeyTopicsHandler,
  generateQuizHandler,
  quizFeedbackHandler,
  listMaterials,
  deleteMaterial,
} from "../controllers/studyController.js";

const router = Router();

router.use(protect); // every study route requires auth

router.post("/upload", upload.single("file"), uploadMaterial);
router.post("/generate-summary", generateSummaryHandler);
router.post("/generate-key-topics", generateKeyTopicsHandler);
router.post("/generate-quiz", generateQuizHandler);
router.post("/quiz-feedback", quizFeedbackHandler);
router.get("/materials", listMaterials);
router.delete("/materials/:id", deleteMaterial);

export default router;
