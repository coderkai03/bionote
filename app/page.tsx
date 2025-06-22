"use client";
import ChatPanel from "./components/ChatPanel";
import { useRef, useState, useEffect } from "react";

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
const ModelContainer = ({
  isDrawingActive,
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: {
  isDrawingActive: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
}) => (
  <div className="relative h-full">
    <div className="sketchfab-embed-wrapper h-full">
      <iframe
        title={SKETCHFAB_MODEL_TITLE}
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope; magnetometer"
        src={SKETCHFAB_MODEL_URL}
        className="w-full h-full"
        style={{
          pointerEvents: isDrawingActive ? "none" : "auto",
          userSelect: isDrawingActive ? "none" : "auto",
        }}
      />
    </div>

    {/* Drawing Canvas */}
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full z-20 ${
        isDrawingActive
          ? "pointer-events-auto cursor-crosshair"
          : "pointer-events-none"
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{
        touchAction: "none",
        userSelect: "none",
      }}
    />

    {/* Animated bars */}
    <AnimatedBar position="top" />
    <AnimatedBar2 position="top" />
    <AnimatedBar position="bottom" />
    <AnimatedBar2 position="bottom" />

    {/* Attribution */}
  </div>
);

export default function Home() {
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (!videoRef.current) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        videoRef.current = video;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMediaStream(stream);

      stream.getVideoTracks()[0].onended = () => {
        setMediaStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current = null;
        }
      };
    } catch (error) {
      console.error("Failed to get screen capture permission:", error);
      setMediaStream(null);
    }
  };

  const stopScreenCapture = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current = null;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      if (modelRef.current) {
        const rect = modelRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    if (!isDrawingActive) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !isDrawingActive) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const captureModelContainer = async () => {
    if (!mediaStream || !videoRef.current) {
      // If no screen sharing is active, start it first
      await startScreenCapture();
      // Wait a moment for the stream to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const video = videoRef.current;
    if (!video || !mediaStream) {
      alert("Please start screen sharing first to capture the model view.");
      return;
    }

    if (video.readyState < video.HAVE_METADATA) {
      console.warn("Video not ready for screenshot yet.");
      return;
    }

    try {
      const modelContainer = modelRef.current;
      if (!modelContainer) {
        console.error("Model container not found");
        return;
      }

      // Get the position and size of the model container
      const containerRect = modelContainer.getBoundingClientRect();
      
      // Create a canvas for cropping
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas size to match the model container
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      // Draw the cropped portion of the video onto the canvas
      // We need to calculate the scale factor between video and screen
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      
      const scaleX = videoWidth / screenWidth;
      const scaleY = videoHeight / screenHeight;

      // Calculate the source rectangle in video coordinates
      const sourceX = containerRect.left * scaleX;
      const sourceY = containerRect.top * scaleY;
      const sourceWidth = containerRect.width * scaleX;
      const sourceHeight = containerRect.height * scaleY;

      // Draw the cropped video content
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
        0, 0, canvas.width, canvas.height             // Destination rectangle
      );

      const screenshot = canvas.toDataURL("image/png");

      const event = new CustomEvent("screenshot-captured", {
        detail: { base64: screenshot },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to capture model container:", error);
    }
  };

  const captureCanvasDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");

      const event = new CustomEvent("screenshot-captured", {
        detail: { base64: dataUrl },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Panel - 3D Model Full Screen */}
      <div className="flex-1 h-full relative" ref={modelRef}>
        <ModelContainer
          isDrawingActive={isDrawingActive}
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        {/* Drawing Controls */}
        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <button
            onClick={() => setIsDrawingActive(!isDrawingActive)}
            className={`p-2 rounded-lg shadow-lg transition-all duration-200 ${
              isDrawingActive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            title={isDrawingActive ? "Disable Drawing" : "Enable Drawing"}
          >
            ✏️
          </button>
          
          {/* Model Container Capture Button - Always Available */}
          <button
            onClick={captureModelContainer}
            className="p-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all duration-200"
            title="Capture Model View"
          >
            📸
          </button>
          
          {isDrawingActive && (
            <>
              <button
                onClick={clearDrawing}
                className="p-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
                title="Clear Drawing"
              >
                �️
              </button>
              <button
                onClick={captureCanvasDrawing}
                className="p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-200"
                title="Send Drawing to Chat"
              >
                �
              </button>
            </>
          )}
          {/* Screen capture control button */}
          {!mediaStream ? (
            <button
              onClick={startScreenCapture}
              className="px-3 py-2 rounded-lg shadow-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-200 text-xs font-semibold flex items-center gap-2"
              title="Start screen sharing"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Start Sharing
            </button>
          ) : (
            <button
              onClick={stopScreenCapture}
              className="px-3 py-2 rounded-lg shadow-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 text-xs font-semibold flex items-center gap-2"
              title="Stop screen sharing"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11.586l-2-2H5a4 4 0 00-4 4v10a4 4 0 004 4h14a4 4 0 004-4v-3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9l4-4m0 4l-4-4"
                />
              </svg>
              Stop Sharing
            </button>
          )}
        </div>
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
