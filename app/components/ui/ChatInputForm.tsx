"use client";

import { ChangeEvent, FormEvent } from "react";
import MicrophoneButton from "./MicrophoneButton";

interface ChatInputFormProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFormSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  isTranscribing: boolean;
  isRecording: boolean;
  handleMicButtonClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAudioTranscription: (file: File) => void;
  setScreenshotFile: (file: string | null) => void;
  setFiles: (files: FileList | undefined) => void;
}

export default function ChatInputForm({
  input,
  handleInputChange,
  handleFormSubmit,
  isLoading,
  hasError,
  isTranscribing,
  isRecording,
  handleMicButtonClick,
  fileInputRef,
  handleAudioTranscription,
  setScreenshotFile,
  setFiles,
}: ChatInputFormProps) {
  return (
    <form onSubmit={handleFormSubmit} className="flex space-x-2">
      <input
        type="file"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type.startsWith("audio/")) {
              handleAudioTranscription(file);
            } else {
              setScreenshotFile(null);
              setFiles(event.target.files);
            }
          }
        }}
        multiple
        ref={fileInputRef}
        className="hidden"
        id="file-upload"
        accept="image/*,text/*,.pdf,.doc,.docx,audio/*"
        disabled={isTranscribing}
      />

      <label
        htmlFor="file-upload"
        className={isTranscribing ? "cursor-not-allowed" : ""}
      >
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg flex-shrink-0 ${
            isTranscribing
              ? "opacity-50"
              : "cursor-pointer hover:from-white/15 hover:to-white/10"
          }`}
        >
          <span className="text-sm sm:text-lg">📎</span>
        </div>
      </label>

      <MicrophoneButton
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        handleMicButtonClick={handleMicButtonClick}
      />

      <input
        value={input}
        onChange={handleInputChange}
        placeholder={
          isTranscribing ? "Transcribing..." : "Type your message..."
        }
        className="flex-1 px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg text-sm sm:text-base min-w-0"
        disabled={isLoading || hasError || isTranscribing}
      />

      <button
        type="submit"
        disabled={isLoading || !input.trim() || hasError || isTranscribing}
        className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base flex-shrink-0"
      >
        {isLoading ? "..." : "Send"}
      </button>
    </form>
  );
}
