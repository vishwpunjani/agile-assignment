"use client";
import { useState } from "react";
import MediaSelectionButton from "@/components/MediaSelectionButton";

const SUGGESTIONS = [
  "What services does the company offer?",
  "Tell me about the company portfolio",
  "What technologies do you specialize in?",
  "How can I get started with your platform?",
];

export default function Home() {
  const [input, setInput] = useState("");

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <main style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "flex-end", 
      height: "100vh", 
      padding: "2rem",
      background: "#f9fafb"
    }}>
      <div style={{ width: "100%", maxWidth: "700px", display: "flex", flexDirection: "column", gap: "12px" }}>

        {input === "" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "999px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            border: "1.5px solid #e5e7eb",
            borderRadius: "999px",
            width: "100%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <MediaSelectionButton />
          <input
            type="text"
            placeholder="Start asking..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "15px",
              background: "transparent",
              color: "#374151",
            }}
          />
          {input && (
            <button
              onClick={() => setInput("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "18px",
                padding: "0 4px",
              }}
            >
              ×
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
