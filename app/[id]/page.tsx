"use client";

import ChatPanel from "../components/ChatPanel";
import DrawingOverlay from "../components/DrawingOverlay";
import { useParams } from "next/navigation";

export default function InteractPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex h-screen">
      {/* Left Panel - 3D Model with Drawing Overlay */}
      <div className="flex-1 h-full">
        <div className="h-full">
          <DrawingOverlay onScreenshotCapture={() => {}} modelId={params.id} />
          {/* Attribution overlay - positioned absolutely */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-40">
            <p
              style={{
                fontSize: "13px",
                fontWeight: "normal",
                margin: "0",
                color: "#4A4A4A",
              }}
            ></p>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-96 h-screen">
        <ChatPanel />
      </div>
    </div>
  );
}
