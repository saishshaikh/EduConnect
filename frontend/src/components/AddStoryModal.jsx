import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import {
  IoClose,
  IoImageOutline,
  IoVideocamOutline,
  IoTextOutline,
  IoCloudUploadOutline,
  IoColorPaletteOutline,
  IoCheckmark,
} from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";

const GRADIENT_PRESETS = [
  { id: "brand", label: "EduConnect", style: "linear-gradient(135deg, #e1306c 0%, #833ab4 100%)" },
  { id: "sunset", label: "Sunset", style: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" },
  { id: "ocean", label: "Ocean", style: "linear-gradient(135deg, #0095f6 0%, #00d2ff 100%)" },
  { id: "cyber", label: "Cyber", style: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" },
  { id: "midnight", label: "Midnight", style: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" },
  { id: "neon", label: "Neon", style: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" },
];

const FONT_PRESETS = [
  { id: "sans", label: "Modern", className: "font-sans" },
  { id: "serif", label: "Classic", className: "font-serif" },
  { id: "mono", label: "Code", className: "font-mono" },
];

export default function AddStoryModal({ isOpen, onClose, onStoryCreated }) {
  const { serverUrl } = useContext(authDataContext);
  const { userData, fetchStoriesFeed } = useContext(userDataContext);

  const [storyType, setStoryType] = useState("media"); // "media" | "text"
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [caption, setCaption] = useState("");

  // Text story state
  const [textContent, setTextContent] = useState("");
  const [activeGradient, setActiveGradient] = useState(GRADIENT_PRESETS[0].style);
  const [activeFont, setActiveFont] = useState(FONT_PRESETS[0].id);
  const [textColor, setTextColor] = useState("#ffffff");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      setErrorMessage("Please select a valid image (JPEG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File size exceeds 50MB limit.");
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCaption("");
    setTextContent("");
    setErrorMessage("");
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);
      const formData = new FormData();

      if (storyType === "media") {
        if (!selectedFile) {
          setErrorMessage("Please select an image or video to upload.");
          setLoading(false);
          return;
        }
        formData.append("media", selectedFile);
        formData.append("mediaType", mediaType);
        formData.append("content", caption.trim());
      } else {
        if (!textContent.trim()) {
          setErrorMessage("Please write some text for your story.");
          setLoading(false);
          return;
        }
        formData.append("mediaType", "text");
        formData.append("content", textContent.trim());
        formData.append("background", activeGradient);
        formData.append("textColor", textColor);
        formData.append("fontStyle", activeFont);
      }

      await axios.post(`${serverUrl}/api/story/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchStoriesFeed();
      if (onStoryCreated) onStoryCreated();
      handleClose();
    } catch (err) {
      console.error("Story creation error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to create story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[500px] bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh] animate-slideUp text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[54px] px-5 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <h3 className="text-sm font-bold bg-gradient-to-r from-[#e1306c] to-[#833ab4] bg-clip-text text-transparent">
            Create Story
          </h3>
          <button
            onClick={handleSubmit}
            disabled={loading || (storyType === "media" ? !selectedFile : !textContent.trim())}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] hover:opacity-90 text-white text-xs font-bold transition disabled:opacity-40 shadow-xs"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        {/* Story Type Selector Tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#18181b]/50">
          <button
            type="button"
            onClick={() => {
              setStoryType("media");
              setErrorMessage("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              storyType === "media"
                ? "text-[#e1306c] border-b-2 border-[#e1306c] bg-white dark:bg-[#121212]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <IoImageOutline className="w-4 h-4" />
            <span>Photo / Video</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStoryType("text");
              setErrorMessage("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              storyType === "text"
                ? "text-[#e1306c] border-b-2 border-[#e1306c] bg-white dark:bg-[#121212]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <IoTextOutline className="w-4 h-4" />
            <span>Text Story</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. MEDIA STORY COMPOSER */}
          {storyType === "media" && (
            <div className="flex flex-col gap-4">
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[9/12] max-h-[340px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e1306c] dark:hover:border-[#e1306c] bg-gray-50 dark:bg-[#1c1c1e] flex flex-col items-center justify-center gap-3 cursor-pointer group transition p-6 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e1306c]/10 to-[#833ab4]/10 dark:from-[#e1306c]/20 dark:to-[#833ab4]/20 flex items-center justify-center text-[#e1306c] group-hover:scale-110 transition">
                    <IoCloudUploadOutline className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Click to upload photo or video
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Supports JPG, PNG, WEBP, GIF, MP4 (Max 50MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[9/12] max-h-[340px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-gray-200 dark:border-gray-800">
                  {mediaType === "video" ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Story preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition"
                    title="Remove file"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your story..."
                    className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none transition"
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. TEXT STORY COMPOSER */}
          {storyType === "text" && (
            <div className="flex flex-col gap-4">
              {/* Story Canvas Preview */}
              <div
                style={{ background: activeGradient }}
                className="w-full aspect-[9/12] max-h-[320px] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden transition-all duration-300"
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type something educational, inspiring, or new..."
                  maxLength={500}
                  style={{ color: textColor }}
                  className={`w-full bg-transparent resize-none outline-none text-center font-bold text-base sm:text-lg placeholder-white/60 drop-shadow-md ${
                    activeFont === "serif" ? "font-serif" : activeFont === "mono" ? "font-mono" : "font-sans"
                  }`}
                  rows={4}
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-white/70 font-mono">
                  {textContent.length}/500
                </span>
              </div>

              {/* Gradient Theme Picker */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                  <IoColorPaletteOutline className="w-3.5 h-3.5 text-[#e1306c]" />
                  Background Gradient
                </label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActiveGradient(preset.style)}
                      style={{ background: preset.style }}
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white transition-transform ${
                        activeGradient === preset.style ? "ring-2 ring-white scale-110 shadow-md" : "hover:scale-105"
                      }`}
                      title={preset.label}
                    >
                      {activeGradient === preset.style && <IoCheckmark className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style & Text Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                    Font Style
                  </label>
                  <div className="flex bg-gray-100 dark:bg-[#1c1c1e] p-1 rounded-xl">
                    {FONT_PRESETS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setActiveFont(font.id)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                          activeFont === font.id
                            ? "bg-white dark:bg-[#27272a] text-[#e1306c] shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                    Text Color
                  </label>
                  <div className="flex gap-2 items-center h-[34px]">
                    {["#ffffff", "#000000", "#fef08a", "#a7f3d0", "#bae6fd"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTextColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full border border-gray-400/40 transition-transform ${
                          textColor === color ? "ring-2 ring-[#e1306c] scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-gray-50 dark:bg-[#18181b] border-t border-gray-100 dark:border-[#262626] text-center">
          <p className="text-[10px] text-gray-400">
            Stories automatically disappear after 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
