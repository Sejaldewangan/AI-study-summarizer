import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import sharp from "sharp";

const MAX_CHARS = 30000; // keep prompts within a sane token budget

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isTransient = (err) =>
  /\b(503|429|500|502|504|overload|high demand|rate limit|unavailable|timeout|ECONNRESET)\b/i.test(
    err?.message || ""
  );

/* ───────────────────────── Gemini provider ───────────────────────── */
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// gemini-2.0-flash omitted: its free quota tends to exhaust first (429).
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-flash-latest"];

async function geminiGenerate(prompt, { json }) {
  if (!gemini) throw new Error("Gemini not configured");

  let lastErr;
  for (const name of GEMINI_MODELS) {
    const model = gemini.getGenerativeModel({ model: name });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        });
        return result.response.text();
      } catch (err) {
        lastErr = err;
        if (!isTransient(err)) throw err;
        await sleep(1200 * 2 ** attempt + Math.random() * 400);
      }
    }
  }
  throw lastErr || new Error("Gemini failed");
}

/* ────────── OpenAI-compatible providers (OpenAI + NVIDIA NIM) ────────── */
// NVIDIA NIM speaks the OpenAI Chat Completions API — same SDK, different
// baseURL + key. Free credits at https://build.nvidia.com.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const nvidia = process.env.NVIDIA_API_KEY
  ? new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    })
  : null;

// jsonMode=true only where response_format json_object is reliably supported.
// NVIDIA model support varies, so we rely on prompt + parser there instead.
function makeChatProvider(client, model, { jsonMode }) {
  return async function chatGenerate(prompt, { json }) {
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await client.chat.completions.create({
          model,
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
          ...(json && jsonMode ? { response_format: { type: "json_object" } } : {}),
        });
        return res.choices[0]?.message?.content || "";
      } catch (err) {
        lastErr = err;
        if (!isTransient(err)) throw err;
        await sleep(1200 * 2 ** attempt + Math.random() * 400);
      }
    }
    throw lastErr || new Error("Chat provider failed");
  };
}

const openaiGenerate = openai
  ? makeChatProvider(openai, process.env.OPENAI_MODEL || "gpt-4o-mini", { jsonMode: true })
  : null;

const nvidiaGenerate = nvidia
  ? makeChatProvider(
      nvidia,
      process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct",
      { jsonMode: false }
    )
  : null;

/* ──────────────────── Provider failover chain ────────────────────── */
// Default order favors free providers: Gemini → NVIDIA → OpenAI (paid).
// Set AI_PRIMARY=gemini|nvidia|openai to move one to the front.
function providerChain() {
  const all = [
    ["Gemini", geminiGenerate && gemini ? geminiGenerate : null],
    ["NVIDIA", nvidiaGenerate],
    ["OpenAI", openaiGenerate],
  ].filter(([, fn]) => typeof fn === "function");

  const primary = process.env.AI_PRIMARY?.toLowerCase();
  if (primary) {
    all.sort(([a], [b]) =>
      a.toLowerCase() === primary ? -1 : b.toLowerCase() === primary ? 1 : 0
    );
  }
  return all;
}

async function generate(prompt, { json = false } = {}) {
  const chain = providerChain();
  if (chain.length === 0) {
    throw new Error(
      "No AI provider configured. Set GEMINI_API_KEY, NVIDIA_API_KEY, or OPENAI_API_KEY."
    );
  }

  let lastErr;
  for (const [name, fn] of chain) {
    try {
      return await fn(prompt, { json });
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️  ${name} failed (${err.message}); trying next provider…`);
    }
  }
  throw new Error(`All AI providers failed. Last error: ${lastErr?.message || "unknown"}`);
}

/* ───────────────────────── Vision OCR ───────────────────────── */
// Compress + base64-encode so the inline image stays under the provider's
// request-size limit while keeping printed text legible.
async function toVisionDataUrl(buffer) {
  let width = 1500;
  let quality = 75;
  for (let i = 0; i < 6; i++) {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    if (out.length < 150_000 || width <= 700) {
      return "data:image/jpeg;base64," + out.toString("base64");
    }
    width = Math.round(width * 0.8);
    quality = Math.max(50, quality - 8);
  }
}

/**
 * Transcribe printed text from an image using a vision LLM (NVIDIA/OpenAI).
 * Far more accurate than Tesseract on photographed pages. Throws if no
 * vision-capable provider is configured or the call fails.
 */
export async function ocrImage(buffer) {
  const client = nvidia || openai;
  if (!client) throw new Error("No vision provider configured");

  const model =
    process.env.NVIDIA_VISION_MODEL ||
    (nvidia ? "meta/llama-3.2-11b-vision-instruct" : "gpt-4o-mini");

  const dataUrl = await toVisionDataUrl(buffer);

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe ALL text in this image exactly as written. Preserve reading order and line breaks. Output ONLY the raw text — no commentary, no markdown, no headings.",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      return (res.choices[0]?.message?.content || "").trim();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) throw err;
      await sleep(1200 * 2 ** attempt);
    }
  }
  throw lastErr || new Error("Vision OCR failed");
}

/* ──────────────────────────── Public API ─────────────────────────── */

/** Returns a Markdown bulleted summary of the supplied study text. */
export async function generateSummary(text) {
  const prompt = `You are a study assistant. Summarize the following material into a clear, concise bulleted list of the key points a student must know.
Rules:
- Use Markdown "-" bullets.
- Group related ideas; use short sub-bullets where helpful.
- No preamble, no closing remarks — output only the bullets.

Material:
${text.slice(0, MAX_CHARS)}`;

  const raw = await generate(prompt, { json: false });
  return raw.trim();
}

/**
 * Returns up to `count` validated MCQs:
 * [{ question, options:[4], correctAnswer }]
 */
export async function generateQuiz(text, difficulty = "Medium", count = 5) {
  const level = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
  const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20); // clamp 1–20

  const prompt = `You are an exam writer. Based ONLY on the study material below, write exactly ${n} multiple-choice questions at "${level}" difficulty that test real understanding of the CONCEPTS and FACTS in the material.

Rules:
- Each question must be about the subject matter (definitions, causes, relationships, examples, applications).
- DO NOT ask trivia about the text itself — never ask "what is the first word", "how many lines", "what comes after X word", or anything about formatting/ordering of the passage.
- Each question must stand alone and be understandable without seeing the passage.
- Exactly 4 plausible options; only one correct.
- "correctAnswer" must be EXACTLY equal to one of the 4 options (verbatim string).
- Distractors should be believable, not obviously wrong or nonsense.

Return ONLY JSON — no markdown fences, no commentary. Either a bare array, or an object {"questions": [...]}, where each item matches:
{"question":"","options":["","","",""],"correctAnswer":""}

Study material:
${text.slice(0, MAX_CHARS)}`;

  const raw = await generate(prompt, { json: true });
  const quiz = safeParseArray(raw);

  const valid = quiz.filter(
    (q) =>
      q &&
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.includes(q.correctAnswer)
  );

  if (valid.length === 0) {
    throw new Error("AI returned an invalid quiz. Please try again.");
  }
  return valid.slice(0, n);
}

/**
 * Key topics / improvement notes a student should master from the material.
 * Returns Markdown.
 */
export async function generateKeyTopics(text) {
  const prompt = `From the study material below, identify the KEY TOPICS a student must master to do well, and a note on how to improve at each.

Output Markdown only — a list of up to 10 items. For each item:
- **Topic name** — one short line: why it matters OR a concrete tip to remember/improve it.

Focus on the highest-yield concepts. No preamble, no closing remarks.

Study material:
${text.slice(0, MAX_CHARS)}`;

  const raw = await generate(prompt, { json: false });
  return raw.trim();
}

/**
 * Personalized study-focus report from quiz performance.
 * @param {Object} p
 * @param {string} p.topicName
 * @param {number} p.score
 * @param {number} p.total
 * @param {Array}  p.items  [{ question, userAnswer, correctAnswer, correct }]
 * @returns {Promise<string>} Markdown report
 */
export async function generateQuizFeedback({ topicName = "this topic", score, total, items = [] }) {
  const lines = items
    .map(
      (it, i) =>
        `${i + 1}. ${it.correct ? "✅" : "❌"} Q: ${it.question}\n   Their answer: ${
          it.userAnswer ?? "—"
        } | Correct: ${it.correctAnswer}`
    )
    .join("\n");

  const prompt = `A student took a ${total}-question quiz on "${topicName}" and scored ${score}/${total}.
Here is each question with the student's answer and the correct answer:
${lines}

Write a short, encouraging study-focus report in Markdown with exactly these three sections:
### ✅ Strengths
Topics the student clearly understands (from correct answers) — they can focus less here.
### 🎯 Focus More
The specific concepts behind the questions they missed, and what to review. Be concrete.
### 👉 Next Step
One actionable study tip.

Rules: base it only on the questions above, keep the whole report under 160 words, no preamble.`;

  const raw = await generate(prompt, { json: false });
  return raw.trim();
}

// Accepts a bare array, an {questions:[...]} object, or fenced JSON.
function safeParseArray(raw) {
  const tryParse = (s) => {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v;
    if (v && Array.isArray(v.questions)) return v.questions;
    return null;
  };
  try {
    const v = tryParse(raw);
    if (v) return v;
  } catch {
    /* fall through to regex extraction */
  }
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) return JSON.parse(match[0]);
  throw new Error("Could not parse AI quiz response as JSON");
}
