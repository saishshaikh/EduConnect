import React, { useContext, useState, useRef } from "react";
import axios from "axios";
import { IoClose, IoImagesOutline, IoArrowBack } from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";

export default function CreatePostModal({ isOpen, onClose }) {
  const { userData, postData, setPostData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const [description, setDescription] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async () => {
    if (!description.trim() && !backendImage) return;

    try {
      setPosting(true);
      const formData = new FormData();
      formData.append("description", description.trim());
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const res = await axios.post(
        `${serverUrl}/api/post/create`,
        formData,
        { withCredentials: true }
      );

      // Prepend new post to global feed
      if (res.data) {
        setPostData([res.data, ...postData]);
      }

      // Reset state and close modal
      setDescription("");
      setFrontendImage("");
      setBackendImage(null);
      onClose();
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleReset = () => {
    setFrontendImage("");
    setBackendImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-[620px] bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-[52px] px-4 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          {frontendImage ? (
            <button
              onClick={handleReset}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}

          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Create New Post
          </h3>

          <button
            onClick={handleCreatePost}
            disabled={(!description.trim() && !backendImage) || posting}
            className="text-[#0095f6] hover:text-[#0074cc] font-bold text-sm disabled:opacity-40 transition"
          >
            {posting ? "Sharing..." : "Share"}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* User Header */}
          {userData && (
            <div className="flex items-center gap-3">
              <img
                src={userData.profileImage || dp}
                alt={userData.firstName}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Posting to EduConnect
                </p>
              </div>
            </div>
          )}

          {/* Caption Area */}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind? Share a project, concept, or update..."
            className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
          />

          {/* Image Selector / Preview */}
          {frontendImage ? (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-gray-100 dark:border-gray-800 max-h-[380px] flex items-center justify-center">
              <img
                src={frontendImage}
                alt="Upload preview"
                className="w-full max-h-[380px] object-cover"
              />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                dragActive
                  ? "border-[#e1306c] bg-pink-50/20 dark:bg-pink-950/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-[#18181b]/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0095f6] flex items-center justify-center">
                <IoImagesOutline className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Drag photos here or click to browse
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  PNG, JPG, WEBP, GIF
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between text-xs">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            <IoImagesOutline className="w-4 h-4 text-[#e1306c]" />
            <span>{frontendImage ? "Change photo" : "Add photo"}</span>
          </button>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
