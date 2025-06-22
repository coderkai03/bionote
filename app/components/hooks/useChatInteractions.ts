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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleSubmit: originalHandleSubmit,
    handleInputChange,
    setInput,
    status,
    error,
    reload,
    setMessages,
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageGeneration = async () => {
    setIsGeneratingImage(true);
    try {
      interface CoreMessage {
        id?: string;
        role: "user" | "assistant" | "system";
        content: string;
      }
      const filteredMessages = messages.filter(
        (m) =>
          m.role === "user" || m.role === "assistant" || m.role === "system"
      ) as CoreMessage[];

      const currentMessages: CoreMessage[] = [
        ...filteredMessages,
        {
          id: Date.now().toString(),
          role: "user" as const,
          content: input,
        },
      ];

      interface ImageGenerationRequest {
        messages: typeof currentMessages;
        data?: {
          imageUrl?: string;
        };
      }

      const requestData: ImageGenerationRequest = {
        messages: currentMessages,
      };

      const imageData =
        screenshotFile ||
        (files && files[0] ? await fileToBase64(files[0]) : null);
      if (imageData) {
        requestData.data = { imageUrl: imageData };
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: input,
        experimental_attachments: imageData
          ? [
              {
                name: "input.png",
                contentType: "image/png",
                url: imageData,
              },
            ]
          : undefined,
      };
      setMessages((messages) => [...messages, userMessage]);

      const response = await fetch("/api/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const result = await response.json();
      if (result.imageUrl) {
        let assistantContent = `Here's the generated image based on your prompt: "${result.prompt}"`;
        if (result.demoMode) {
          assistantContent = `🛠️ **Demo Mode**: ${result.message}\n\nGenerated image based on your prompt: "${result.prompt}"`;
        } else if (result.analysis) {
          assistantContent = `I analyzed your image and generated a new one based on your request: "${result.prompt}"\n\nImage Analysis: ${result.analysis}`;
        }
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: assistantContent,
          experimental_attachments: [
            {
              name: result.demoMode ? "demo_image.png" : "generated_image.png",
              contentType: "image/png",
              url: result.imageUrl,
            },
          ],
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      const errorMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: `Sorry, I couldn't generate the image. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
      setMessages([
        ...messages,
        {
          id: (Date.now() - 1).toString(),
          role: "user" as const,
          content: input,
        },
        errorMessage,
      ]);
    } finally {
      setIsGeneratingImage(false);
      setInput("");
      setFiles(undefined);
      setScreenshotFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (input.trim().startsWith("/image")) {
      await handleImageGeneration();
      return;
    }
    if (screenshotFile && !files) {
      const screenshotAttachment = [
        {
          name: "screenshot.png",
          contentType: "image/png",
          url: screenshotFile,
        },
      ];
      originalHandleSubmit(event, {
        experimental_attachments: screenshotAttachment,
        data: {
          imageUrl: screenshotFile,
        },
      });
    } else {
      originalHandleSubmit(event, {
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
    if (isGeneratingImage) {
      const hasImageAttachment =
        screenshotFile ||
        (files && files[0] && files[0].type.startsWith("image/"));
      return hasImageAttachment
        ? "Editing image with AI..."
        : "Generating image...";
    }
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

  const isLoading =
    status === "submitted" ||
    status === "streaming" ||
    isGeneratingImage ||
    isTranscribing;
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
    isGeneratingImage,
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
