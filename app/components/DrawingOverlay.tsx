'use client';

import { useState, useRef, useEffect } from 'react';

interface DrawingOverlayProps {
  onScreenshotCapture: (base64: string, pngBlob: Blob) => void;
}

export default function DrawingOverlay({ onScreenshotCapture }: DrawingOverlayProps) {
  const [isPenActive, setIsPenActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const penControlsRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match iframe
    const resizeCanvas = () => {
      const iframe = iframeRef.current;
      if (iframe) {
        canvas.width = iframe.offsetWidth;
        canvas.height = iframe.offsetHeight;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
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
    if (!isPenActive) return;
    
    // Prevent iframe from receiving the event
    e.preventDefault();
    e.stopPropagation();
    
    isDrawingRef.current = true;
    const pos = getMousePos(e);
    lastPointRef.current = pos;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isPenActive) return;

    // Prevent iframe from receiving the event
    e.preventDefault();
    e.stopPropagation();

    const pos = getMousePos(e);
    const lastPoint = lastPointRef.current;

    if (lastPoint) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }

    lastPointRef.current = pos;
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    // Prevent iframe from receiving the event
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isDrawingRef.current = false;
    
    // Capture screenshot after drawing is complete
    setTimeout(() => {
      captureScreenshotWithScreenShare();
    }, 100);
  };

  const captureScreenshotWithScreenShare = async () => {
    const drawingCanvas = canvasRef.current;
    const controls = penControlsRef.current;
    const container = containerRef.current;

    if (!drawingCanvas || !container) return;

    if (controls) controls.style.visibility = 'hidden';

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: container.offsetWidth },
          height: { ideal: container.offsetHeight },
        },
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = container.offsetWidth;
      finalCanvas.height = container.offsetHeight;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(drawingCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
      }

      stream.getTracks().forEach(track => track.stop());

      const base64 = finalCanvas.toDataURL('image/png');
      finalCanvas.toBlob((blob) => {
        if (blob) {
          onScreenshotCapture(base64, blob);
          const event = new CustomEvent('screenshot-captured', { detail: { base64, blob } });
          window.dispatchEvent(event);
        }
      }, 'image/png');

      const drawingCtx = drawingCanvas.getContext('2d');
      if (drawingCtx) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      }
    } catch (error) {
      console.error("Screenshot failed. The user might have cancelled the screen share prompt.", error);
    } finally {
      if (controls) controls.style.visibility = 'visible';
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Prevent iframe events when pen is active
  const preventIframeEvents = (e: React.MouseEvent) => {
    if (isPenActive) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pen Tool Buttons */}
      <div ref={penControlsRef} className="absolute top-4 left-4 z-30 flex gap-2">
        <button
          onClick={() => setIsPenActive(!isPenActive)}
          className={`p-3 rounded-lg shadow-lg transition-all ${
            isPenActive 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title={isPenActive ? 'Disable pen tool' : 'Enable pen tool'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      
        {isPenActive && (
          <button
            onClick={clearDrawing}
            className="p-3 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-lg transition-all"
            title="Clear drawing"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Drawing Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full z-20 ${
          isPenActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onWheel={preventIframeEvents}
        onContextMenu={preventIframeEvents}
        style={{
          touchAction: 'none',
        }}
      />

      {/* Invisible overlay to block iframe events when pen is active */}
      {isPenActive && (
        <div 
          className="absolute top-0 left-0 w-full h-full z-10"
        />
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
          pointerEvents: isPenActive ? 'none' : 'auto'
        }}
      />
    </div>
  );
} 