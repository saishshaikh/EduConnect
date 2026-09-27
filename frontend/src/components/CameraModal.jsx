import React, { useState, useRef, useEffect } from "react";
import {
  IoClose,
  IoCameraReverseOutline,
  IoSend,
  IoRefreshOutline,
  IoCheckmark,
} from "react-icons/io5";

export default function CameraModal({ isOpen, onClose, onSendPhoto }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"
  const [capturedPhoto, setCapturedPhoto] = useState(null); // Blob / DataURL
  const [caption, setCaption] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [flash, setFlash] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera stream
  const startCamera = async (mode) => {
    stopCamera();
    setCameraError("");

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access camera. Please allow camera permissions in your browser."
      );
    }
  };

  // Stop camera tracks
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setCaption("");
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Flip front/back camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Capture frame from video to canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      // Mirror image for front camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedPhoto({
          blob,
          previewUrl: URL.createObjectURL(blob),
        });
      }
    }, "image/jpeg", 0.9);
  };

  const handleRetake = () => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  const handleSend = () => {
    if (!capturedPhoto?.blob) return;
    onSendPhoto(capturedPhoto.blob, caption.trim());
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(null);
    setCaption("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-[480px] h-[85vh] max-h-[640px] bg-[#121212] rounded-3xl overflow-hidden flex flex-col justify-between border border-gray-800 shadow-2xl">
        
        {/* Top Controls */}
        <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/70 to-transparent">
          <button
            onClick={handleClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-black/40 backdrop-blur-sm transition"
          >
            <IoClose className="w-6 h-6" />
          </button>

          <span className="text-white text-xs font-bold tracking-wider uppercase">
            {capturedPhoto ? "Photo Preview" : "Camera"}
          </span>

          {!capturedPhoto ? (
            <button
              onClick={handleFlipCamera}
              className="p-2 text-white/80 hover:text-white rounded-full bg-black/40 backdrop-blur-sm transition"
            >
              <IoCameraReverseOutline className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Camera Viewport / Photo Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-gray-400 flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-red-400">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition"
              >
                Try Again
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto.previewUrl}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "-scale-x-100" : ""
              }`}
            />
          )}

          {/* Flash Effect on Capture */}
          {flash && (
            <div className="absolute inset-0 bg-white opacity-80 pointer-events-none transition-opacity duration-150" />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Bar Controls */}
        <div className="p-4 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col gap-3">
          {capturedPhoto ? (
            <div className="flex flex-col gap-3">
              {/* Optional Caption */}
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-white/60 transition"
              />

              {/* Action Buttons: Retake vs Send */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition"
                >
                  <IoRefreshOutline className="w-4 h-4" />
                  Retake
                </button>

                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white text-xs font-bold rounded-full shadow-lg hover:opacity-90 active:scale-95 transition"
                >
                  <span>Send</span>
                  <IoSend className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              {/* Large Shutter Button */}
              <button
                onClick={handleCapture}
                disabled={!!cameraError}
                className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-40"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-gray-300 transition" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
