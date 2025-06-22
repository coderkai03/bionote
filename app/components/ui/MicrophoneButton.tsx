"use client";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  handleMicButtonClick: () => void;
}

export default function MicrophoneButton({
  isRecording,
  isTranscribing,
  handleMicButtonClick,
}: MicrophoneButtonProps) {
  return (
    <button
      type="button"
      onClick={handleMicButtonClick}
      disabled={isTranscribing}
      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer transition-colors flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg hover:from-white/15 hover:to-white/10 flex-shrink-0 ${
        isRecording ? "bg-red-500/50" : ""
      } ${isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="text-sm sm:text-lg">{isRecording ? "🛑" : "🎤"}</span>
    </button>
  );
}
