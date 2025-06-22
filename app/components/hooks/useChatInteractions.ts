"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useState, useEffect, FormEvent } from "react";

export function useChatInteractions() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [noAudioDetected, setNoAudioDetected] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    setInput,
    status,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
  });

  useEffect(() => {
    const handleScreenshotCaptured = (event: CustomEvent) => {
      if (event.detail?.base64) {
        setScreenshotFile(event.detail.base64);
      }
    };
    window.addEventListener(
      "screenshot-captured",
      handleScreenshotCaptured as EventListener
    );
    return () => {
      window.removeEventListener(
        "screenshot-captured",
        handleScreenshotCaptured as EventListener
      );
    };
  }, [setScreenshotFile]);

  const handleAudioTranscription = async (audioFile: File) => {
    setIsTranscribing(true);
    setFiles(undefined);
    setScreenshotFile(null);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Transcription failed" }));
        throw new Error(errorData.error || "Transcription failed");
      }
      const result = await response.json();
      if (result.transcript) {
        setInput(result.transcript);
      } else {
        console.error("Transcription returned no text.");
      }
    } catch (err) {
      console.error("Error transcribing audio:", err);
    } finally {
      setIsTranscribing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size < 100) {
          setNoAudioDetected(true);
          setTimeout(() => setNoAudioDetected(false), 3000);
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          return;
        }

        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        handleAudioTranscription(audioFile);
        stream.getTracks().forEach((track) => track.stop()); // Stop the microphone track
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      // TODO: Inform user that microphone access is required
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFormSubmit = (event: FormEvent) => {
    if (screenshotFile && !files) {
      const screenshotAttachment = [
        {
          name: "screenshot.png",
          contentType: "image/png",
          url: screenshotFile,
        },
      ];
      handleSubmit(event, {
        experimental_attachments: screenshotAttachment,
        data: {
          imageUrl: screenshotFile,
        },
      });
    } else {
      handleSubmit(event, {
        experimental_attachments: files,
      });
    }
    setFiles(undefined);
    setScreenshotFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "submitted":
        return "Sending...";
      case "streaming":
        return "AI is typing...";
      case "ready":
        return "Ready";
      case "error":
        return "Error occurred";
      default:
        return "Ready";
    }
  };

  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error" || error;

  return {
    files,
    setFiles,
    screenshotFile,
    setScreenshotFile,
    modalImage,
    setModalImage,
    isTranscribing,
    isRecording,
    noAudioDetected,
    handleMicButtonClick,
    fileInputRef,
    messages,
    input,
    handleInputChange,
    setInput,
    status,
    error,
    reload,
    handleAudioTranscription,
    handleFormSubmit,
    getStatusDisplay,
    isLoading,
    hasError: !!hasError, // Convert to boolean
  };
}
