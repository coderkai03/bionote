"use client";

import ChatPanel from "../../components/ChatPanel";
import { useRef, useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

// Loading component for 3D model
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="text-lg font-semibold mb-2">Loading 3D Model...</div>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm mt-2">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

// Model component that loads GLB files
function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    // Auto-center and scale the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    scene.position.sub(center);

    // Scale the model to fit in viewport
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    scene.scale.setScalar(scale);
  }, [scene]);

  return <primitive object={scene} />;
}

// Animated Bar Component (same as original)
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

// 3D Model Container Component with React Three Fiber
const ModelContainer = ({
  isDrawingActive,
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  modelPath,
}: {
  isDrawingActive: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  modelPath: string;
}) => (
  <div className="relative h-full">
    {/* React Three Fiber Canvas */}
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{
        pointerEvents: isDrawingActive ? "none" : "auto",
        userSelect: isDrawingActive ? "none" : "auto",
      }}
      className="w-full h-full"
    >
      <Suspense fallback={<Loader />}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Model */}
        <Model modelPath={modelPath} />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />
      </Suspense>
    </Canvas>

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
  </div>
);

export default function MeshyHome() {
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ id: string }>();

  // Map model IDs to local GLB files or use a default
  const getModelPath = (id: string) => {
    const modelMap: { [key: string]: string } = {
      camera: "/Camera_Insides.glb",
      crane: "/Crane.glb",
      engine: "/V8_Car_Engine.glb",
      steam: "/Steam_Engine.glb",
      lock: "/Lock_and_Key.glb",
    };

    // Check if ID matches any of our local models
    for (const [key, path] of Object.entries(modelMap)) {
      if (id.toLowerCase().includes(key)) {
        return path;
      }
    }

    // Default to crane model if no match found
    return "/Crane.glb";
  };

  const modelPath = getModelPath(params.id || "");

  // Screen capture functionality (same as original)
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

  // Canvas resize functionality
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Drawing functionality (same as original)
  const startDrawing = (e: React.MouseEvent) => {
    if (!isDrawingActive) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !isDrawingActive) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Screenshot capture functionality (similar to original but adapted for 3D canvas)
  const captureModelContainer = async () => {
    if (!mediaStream || !videoRef.current) {
      await startScreenCapture();
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

      const containerRect = modelContainer.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      canvas.width = containerRect.width * dpr;
      canvas.height = containerRect.height * dpr;
      ctx.scale(dpr, dpr);

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const scaleX = videoWidth / viewportWidth;
      const scaleY = videoHeight / viewportHeight;
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;

      const sourceX = (containerRect.left + scrollX) * scaleX;
      const sourceY = (containerRect.top + scrollY) * scaleY;
      const sourceWidth = containerRect.width * scaleX;
      const sourceHeight = containerRect.height * scaleY;

      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        containerRect.width,
        containerRect.height
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

  return (
    <div
      className="flex h-screen text-white overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #353535 0%, #252525 70%)",
      }}
    >
      {/* Left Panel - 3D Model */}
      <div className="flex-1 relative" ref={modelRef}>
        <ModelContainer
          isDrawingActive={isDrawingActive}
          canvasRef={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          modelPath={modelPath}
        />

        {/* Control buttons */}
        <div className="absolute top-4 left-4 flex gap-2 z-30">
          <button
            onClick={() => setIsDrawingActive(!isDrawingActive)}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
              isDrawingActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white text-xs font-semibold`}
          >
            {isDrawingActive ? "Stop Drawing" : "Start Drawing"}
          </button>

          {isDrawingActive && (
            <button
              onClick={clearDrawing}
              className="px-3 py-2 rounded-lg shadow-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold"
            >
              Clear
            </button>
          )}

          <button
            onClick={captureModelContainer}
            className="px-3 py-2 rounded-lg shadow-lg transition-all duration-300 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold"
          >
            📸 Capture
          </button>

          {!mediaStream ? (
            <button
              onClick={startScreenCapture}
              className="px-3 py-2 rounded-lg shadow-lg transition-all duration-300 bg-[#252525] hover:bg-[#303030] text-gray-300 text-xs font-semibold flex items-center gap-2"
            >
              <span>🖥️ Start Sharing</span>
            </button>
          ) : (
            <button
              onClick={stopScreenCapture}
              className="px-3 py-2 rounded-lg shadow-lg transition-all duration-300 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300 text-xs font-semibold flex items-center gap-2"
            >
              <span>🛑 Stop Sharing</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-96 h-screen bg-[#252525] backdrop-blur-xl border-l border-gray-700/50">
        <ChatPanel />
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes gentlePulse {
          0%,
          100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes subtleShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
