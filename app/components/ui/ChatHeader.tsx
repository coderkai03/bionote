"use client";

interface ChatHeaderProps {
  isLoading: boolean;
  hasError: boolean;
  statusDisplay: string;
}

export default function ChatHeader({
  isLoading,
  hasError,
  statusDisplay,
}: ChatHeaderProps) {
  return (
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
          {statusDisplay}
        </span>
      </div>
    </div>
  );
}
