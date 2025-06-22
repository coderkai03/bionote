import { useRef, useCallback, useEffect, useState } from "react";

interface DrawingOptions {
  strokeStyle?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

interface UseDrawingCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isDrawing: boolean;
  isDrawingMode: boolean;
  startDrawing: (e: React.MouseEvent) => void;
  draw: (e: React.MouseEvent) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  toggleDrawingMode: () => void;
  setDrawingMode: (mode: boolean) => void;
}

const DEFAULT_OPTIONS: DrawingOptions = {
  strokeStyle: "#ef4444", // red-500
  lineWidth: 3,
  lineCap: "round",
  lineJoin: "round",
};

export function useDrawingCanvas(
  containerRef: React.RefObject<HTMLElement>,
  options: DrawingOptions = DEFAULT_OPTIONS
): UseDrawingCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Apply drawing options
      ctx.strokeStyle = options.strokeStyle || DEFAULT_OPTIONS.strokeStyle!;
      ctx.lineWidth = options.lineWidth || DEFAULT_OPTIONS.lineWidth!;
      ctx.lineCap = options.lineCap || DEFAULT_OPTIONS.lineCap!;
      ctx.lineJoin = options.lineJoin || DEFAULT_OPTIONS.lineJoin!;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [containerRef, options]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingMode) return;

      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    [isDrawingMode, getCanvasCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !isDrawingMode) return;

      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const { x, y } = getCanvasCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, isDrawingMode, getCanvasCoordinates]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode((prev) => !prev);
    // Stop drawing when disabling drawing mode
    if (isDrawingMode) {
      setIsDrawing(false);
    }
  }, [isDrawingMode]);

  const setDrawingMode = useCallback((mode: boolean) => {
    setIsDrawingMode(mode);
    if (!mode) {
      setIsDrawing(false);
    }
  }, []);

  return {
    canvasRef,
    isDrawing,
    isDrawingMode,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    toggleDrawingMode,
    setDrawingMode,
  };
}
