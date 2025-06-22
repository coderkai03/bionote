"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useState, useEffect } from "react";

export default function ChatPanel() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
  });

  // Listen for screenshot events from page.tsx
  useEffect(() => {
    const handleScreenshotCaptured = (event: CustomEvent) => {
      if (event.detail?.base64) {
        setScreenshotFile(event.detail.base64);
      }
    };

    window.addEventListener(
      "screenshot-captured",
      handleScreenshotCaptured as EventListener
    );

    return () => {
      window.removeEventListener(
        "screenshot-captured",
        handleScreenshotCaptured as EventListener
      );
    };
  }, []);

  const handleFormSubmit = (event: React.FormEvent) => {
    // Convert screenshot to attachment if present
    if (screenshotFile && !files) {
      // Create a fake file list with the screenshot
      const screenshotAttachment = [
        {
          name: "screenshot.png",
          contentType: "image/png",
          url: screenshotFile,
        },
      ];

      handleSubmit(event, {
        experimental_attachments: screenshotAttachment,
        data: {
          imageUrl: screenshotFile,
        },
      });
    } else {
      handleSubmit(event, {
        experimental_attachments: files,
      });
    }

    // Clear files and screenshot after submission
    setFiles(undefined);
    setScreenshotFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "submitted":
        return "Sending...";
      case "streaming":
        return "AI is typing...";
      case "ready":
        return "Ready";
      case "error":
        return "Error occurred";
      default:
        return "Ready";
    }
  };

  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error" || error;

  return (
    <>
      <div
        className="flex flex-col h-full backdrop-blur-xl border-l border-gray-700/50 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #252525 0%, #1a1a1a 50%, #252525 100%)",
          boxShadow:
            "inset 0 0 50px rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 relative z-10">
          <h2 className="text-lg font-semibold text-white drop-shadow-sm">
            Chat Assistant
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading
                  ? "bg-yellow-400 animate-pulse"
                  : hasError
                  ? "bg-red-400"
                  : "bg-green-400"
              }`}
            />
            <span className="text-sm text-gray-300 drop-shadow-sm">
              {getStatusDisplay()}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-4">
              <div className="text-red-200 text-sm">An error occurred.</div>
              <button
                onClick={() => reload()}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {messages.length === 0 && !error ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-medium text-white drop-shadow-sm">
                Start a conversation
              </p>
              <p className="text-sm text-gray-400 drop-shadow-sm">
                Ask me anything and I&apos;ll help you out!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-white`}
                  style={{
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    boxShadow:
                      message.role === "user"
                        ? "0 4px 15px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap text-sm drop-shadow-sm">
                    {message.parts?.map((part, index) => {
                      if (part.type === "text") {
                        return <div key={index}>{part.text}</div>;
                      }
                      // Handle other part types if needed
                      return null;
                    }) || message.content}
                  </div>

                  {/* Attachments */}
                  {message.experimental_attachments &&
                    message.experimental_attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.experimental_attachments
                          .filter((attachment) =>
                            attachment.contentType?.startsWith("image/")
                          )
                          .map((attachment, index) => (
                            <div
                              key={`${message.id}-${index}`}
                              className="relative group cursor-pointer"
                              onClick={() => setModalImage(attachment.url)}
                            >
                              <img
                                src={attachment.url}
                                alt={attachment.name || "Attachment"}
                                className="w-full max-w-48 rounded-lg shadow-lg border border-white/20 object-cover"
                                style={{ maxHeight: "200px" }}
                              />
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {attachment.name}
                              </div>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">
                                  Click to view
                                </span>
                              </div>
                            </div>
                          ))}

                        {/* Non-image attachments */}
                        {message.experimental_attachments
                          .filter(
                            (attachment) =>
                              !attachment.contentType?.startsWith("image/")
                          )
                          .map((attachment, index) => (
                            <div
                              key={`file-${message.id}-${index}`}
                              className="bg-gray-800/50 rounded-lg p-3 border border-gray-600"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                  <span className="text-xs">📄</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">
                                    {attachment.name || "Unknown file"}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {attachment.contentType || "Unknown type"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-white bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-700/50 relative z-10 bg-gradient-to-r from-white/3 to-transparent">
          {/* Screenshot preview */}
          {screenshotFile && (
            <div className="mb-3 flex items-center space-x-2">
              <img
                src={screenshotFile}
                alt="Upload preview"
                className="w-12 h-12 rounded object-cover border border-white/20 shadow-lg cursor-pointer"
                onClick={() => setModalImage(screenshotFile)}
              />
              <span className="text-sm text-gray-300">Image ready to send</span>
              <button
                onClick={() => setScreenshotFile(null)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* File preview */}
          {files && files.length > 0 && (
            <div className="mb-3 flex items-center space-x-2">
              <span className="text-blue-400">📎</span>
              <span className="text-sm text-gray-300">
                {files.length} file{files.length > 1 ? "s" : ""} ready to send
              </span>
              <button
                onClick={() => {
                  setFiles(undefined);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex space-x-2">
            {/* File input */}
            <input
              type="file"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
              accept="image/*,text/*,.pdf,.doc,.docx"
            />

            {/* File upload button */}
            <label htmlFor="file-upload">
              <div className="px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg hover:from-white/15 hover:to-white/10">
                <span className="text-lg">📎</span>
              </div>
            </label>

            {/* Text input */}
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg"
              disabled={isLoading || !!error}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                (!input.trim() && !files && !screenshotFile) ||
                !!error
              }
              className="px-6 py-2 rounded-lg transition-all font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={modalImage}
              alt="Enlarged view"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
