import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [(arr) => arr.length === 4, "Each question needs exactly 4 options"],
    },
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    difficulty: { type: String, default: "Medium" },
  },
  { timestamps: { createdAt: "takenAt", updatedAt: false } }
);

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicName: { type: String, required: true, trim: true },
    cloudinaryUrl: { type: String, required: true },
    extractedText: { type: String, required: true },
    summary: { type: String, default: "" },
    keyTopics: { type: String, default: "" },
    flashcards: { type: [{ front: String, back: String, _id: false }], default: [] },
    quizData: { type: [questionSchema], default: [] },
    quizAttempts: { type: [attemptSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("StudyMaterial", studyMaterialSchema);
