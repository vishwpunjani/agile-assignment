"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPulse, setRecordingPulse] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

 
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [message]);


  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordingPulse((p) => !p), 600);
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;

    window.dispatchEvent(new CustomEvent("messageSent", { detail: trimmed }));
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
   
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        window.dispatchEvent(new CustomEvent("audioRecorded", { detail: blob }));
        setMessage("🎙️ Voice message recorded");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  return (
    <div className="input-wrapper">
      <div className="input-card">
        <textarea
          ref={textareaRef}
          className="message-textarea"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          aria-label="Message input"
        />
        <div className="action-row">
          <span className="hint-text">
            {isRecording ? "Recording… press stop when done" : "Enter to send · Shift+Enter for new line"}
          </span>
          <div className="buttons">
            <button
              className={`mic-btn ${isRecording ? "recording" : ""}`}
              onClick={toggleRecording}
              aria-label={isRecording ? "Stop recording" : "Record voice message"}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? (
                <span className={`stop-icon ${recordingPulse ? "pulse" : ""}`}>■</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            <button
              className={`send-btn ${message.trim() ? "active" : ""}`}
              onClick={handleSend}
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
