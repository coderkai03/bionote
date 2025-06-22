"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useState, useEffect } from "react";

export default function ChatPanel() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    input,
    handleSubmit: originalHandleSubmit,
    handleInputChange,
    status,
    error,
    reload,
    setMessages,
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
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if this is an image generation request
    if (input.trim().startsWith("/image")) {
      await handleImageGeneration();
      return;
    }

    // Regular chat submission
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

      originalHandleSubmit(event, {
        experimental_attachments: screenshotAttachment,
        data: {
          imageUrl: screenshotFile,
        },
      });
    } else {
      originalHandleSubmit(event, {
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
  const handleImageGeneration = async () => {
    setIsGeneratingImage(true);
    try {
      // Create a temporary message structure similar to useChat
      const currentMessages = [
        ...messages,
        {
          id: Date.now().toString(),
          role: "user" as const,
          content: input,
        },
      ];

      // Prepare the request data
      interface ImageGenerationRequest {
        messages: typeof currentMessages;
        data?: {
          imageUrl?: string;
        };
      }

      const requestData: ImageGenerationRequest = {
        messages: currentMessages,
      };

      // Include image data if available (screenshot or file)
      const imageData =
        screenshotFile ||
        (files && files[0] ? await fileToBase64(files[0]) : null);
      if (imageData) {
        requestData.data = { imageUrl: imageData };
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: input,
        experimental_attachments: imageData
          ? [
              {
                name: "input.png",
                contentType: "image/png",
                url: imageData,
              },
            ]
          : undefined,
      };
      setMessages((messages) => [...messages, userMessage]);

      // Call the image generation API
      const response = await fetch("/api/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const result = await response.json();
      if (result.imageUrl) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: result.demoMode
            ? `🛠️ **Demo Mode**: ${result.message}\n\nGenerated image based on your prompt: "${result.prompt}"`
            : result.analysis
            ? `I analyzed your image and generated a new one based on your request: "${result.prompt}"\n\nImage Analysis: ${result.analysis}`
            : `Here's the generated image based on your prompt: "${result.prompt}"`,
          experimental_attachments: [
            {
              name: result.demoMode ? "demo_image.png" : "generated_image.png",
              contentType: "image/png",
              url: result.imageUrl,
            },
          ],
        };

        // Update the messages using setMessages
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      // Add an error message to the chat
      const errorMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: `Sorry, I couldn't generate the image. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
      setMessages([
        ...messages,
        {
          id: (Date.now() - 1).toString(),
          role: "user" as const,
          content: input,
        },
        errorMessage,
      ]);
    } finally {
      setIsGeneratingImage(false);
      // Clear the input and attachments
      handleInputChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      setFiles(undefined);
      setScreenshotFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  const getStatusDisplay = () => {
    if (isGeneratingImage) {
      // Check if there's an image attachment to determine the type of operation
      const hasImageAttachment =
        screenshotFile ||
        (files && files[0] && files[0].type.startsWith("image/"));
      return hasImageAttachment
        ? "Editing image with AI..."
        : "Generating image...";
    }
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

  const isLoading =
    status === "submitted" || status === "streaming" || isGeneratingImage;
  const hasError = status === "error" || error;

  return (
    <>
      <div
        className="flex flex-col h-screen max-h-screen backdrop-blur-xl border-l border-gray-700/50 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #252525 0%, #1a1a1a 50%, #252525 100%)",
          boxShadow:
            "inset 0 0 50px rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 relative z-10 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-white drop-shadow-sm">
            Chat Assistant
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading
                  ? "bg-yellow-400 animate-pulse"
                  : hasError
                  ? "bg-red-400"
                  : "bg-green-400"
              }`}
            />
            <span className="text-xs sm:text-sm text-gray-300 drop-shadow-sm">
              {getStatusDisplay()}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 relative z-10 min-h-0">
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
          )}{" "}
          {messages.length === 0 && !error ? (
            <div className="text-center text-gray-400 mt-4 sm:mt-8 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-lg flex items-center justify-center">
                <span className="text-xl sm:text-2xl">💬</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-white drop-shadow-sm mb-1 sm:mb-2">
                Start a conversation
              </p>
              <p className="text-xs sm:text-sm text-gray-400 drop-shadow-sm mb-3">
                Ask me anything and I&apos;ll help you out!
              </p>
              <div className="text-xs text-gray-500 bg-gray-800/30 rounded-lg p-3 backdrop-blur-sm border border-gray-700/50">
                <p className="mb-2 font-medium text-gray-300">💡 Pro Tips:</p>
                <ul className="space-y-1 text-left">
                  <li>
                    • Type{" "}
                    <code className="bg-gray-700/50 px-1 rounded text-blue-400">
                      /image
                    </code>{" "}
                    followed by a description to generate images
                  </li>
                  <li>
                    • Upload images with your{" "}
                    <code className="bg-gray-700/50 px-1 rounded text-blue-400">
                      /image
                    </code>{" "}
                    command for AI-powered editing
                  </li>
                  <li>• Take screenshots and attach them to your messages</li>
                </ul>
              </div>
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
                              className="relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => setModalImage(attachment.url)}
                            >
                              <img
                                src={attachment.url}
                                alt={attachment.name || "Attachment"}
                                className="w-full max-w-[200px] sm:max-w-48 rounded-lg shadow-lg border border-white/20 object-cover"
                                style={{ maxHeight: "150px" }}
                              />
                              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white text-xs px-1 sm:px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {attachment.name}
                              </div>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs sm:text-sm font-medium drop-shadow-lg">
                                  🔍 Click to enlarge
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
            ))
          )}{" "}
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>{" "}
                  <span className="text-xs sm:text-sm drop-shadow-sm">
                    {isGeneratingImage
                      ? screenshotFile ||
                        (files &&
                          files[0] &&
                          files[0].type.startsWith("image/"))
                        ? "Editing image with AI..."
                        : "Generating image..."
                      : "AI is typing..."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 sm:p-4 border-t border-gray-700/50 relative z-10 bg-gradient-to-r from-white/3 to-transparent flex-shrink-0">
          {/* Screenshot preview */}
          {screenshotFile && (
            <div className="mb-2 sm:mb-3 flex items-center space-x-2 p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 backdrop-blur-sm">
              <img
                src={screenshotFile}
                alt="Upload preview"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover border border-white/20 shadow-lg cursor-pointer flex-shrink-0"
                onClick={() => setModalImage(screenshotFile)}
              />
              <span className="text-xs sm:text-sm text-gray-300 flex-1">
                Image ready to send
              </span>
              <button
                onClick={() => setScreenshotFile(null)}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex-shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* File preview */}
          {files && files.length > 0 && (
            <div className="mb-2 sm:mb-3 flex items-center space-x-2 p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 backdrop-blur-sm">
              <span className="text-blue-400 flex-shrink-0">📎</span>
              <span className="text-xs sm:text-sm text-gray-300 flex-1">
                {files.length} file{files.length > 1 ? "s" : ""} ready to send
              </span>
              <button
                onClick={() => {
                  setFiles(undefined);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex-shrink-0"
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer transition-colors flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg hover:from-white/15 hover:to-white/10 flex-shrink-0">
                <span className="text-sm sm:text-lg">📎</span>
              </div>
            </label>
            {/* Text input */}{" "}
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message... (use /image for image generation)"
              className="flex-1 px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg text-sm sm:text-base min-w-0"
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
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base flex-shrink-0"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] sm:max-w-4xl sm:max-h-full">
            <img
              src={modalImage}
              alt="Enlarged view"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-sm sm:text-base"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
