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
    quizData: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("StudyMaterial", studyMaterialSchema);
