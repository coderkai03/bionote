"use client";

import Image from "next/image";
import { useChatInteractions } from "./hooks/useChatInteractions";
import ChatHeader from "./ui/ChatHeader";
import MessageItem from "./ui/MessageItem";
import ChatInputForm from "./ui/ChatInputForm";

export default function ChatPanel() {
  const {
    files,
    setFiles,
    screenshotFile,
    setScreenshotFile,
    modalImage,
    setModalImage,
    isTranscribing,
    isRecording,
    noAudioDetected,
    handleMicButtonClick,
    fileInputRef,
    messages,
    input,
    handleInputChange,
    error,
    reload,
    handleAudioTranscription,
    handleFormSubmit,
    getStatusDisplay,
    isLoading,
    hasError,
  } = useChatInteractions();

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
        <ChatHeader
          isLoading={isLoading}
          hasError={hasError}
          statusDisplay={getStatusDisplay()}
        />

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
          )}

          {messages.length === 0 && !error ? (
            <div className="text-center text-gray-400 mt-4 sm:mt-8 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-lg flex items-center justify-center">
                <span className="text-xl sm:text-2xl">💬</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-white drop-shadow-sm mb-1 sm:mb-2">
                Start a conversation
              </p>
              <p className="text-xs sm:text-sm text-gray-400 drop-shadow-sm">
                Ask me anything and I&apos;ll help you out!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                setModalImage={setModalImage}
              />
            ))
          )}

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
                  </div>
                  <span className="text-xs sm:text-sm drop-shadow-sm">
                    AI is typing...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-700/50 relative z-10 bg-gradient-to-r from-white/3 to-transparent flex-shrink-0">
          {noAudioDetected && (
            <div className="mb-2 sm:mb-3 flex items-center space-x-2 p-2 sm:p-3 bg-yellow-800/30 rounded-lg border border-yellow-700/50 backdrop-blur-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center">
                <span className="text-yellow-400 text-lg">⚠️</span>
              </div>
              <span className="text-xs sm:text-sm text-yellow-300 flex-1">
                No audio detected. Please try again.
              </span>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-2 sm:mb-3 flex items-center space-x-2 p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 backdrop-blur-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center">
                <span className="text-yellow-400 animate-pulse text-lg">
                  🎤
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-300 flex-1">
                Transcribing audio... please wait.
              </span>
            </div>
          )}

          {screenshotFile && (
            <div className="mb-2 sm:mb-3 flex items-center space-x-2 p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 backdrop-blur-sm">
              <Image
                src={screenshotFile}
                alt="Upload preview"
                width={48}
                height={48}
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

          <ChatInputForm
            input={input}
            handleInputChange={handleInputChange}
            handleFormSubmit={handleFormSubmit}
            isLoading={isLoading}
            hasError={hasError}
            isTranscribing={isTranscribing}
            isRecording={isRecording}
            handleMicButtonClick={handleMicButtonClick}
            fileInputRef={fileInputRef}
            handleAudioTranscription={handleAudioTranscription}
            setScreenshotFile={setScreenshotFile}
            setFiles={setFiles}
          />
        </div>
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] sm:max-w-4xl sm:max-h-full w-full h-full">
            <Image
              src={modalImage!}
              alt="Enlarged view"
              layout="fill"
              objectFit="contain"
              className="rounded-lg shadow-2xl"
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
