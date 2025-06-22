"use client";
import ChatPanel from "./components/ChatPanel";

// Constants for better maintainability
const SKETCHFAB_MODEL_URL =
  "https://sketchfab.com/models/a70c0c47fe4b4bbfabfc8f445365d5a4/embed";
const SKETCHFAB_MODEL_TITLE = "3d Animated Realistic Human Heart V1.0";

// Animated Bar Component
const AnimatedBar = ({ position }: { position: "top" | "bottom" }) => (
  <div
    className={`absolute ${
      position === "top" ? "top-0" : "bottom-0"
    } left-0 right-0 h-16 bg-[#000000] backdrop-blur-xl z-10 overflow-hidden`}
    style={{
      clipPath:
        position === "top"
          ? "polygon(0 0, 100% 0, 10% 100%, 0 100%)"
          : "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
    }}
  >
    {/* Subtle animated gradient overlay */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          position === "top"
            ? "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)"
            : "linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)",
        animation:
          position === "top"
            ? "fadeInOut 8s ease-in-out infinite"
            : "fadeInOut 8s ease-in-out infinite 4s",
      }}
    />

    {/* Very subtle pulsing glow */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.02) 0%, transparent 60%)",
        animation:
          position === "top"
            ? "gentlePulse 12s ease-in-out infinite"
            : "gentlePulse 12s ease-in-out infinite 6s",
      }}
    />

    {/* Subtle shimmer effect */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)",
        animation:
          position === "top"
            ? "subtleShimmer 15s ease-in-out infinite"
            : "subtleShimmer 15s ease-in-out infinite 7.5s",
      }}
    />
  </div>
);
const AnimatedBar2 = ({ position }: { position: "top" | "bottom" }) => (
  <div
    className={`absolute ${
      position === "top" ? "top-0" : "bottom-0"
    } left-0 right-0 h-16 bg-[#252525] backdrop-blur-xl z-10 overflow-hidden`}
    style={{
      clipPath:
        position !== "top"
          ? "polygon(0 0, 100% 0, 10% 100%, 0 100%)"
          : "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
    }}
  >
    {/* Subtle animated gradient overlay */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          position === "top"
            ? "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)"
            : "linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)",
        animation:
          position === "top"
            ? "fadeInOut 8s ease-in-out infinite"
            : "fadeInOut 8s ease-in-out infinite 4s",
      }}
    />

    {/* Very subtle pulsing glow */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.02) 0%, transparent 60%)",
        animation:
          position === "top"
            ? "gentlePulse 12s ease-in-out infinite"
            : "gentlePulse 12s ease-in-out infinite 6s",
      }}
    />

    {/* Subtle shimmer effect */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)",
        animation:
          position === "top"
            ? "subtleShimmer 15s ease-in-out infinite"
            : "subtleShimmer 15s ease-in-out infinite 7.5s",
      }}
    />
  </div>
);

// 3D Model Container Component
const ModelContainer = () => (
  <div className="relative h-full">
    <div className="sketchfab-embed-wrapper h-full">
      <iframe
        title={SKETCHFAB_MODEL_TITLE}
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={SKETCHFAB_MODEL_URL}
        className="w-full h-full"
      />
    </div>

    {/* Animated bars */}
    <AnimatedBar position="top" />
    <AnimatedBar2 position="top" />
    <AnimatedBar position="bottom" />
    <AnimatedBar2 position="bottom" />

    {/* Attribution */}
  </div>
);

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Panel - 3D Model Full Screen */}
      <div className="flex-1 h-full relative">
        <ModelContainer />
      </div>

      {/* Right Panel - Chat */}
      <div className="w-96 h-screen bg-[#252525] backdrop-blur-xl border-l border-gray-700/50">
        <ChatPanel />
      </div>

      {/* Custom CSS for subtle animations */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes gentlePulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.02);
          }
        }

        @keyframes subtleShimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          50% {
            transform: translateX(100%) skewX(-15deg);
          }
          100% {
            transform: translateX(-100%) skewX(-15deg);
          }
        }
      `}</style>
    </div>
  );
}
