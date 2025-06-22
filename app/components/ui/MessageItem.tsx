"use client";

import { Message } from "@ai-sdk/react";
import Image from "next/image";

interface MessageItemProps {
  message: Message;
  setModalImage: (url: string) => void;
}

export default function MessageItem({
  message,
  setModalImage,
}: MessageItemProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white`}
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
        <div className="whitespace-pre-wrap text-xs sm:text-sm drop-shadow-sm leading-relaxed">
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
            <div className="mt-2 sm:mt-3 space-y-2">
              {message.experimental_attachments
                .filter((attachment) =>
                  attachment.contentType?.startsWith("image/")
                )
                .map((attachment, index) => (
                  <div
                    key={`${message.id}-${index}`}
                    className="relative group cursor-pointer w-full max-w-[200px] sm:max-w-48 h-[150px]"
                    onClick={() => setModalImage(attachment.url)}
                  >
                    <Image
                      src={attachment.url}
                      alt={attachment.name || "Attachment"}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg shadow-lg border border-white/20"
                    />
                    <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white text-xs px-1 sm:px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {attachment.name}
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        Click to view
                      </span>
                    </div>
                  </div>
                ))}

              {/* Non-image attachments */}
              {message.experimental_attachments
                .filter(
                  (attachment) => !attachment.contentType?.startsWith("image/")
                )
                .map((attachment, index) => (
                  <div
                    key={`file-${message.id}-${index}`}
                    className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">📄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-white truncate">
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
  );
}
