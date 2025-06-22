"use client";

import { useState, useRef, useEffect } from "react";

interface DrawingOverlayProps {
  onScreenshotCapture: (base64: string, pngBlob: Blob) => void;
}

type DrawingMode = "pen" | "circle";

export default function DrawingOverlay({
  onScreenshotCapture,
}: DrawingOverlayProps) {
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("pen");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingControlsRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const circleStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match iframe
    const resizeCanvas = () => {
      const iframe = iframeRef.current;
      if (iframe) {
        canvas.width = iframe.offsetWidth;
        canvas.height = iframe.offsetHeight;
        ctx.strokeStyle = '#87CEEB'; // Light blue color
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive) return;

    // Prevent iframe from receiving the event
    e.preventDefault();
    e.stopPropagation();

    isDrawingRef.current = true;
    const pos = getMousePos(e);
    lastPointRef.current = pos;

    if (drawingMode === "pen") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = '#87CEEB'; // Light blue color
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    } else if (drawingMode === "circle") {
      circleStartRef.current = pos;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isDrawingActive) return;

    // Prevent iframe from receiving the event
    e.preventDefault();
    e.stopPropagation();

    const pos = getMousePos(e);

    if (drawingMode === "pen") {
      const lastPoint = lastPointRef.current;
      if (lastPoint) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx) {
          ctx.strokeStyle = '#87CEEB'; // Light blue color
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
      }
      lastPointRef.current = pos;
    } else if (drawingMode === "circle" && circleStartRef.current) {
      // Clear canvas and redraw the circle preview
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#87CEEB'; // Light blue color
        
        const start = circleStartRef.current;
        const radius = Math.sqrt(
          Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
        );

        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    // Prevent iframe from receiving the event
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    isDrawingRef.current = false;

    // For circle mode, finalize the circle
    if (drawingMode === "circle" && circleStartRef.current) {
      const pos = e ? getMousePos(e) : lastPointRef.current;
      if (pos) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          ctx.strokeStyle = '#87CEEB'; // Light blue color
          const start = circleStartRef.current;
          const radius = Math.sqrt(
            Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
          );

          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      circleStartRef.current = null;
    }

    // Capture screenshot after drawing is complete
    setTimeout(() => {
      captureScreenshotWithScreenShare();
    }, 100);
  };

  const captureScreenshotWithScreenShare = async () => {
    const drawingCanvas = canvasRef.current;
    const controls = drawingControlsRef.current;
    const container = containerRef.current;
    const iframe = iframeRef.current;

    if (!drawingCanvas || !container || !iframe) return;

    if (controls) controls.style.visibility = "hidden";

    try {
      // Get the iframe's position and size relative to the viewport
      const iframeRect = iframe.getBoundingClientRect();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: iframeRect.width },
          height: { ideal: iframeRect.height },
        },
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
      });

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = iframeRect.width;
      finalCanvas.height = iframeRect.height;
      const ctx = finalCanvas.getContext("2d");

      if (ctx) {
        // Calculate the crop area to only capture the iframe region
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Calculate the scale factor between the captured video and the actual screen
        const scaleX = videoWidth / window.screen.width;
        const scaleY = videoHeight / window.screen.height;

        // Calculate the source coordinates in the video
        const sourceX = iframeRect.left * scaleX;
        const sourceY = iframeRect.top * scaleY;
        const sourceWidth = iframeRect.width * scaleX;
        const sourceHeight = iframeRect.height * scaleY;

        // Draw only the iframe region from the screen capture
        ctx.drawImage(
          video,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight, // Source rectangle
          0,
          0,
          finalCanvas.width,
          finalCanvas.height // Destination rectangle
        );

        // Overlay the drawing canvas
        ctx.drawImage(
          drawingCanvas,
          0,
          0,
          finalCanvas.width,
          finalCanvas.height
        );
      }

      stream.getTracks().forEach((track) => track.stop());

      const base64 = finalCanvas.toDataURL("image/png");
      finalCanvas.toBlob((blob) => {
        if (blob) {
          onScreenshotCapture(base64, blob);
          const event = new CustomEvent("screenshot-captured", {
            detail: { base64, blob },
          });
          window.dispatchEvent(event);
        }
      }, "image/png");

      const drawingCtx = drawingCanvas.getContext("2d");
      if (drawingCtx) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      }
    } catch (error) {
      console.error(
        "Screenshot failed. The user might have cancelled the screen share prompt.",
        error
      );
    } finally {
      if (controls) controls.style.visibility = "visible";
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Prevent iframe events when drawing is active
  const preventIframeEvents = (e: React.MouseEvent) => {
    if (isDrawingActive) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Drawing Tool Buttons */}
      <div
        ref={drawingControlsRef}
        className="absolute top-4 left-4 z-30 flex gap-2"
      >
        <button
          onClick={() => setIsDrawingActive(!isDrawingActive)}
          className={`p-3 rounded-lg shadow-lg transition-all ${
            isDrawingActive
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title={
            isDrawingActive ? "Disable drawing tool" : "Enable drawing tool"
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {isDrawingActive && (
          <>
            <button
              onClick={() => setDrawingMode("pen")}
              className={`p-3 rounded-lg shadow-lg transition-all ${
                drawingMode === "pen"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title="Pen tool"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            <button
              onClick={() => setDrawingMode("circle")}
              className={`p-3 rounded-lg shadow-lg transition-all ${
                drawingMode === "circle"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title="Circle tool"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            <button
              onClick={clearDrawing}
              className="p-3 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-lg transition-all"
              title="Clear drawing"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Drawing Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full z-20 ${
          isDrawingActive
            ? "pointer-events-auto cursor-crosshair"
            : "pointer-events-none"
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onWheel={preventIframeEvents}
        onContextMenu={preventIframeEvents}
        style={{
          touchAction: "none",
        }}
      />

      {/* Invisible overlay to block iframe events when drawing is active */}
      {isDrawingActive && (
        <div className="absolute top-0 left-0 w-full h-full z-10" />
      )}

      {/* Iframe for the 3D model */}
      <iframe
        ref={iframeRef}
        title="3d Animated Realistic Human Heart V1.0"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        xr-spatial-tracking
        src="https://sketchfab.com/models/a70c0c47fe4b4bbfabfc8f445365d5a4/embed"
        className="w-full h-full"
        style={{
          pointerEvents: isDrawingActive ? "none" : "auto",
        }}
      />
    </div>
  );
}
