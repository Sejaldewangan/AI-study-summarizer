import { useRef, useState } from "react";
import api from "../api/axios.js";
import { AIProgressSteps } from "./ui/Skeleton.jsx";

export default function FileUploadZone({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setFileName(file.name);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("topicName", file.name.replace(/\.[^.]+$/, ""));

      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(data); // lift the StudyMaterial up to the Dashboard
    } catch (err) {
      setError(err.message);
      setFileName("");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition
          ${
            dragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
              : "border-slate-300 bg-white hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {loading ? (
          <div className="w-full max-w-xs text-left" onClick={(e) => e.stopPropagation()}>
            <AIProgressSteps steps={["Uploading file", "Extracting text", "Saving material"]} />
            {fileName && <p className="text-center text-xs text-slate-400">{fileName}</p>}
          </div>
        ) : (
          <>
            <div className="mb-3 text-4xl">📤</div>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              Drag &amp; drop a PDF, Word doc, or textbook photo
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or click to browse (PDF, DOCX, PNG, JPG, WEBP)
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
