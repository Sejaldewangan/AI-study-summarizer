# 📚 StudyAI — AI-Powered Study Platform (MERN)

Upload a **PDF or textbook photo** → extract the text → generate an **AI bulleted summary** and a **5-question quiz** (Easy / Medium / Hard) with Google Gemini. Built with MongoDB, Express, React (Vite + Tailwind), and Node.

```
upload (PDF/image) ─► Cloudinary (+ adv_ocr for images)
                        │
   pdf-parse (PDF) / Cloudinary OCR (image) ─► extractedText
                        │
            Gemini ─► summary + quiz JSON ─► MongoDB
```

## Project layout

```
online pdf summarizer/
├── server/   # Express API (auth, upload, OCR, Gemini)
└── client/   # React + Tailwind UI (Vite)
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com) account
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:5000
```

Required `server/.env` values:

| Var | What |
|-----|------|
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | any long random string |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary → Account Details |
| `GEMINI_API_KEY` | Google AI Studio key |

A healthy start logs `✅ Mongo connected` and `🚀 Server on http://localhost:5000`.

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## 3. Use it

1. Register → log in.
2. Drag a PDF or textbook photo onto the upload zone.
3. Click **Generate Summary**.
4. Pick a difficulty → **Generate 5 Questions** → take the quiz → see your score and the correct answers.

## API reference

| Method | Route | Auth | Body | Returns |
|--------|-------|------|------|---------|
| POST | `/api/auth/register` | – | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | – | `{ email, password }` | `{ token, user }` |
| POST | `/api/upload` | ✅ | multipart `file`, `topicName?` | `StudyMaterial` |
| POST | `/api/generate-summary` | ✅ | `{ materialId }` or `{ text }` | `{ summary }` |
| POST | `/api/generate-quiz` | ✅ | `{ materialId, difficulty }` | `{ quizData }` |
| GET  | `/api/materials` | ✅ | – | `StudyMaterial[]` |

Quiz shape (validated server-side — exactly 5, 4 options each, `correctAnswer` ∈ `options`):

```json
[{ "question": "", "options": ["A","B","C","D"], "correctAnswer": "" }]
```

## ⚠️ Image OCR note (important)

Image text extraction uses Cloudinary's **OCR Text Detection (`adv_ocr`) add-on**. It must be enabled on your account:
**Cloudinary Dashboard → Add-ons → OCR Text Detection → register** (has a free tier; Google-Vision-backed).

If you'd rather not use the add-on, switch to the free **tesseract.js** fallback already stubbed in
[`server/src/services/textExtractor.js`](server/src/services/textExtractor.js): `npm i tesseract.js` and
uncomment the fallback block. PDFs work with no add-on (handled locally by `pdf-parse`).

## Notes / limits

- Text sent to Gemini is trimmed to 30,000 chars per call.
- Max upload size 15 MB (PDF/PNG/JPG/WEBP).
- Quiz JSON is requested via Gemini's `responseMimeType: application/json` and re-validated before saving.
