"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  LoadingDots,
  ErrorAlert,
  StatusIndicator,
} from "./button";

export default function ChatPanel() {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [sentImageFile, setSentImageFile] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
    });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clear sent image when a new assistant message arrives
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && sentImageFile) {
        // Clear the sent image after assistant responds
        setTimeout(() => setSentImageFile(null), 1000);
      }
    }
  }, [messages, sentImageFile]);

  // Listen for screenshot events from page.tsx
  useEffect(() => {
    const handleScreenshotCaptured = (event: CustomEvent) => {
      if (event.detail?.base64) {
        setImageFile(event.detail.base64);
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
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };  const customSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store the image before submitting
    if (imageFile) {
      setSentImageFile(imageFile);
    }
    
    // Submit with image data
    handleSubmit(e, {
      data: {
        imageUrl: imageFile,
      },
    });
    
    // Clear the image file for next upload
    setImageFile(null);
  };

  const getErrorMessage = (error: string | Error | null): string => {
    if (!error) return "Something went wrong";
    return typeof error === "string" ? error : error.message;
  };

  return (
    <div
      className="flex flex-col h-full backdrop-blur-xl border-l border-gray-700/50 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #252525 0%, #1a1a1a 50%, #252525 100%)",
        boxShadow:
          "inset 0 0 50px rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.3)",
      }}
    >      {/* Header with Tools */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 relative z-10">
        <h2 className="text-lg font-semibold text-white drop-shadow-sm">
          Chat Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <StatusIndicator
            isActive={isLoading}
            activeText="Typing..."
            inactiveText="Online"
            className="ml-2"
          />
        </div>
      </div>      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {error && (
          <ErrorAlert
            title="Error"
            message={getErrorMessage(error)}
          />
        )}

        {messages.length === 0 && !error ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-lg font-medium text-white drop-shadow-sm">
              Start a conversation
            </p>
            <p className="text-sm text-gray-400 drop-shadow-sm">
              Ask me anything and I&apos;ll help you out!
            </p>
          </div>        ) : (
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
              >                {/* Display image if present in message data */}
                {message.role === "user" && sentImageFile && message === messages[messages.length - 1] && (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sentImageFile}
                      alt="Shared content"
                      className="w-full max-w-48 rounded-lg shadow-lg border border-white/20"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap drop-shadow-sm">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-white bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700/50 relative z-10 bg-gradient-to-r from-white/3 to-transparent">        {imageFile && (
          <div className="mb-3 flex items-center space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageFile}
              alt="Upload preview"
              className="w-12 h-12 rounded object-cover"
            />
            <span className="text-sm text-gray-300">Image ready to send</span>
            <Button
              onClick={() => setImageFile(null)}
              variant="danger"
              size="sm"
            >
              Remove
            </Button>
          </div>
        )}

        <form onSubmit={customSubmit} className="flex space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <IconButton
              icon="📎"
              variant="secondary"
              size="md"
              tooltip="Upload Image"
              type="button"
            >
              {""}
            </IconButton>
          </label>          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg"
            disabled={isLoading || !!error}
          />

          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !!error}
            variant="primary"
            size="md"
            isLoading={isLoading}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
