"use client";

import type { DragEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import CopyTextButton from "@/components/CopyTextButton";
import MessageInput from "@/components/MessageInput";
import LoadingAnimation from "@/components/LoadingAnimation";
import NewChatButton from "@/components/NewChatButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const SUGGESTIONS = [
  "What services does the company offer?",
  "Tell me about the company portfolio",
  "What technologies do you specialize in?",
  "How can I get started with your platform?",
];

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [completion, setCompletion] = useState("");
  const [chatKey, setChatKey] = useState(0);

  const sendQuery = useCallback(async (query: string, mode: "send" | "retry") => {
    setIsRetrying(mode === "retry");
    setIsSending(true);
    setCompletion("");
    setStatusMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/query/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 }),
      });

      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Response body is null");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setCompletion((prev) => prev + chunk);
      }
      setStatusMessage("Message processed.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsRetrying(false);
      setIsSending(false);
    }
  }, []);

  const handleMessageSent = useCallback((event: Event) => {
    const detail = (event as CustomEvent<string>).detail;
    if (!detail) return;
    setLastQuery(detail);
    void sendQuery(detail, "send");
  }, [sendQuery]);

  useEffect(() => {
    window.addEventListener("messageSent", handleMessageSent as EventListener);
    return () => window.removeEventListener("messageSent", handleMessageSent as EventListener);
  }, [handleMessageSent]);

  // New Chat handler — resets everything
  const handleNewChat = () => {
    setCompletion("");
    setStatusMessage(null);
    setLastQuery(null);
    setIsSending(false);
    setIsRetrying(false);
    setMessage("");
    setIsDragging(false);
    setDragCounter(0);
    setChatKey((prev) => prev + 1);
    window.dispatchEvent(new CustomEvent("newChat"));
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
    if (dragCounter === 0) setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((prev) => prev - 1);
    if (dragCounter - 1 === 0) setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);
    alert("File uploaded!");
  };

  return (
    <>
      {/* New Chat Button — fixed top left */}
      <div className="fixed top-4 left-4 z-50">
        <NewChatButton onNewChat={handleNewChat} />
      </div>

      <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8">

          {/* 1. Header & Dropzone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 transition-all text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask anything</h1>
            <p className="text-gray-500">Drop a file here or use the input below</p>
          </div>

          {/* 2. Suggestions */}
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setMessage(s)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>

          {/* 3. AI Response Box */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[250px] flex flex-col relative overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Response</span>
              {completion && !isSending && (
                <div className="scale-90 transform-gpu origin-right">
                  <CopyTextButton textToCopy={completion} />
                </div>
              )}
            </div>

            <div className="p-8 flex-1">
              {completion ? (
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                  {completion}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 italic text-sm">
                  Waiting for your question...
                </div>
              )}
            </div>
          </div>

          {/* 4. Loading Animation */}
          <LoadingAnimation isLoading={isSending} />

          {/* 5. Input Area */}
          <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <MessageInput
                key={chatKey}
                message={message}
                onMessageChange={setMessage}
                isListening={isListening}
                setIsListening={setIsListening}
                canRetry={Boolean(lastQuery) && !isSending}
                isRetrying={isRetrying}
                onRetry={() => sendQuery(lastQuery!, "retry")}
              />
            </div>

            {statusMessage && (
              <div className="text-center text-sm font-medium text-green-600">
                {statusMessage}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
