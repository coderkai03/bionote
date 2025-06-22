'use client';

import ChatPanel from "./components/ChatPanel";
import DrawingOverlay from "./components/DrawingOverlay";

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Left Panel - 3D Model with Drawing Overlay */}
      <div className="flex-1 h-full">
        <div className="h-full">
          <DrawingOverlay onScreenshotCapture={() => {}} />
          {/* Attribution overlay - positioned absolutely */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-40">
            <p
              style={{
                fontSize: "13px",
                fontWeight: "normal",
                margin: "0",
                color: "#4A4A4A",
              }}
            >
              <a
                href="https://sketchfab.com/3d-models/3d-animated-realistic-human-heart-v10-a70c0c47fe4b4bbfabfc8f445365d5a4?utm_medium=embed&utm_campaign=share-popup&utm_content=a70c0c47fe4b4bbfabfc8f445365d5a4"
                target="_blank"
                rel="nofollow"
                style={{ fontWeight: "bold", color: "#1CAAD9" }}
              >
                3d Animated Realistic Human Heart V1.0
              </a>{" "}
              by{" "}
              <a
                href="https://sketchfab.com/docjana?utm_medium=embed&utm_campaign=share-popup&utm_content=a70c0c47fe4b4bbfabfc8f445365d5a4"
                target="_blank"
                rel="nofollow"
                style={{ fontWeight: "bold", color: "#1CAAD9" }}
              >
                Anatomy by Doctor Jana
              </a>{" "}
              on{" "}
              <a
                href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=a70c0c47fe4b4bbfabfc8f445365d5a4"
                target="_blank"
                rel="nofollow"
                style={{ fontWeight: "bold", color: "#1CAAD9" }}
              >
                Sketchfab
              </a>
            </p>
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
