import { useRef, useCallback, useState } from "react";

interface ScreenCaptureOptions {
  video?: {
    width?: { ideal: number };
    height?: { ideal: number };
  };
  audio?: boolean;
}

interface UseScreenCaptureReturn {
  mediaStream: MediaStream | null;
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  captureScreenshot: () => Promise<string | null>;
  error: string | null;
}

const DEFAULT_OPTIONS: ScreenCaptureOptions = {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
};

export function useScreenCapture(
  options: ScreenCaptureOptions = DEFAULT_OPTIONS
): UseScreenCaptureReturn {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCapture = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getDisplayMedia(options);

      // Create or reuse video element
      if (!videoRef.current) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        videoRef.current = video;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMediaStream(stream);
      setIsCapturing(true);

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopCapture();
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start screen capture";
      console.error("Failed to get screen capture permission:", err);
      setError(errorMessage);
      setIsCapturing(false);
      setMediaStream(null);
    }
  }, [options]);

  const stopCapture = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    setMediaStream(null);
    setIsCapturing(false);
    setError(null);
  }, [mediaStream]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!mediaStream || !videoRef.current) {
      setError(
        "Screen capture is not active. Please start screen sharing first."
      );
      return null;
    }

    const video = videoRef.current;

    // Wait for video to be ready
    if (video.readyState < video.HAVE_METADATA) {
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Video load timeout")),
            5000
          );
          video.addEventListener(
            "loadedmetadata",
            () => {
              clearTimeout(timeout);
              resolve(void 0);
            },
            { once: true }
          );
        });
      } catch {
        setError("Video not ready for screenshot");
        return null;
      }
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const screenshot = canvas.toDataURL("image/png");

      setError(null);
      return screenshot;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to capture screenshot";
      console.error("Failed to capture screenshot:", err);
      setError(errorMessage);
      return null;
    }
  }, [mediaStream]);

  return {
    mediaStream,
    isCapturing,
    startCapture,
    stopCapture,
    captureScreenshot,
    error,
  };
}
