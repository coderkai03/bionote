"use client";

import { type Message } from "@ai-sdk/react";
import Image from "next/image";

// --- Type Guards & Helpers ---

/**
 * A type guard to check if a message's data payload contains a valid image URL.
 * @param data The data payload from a message.
 * @returns True if the data is an object with a string `imageUrl` property.
 */
const isImageData = (data: Message["data"]): data is { imageUrl: string } => {
  return (
    data != null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "imageUrl" in data &&
    typeof (data as { imageUrl: unknown }).imageUrl === "string"
  );
};

// --- Reusable UI Components ---

/**
 * A styled button for submitting the chat form.
 */
export const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
  <button
    type="submit"
    disabled={isDisabled}
    className="px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    style={{
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      boxShadow:
        "0 4px 15px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
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
);

/**
 * An animated loading indicator for when the AI is "typing".
 */
export const LoadingDots = () => (
  <div className="flex space-x-1">
    {[0, 0.1, 0.2].map((delay, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce shadow-sm"
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </div>
);

/**
 * A styled alert box for displaying configuration or runtime errors.
 */
export const ErrorAlert = ({
  title,
}: {
  title: string;
}) => (
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
          {title}
        </h3>
        <div className="mt-2 text-sm text-red-300">
          <p>
            Please set up your Google API key in the{" "}
            <code className="bg-red-900/50 px-1 py-0.5 rounded">
              .env.local
            </code>{" "}
            file. See{" "}
            <code className="bg-red-900/50 px-1 py-0.5 rounded">
              CHAT_SETUP.md
            </code>{" "}
            for instructions.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Displays the current status of the chat assistant (e.g., "Online", "Typing...").
 */
export const StatusIndicator = ({
  isActive,
  activeText,
  inactiveText,
}: {
  isActive: boolean;
  activeText: string;
  inactiveText: string;
}) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-2 h-2 rounded-full ${
        isActive
          ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
          : "bg-gray-500"
      }`}
    ></div>
    <span className="text-sm text-gray-300 drop-shadow-sm">
      {isActive ? activeText : inactiveText}
    </span>
  </div>
);

/**
 * A styled container for individual chat messages.
 */
export const MessageBubble = ({
  message,
  children,
}: {
  message: Message;
  children: React.ReactNode;
}) => (
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
    {children}
  </div>
);

/**
 * Renders the content of a message, displaying an image if one is present in the data payload.
 */
export const MessageContent = ({ message }: { message: Message }) => {
  const imageData = isImageData(message.data) ? message.data : null;
  return (
    <>
      {imageData?.imageUrl && (
        <Image
          src={imageData.imageUrl}
          alt="User submission"
          width={300}
          height={200}
          className="w-full h-auto rounded-lg mb-2 border border-white/10"
        />
      )}
      {message.content && (
        <p className="text-sm whitespace-pre-wrap drop-shadow-sm">
          {message.content}
        </p>
      )}
    </>
  );
};
