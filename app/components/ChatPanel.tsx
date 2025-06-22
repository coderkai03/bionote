"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export default function ChatPanel() {
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

  return (
    <div
      className="flex flex-col h-full backdrop-blur-xl border-l border-gray-700/50 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #252525 0%, #1a1a1a 50%, #252525 100%)",
        boxShadow:
          "inset 0 0 50px rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.3)",
      }}
    >
      {/* Reflective overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.08) 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)",
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-700/50 relative z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2 className="text-lg font-semibold text-white drop-shadow-sm">
          Chat Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading
                ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
                : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-gray-300 drop-shadow-sm">
            {isLoading ? "Typing..." : "Online"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {error && (
          <div
            className="rounded-lg p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow:
                "0 4px 15px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 drop-shadow-sm"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200 drop-shadow-sm">
                  Configuration Required
                </h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>
                    Please set up your Groq API key in the{" "}
                    <code
                      className="px-1 py-0.5 rounded text-red-200"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      .env.local
                    </code>{" "}
                    file. See{" "}
                    <code
                      className="px-1 py-0.5 rounded text-red-200"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      CHAT_SETUP.md
                    </code>{" "}
                    for instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !error ? (
          <div className="text-center text-gray-400 mt-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <svg
                className="w-8 h-8 text-gray-500 drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user" ? "text-white" : "text-white"
                }`}
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
                <p className="text-sm whitespace-pre-wrap drop-shadow-sm">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-white"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce shadow-sm"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Invisible div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div
        className="p-4 border-t border-gray-700/50 relative z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
            disabled={isLoading || !!error}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !!error}
            className="px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow:
                "0 4px 15px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim() && !error) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && input.trim() && !error) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
              }
            }}
          >
            <svg
              className="w-4 h-4 drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
