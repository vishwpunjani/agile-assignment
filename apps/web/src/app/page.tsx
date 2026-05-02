"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import CopyTextButton from "@/components/CopyTextButton";
import MessageInput from "@/components/MessageInput";
import { useAdminAuth } from "@/context/AdminAuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

const SUGGESTIONS = [
  "What services does the company offer?",
  "Tell me about the company portfolio",
  "What technologies do you specialize in?",
  "How can I get started with your platform?",
];

const LLM_OUTPUT_TEXT = "LLM OUTPUT DATA";

type ReplaceStatus = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const { isAdmin, token } = useAdminAuth();
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");

  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceStatus, setReplaceStatus] = useState<ReplaceStatus>("idle");
  const [replaceError, setReplaceError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setReplaceFile(file);
    setReplaceStatus("idle");
    setReplaceError("");
  };

  const handleReplaceSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replaceFile || !token) return;

    const ext = replaceFile.name.slice(replaceFile.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setReplaceStatus("error");
      setReplaceError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }

    if (replaceFile.size > MAX_FILE_BYTES) {
      setReplaceStatus("error");
      setReplaceError("File exceeds the 10 MB limit.");
      return;
    }

    setReplaceStatus("uploading");
    setReplaceError("");

    try {
      const formData = new FormData();
      formData.append("file", replaceFile);

      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(data.detail ?? "Upload failed");
      }

      setReplaceStatus("success");
      setReplaceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setReplaceStatus("error");
      setReplaceError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <main className="page-root">
      {isAdmin && (
        <section className="doc-replace-panel" aria-label="Replace company document">
          <h2 className="doc-replace-title">Replace Company Document</h2>
          <form className="doc-replace-form" onSubmit={handleReplaceSubmit}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="doc-replace-input"
              onChange={handleFileChange}
              aria-label="Select document to upload"
            />
            <button
              type="submit"
              className="doc-replace-btn"
              disabled={!replaceFile || replaceStatus === "uploading"}
            >
              {replaceStatus === "uploading" ? "Uploading..." : "Upload"}
            </button>
          </form>
          {replaceStatus === "success" && (
            <p className="doc-replace-success" role="status">
              Document replaced successfully. RAG index updated.
            </p>
          )}
          {replaceStatus === "error" && (
            <p className="doc-replace-error" role="alert">
              {replaceError}
            </p>
          )}
        </section>
      )}

      <section className="prompt-suggestions" aria-label="Suggested prompts">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="prompt-suggestion"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </section>

      <MessageInput
        message={message}
        onMessageChange={setMessage}
        isListening={isListening}
        setIsListening={setIsListening}
      />

      <div className="copy-button-wrapper">
        <CopyTextButton textToCopy={LLM_OUTPUT_TEXT} />
      </div>
    </main>
  );
}
