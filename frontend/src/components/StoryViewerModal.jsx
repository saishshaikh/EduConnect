import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios from "axios";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoEyeOutline,
  IoTrashOutline,
  IoVolumeMuteOutline,
  IoVolumeHighOutline,
  IoTimeOutline,
  IoPersonOutline,
} from "react-icons/io5";
import moment from "moment";
import dp from "../assets/dp.webp";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";

export default function StoryViewerModal({
  isOpen,
  onClose,
  initialUserIndex = 0,
  storyFeed = [],
  onStoryDeleted,
}) {
  const { serverUrl } = useContext(authDataContext);
  const { userData, recordStoryView, deleteStory } = useContext(userDataContext);

  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Viewers Drawer for story owner
  const [showViewers, setShowViewers] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const videoRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Reset indices when opened with a new user
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(Math.max(0, Math.min(initialUserIndex, (storyFeed.length || 1) - 1)));
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
      setShowViewers(false);
    }
  }, [isOpen, initialUserIndex, storyFeed]);

  const currentUserGroup = storyFeed[currentUserIndex] || null;
  const userStories = currentUserGroup?.stories || [];
  const currentStory = userStories[currentStoryIndex] || null;
  const isOwner = Boolean(
    userData?._id &&
    currentUserGroup?.user?._id &&
    userData._id.toString() === currentUserGroup.user._id.toString()
  );

  // Record view on story change
  useEffect(() => {
    if (currentStory?._id && isOpen && !isOwner) {
      recordStoryView(currentStory._id);
    }
  }, [currentStory?._id, isOpen, isOwner, recordStoryView]);

  // Handle next story navigation
  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < storyFeed.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, userStories.length, currentUserIndex, storyFeed.length, onClose]);

  // Handle previous story navigation
  const handlePrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIndex);
      const prevUserStories = storyFeed[prevUserIndex]?.stories || [];
      setCurrentStoryIndex(Math.max(0, prevUserStories.length - 1));
      setProgress(0);
    }
  }, [currentStoryIndex, currentUserIndex, storyFeed]);

  // Timer loop for progressing story
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused || showViewers) return;

    if (currentStory.mediaType === "video") {
      // Video manages its own progress via timeupdate
      return;
    }

    const durationMs = 6000; // 6 seconds for images/text
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(progressTimerRef.current);
  }, [isOpen, currentStory, isPaused, showViewers, handleNextStory]);

  // Video timeupdate handler
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    handleNextStory();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showViewers) setShowViewers(false);
        else onClose();
      } else if (e.key === "ArrowRight") {
        handleNextStory();
      } else if (e.key === "ArrowLeft") {
        handlePrevStory();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showViewers, handleNextStory, handlePrevStory, onClose]);

  // Fetch viewers when owner opens viewers drawer
  const handleFetchViewers = async () => {
    if (!currentStory?._id || !isOwner) return;
    try {
      setLoadingViewers(true);
      setShowViewers(true);
      setIsPaused(true);
      const res = await axios.get(`${serverUrl}/api/story/${currentStory._id}/viewers`, {
        withCredentials: true,
      });
      setViewersList(res.data || []);
    } catch (err) {
      console.error("Error fetching viewers:", err);
      setViewersList([]);
    } finally {
      setLoadingViewers(false);
    }
  };

  // Handle delete story
  const handleDeleteCurrentStory = async () => {
    if (!currentStory?._id || !isOwner || deleting) return;
    if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      setDeleting(true);
      await deleteStory(currentStory._id);
      if (onStoryDeleted) onStoryDeleted();

      if (userStories.length > 1) {
        if (currentStoryIndex >= userStories.length - 1) {
          setCurrentStoryIndex((prev) => Math.max(0, prev - 1));
        }
        setProgress(0);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Failed to delete story:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !currentUserGroup || !currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Desktop Prev Button */}
      {currentUserIndex > 0 || currentStoryIndex > 0 ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevStory();
          }}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition backdrop-blur-sm"
          title="Previous story"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
      ) : null}

      {/* Main Story Container */}
      <div
        className="relative w-full h-full sm:h-[90vh] sm:max-h-[750px] sm:max-w-[420px] bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border-0 sm:border border-gray-800"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Overlay: Progress Bars & Author Details */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full mb-3">
            {userStories.map((_, idx) => {
              let segmentWidth = "0%";
              if (idx < currentStoryIndex) segmentWidth = "100%";
              else if (idx === currentStoryIndex) segmentWidth = `${progress}%`;

              return (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: segmentWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Story User Header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUserGroup.user?.profileImage || dp}
                alt={currentUserGroup.user?.firstName}
                className="w-9 h-9 rounded-full object-cover border border-white/40 ring-1 ring-white/20"
              />
              <div className="leading-tight">
                <p className="text-xs font-bold truncate max-w-[170px]">
                  {currentUserGroup.user?.firstName} {currentUserGroup.user?.lastName}
                </p>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <IoTimeOutline className="w-3 h-3" />
                  {moment(currentStory.createdAt).fromNow()}
                </p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2">
              {currentStory.mediaType === "video" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <IoVolumeMuteOutline className="w-4 h-4" />
                  ) : (
                    <IoVolumeHighOutline className="w-4 h-4" />
                  )}
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCurrentStory();
                  }}
                  disabled={deleting}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-rose-600 text-white transition"
                  title="Delete story"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
                title="Close"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Center Media / Canvas */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          
          {/* 1. Image Story */}
          {currentStory.mediaType === "image" && (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* 2. Video Story */}
          {currentStory.mediaType === "video" && (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* 3. Text Story */}
          {currentStory.mediaType === "text" && (
            <div
              style={{ background: currentStory.background }}
              className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <p
                style={{ color: currentStory.textColor || "#ffffff" }}
                className={`text-lg sm:text-xl font-bold leading-relaxed max-w-[320px] drop-shadow-md break-words ${
                  currentStory.fontStyle === "serif"
                    ? "font-serif"
                    : currentStory.fontStyle === "mono"
                    ? "font-mono"
                    : "font-sans"
                }`}
              >
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Caption Overlay (For Image & Video Stories) */}
          {currentStory.mediaType !== "text" && currentStory.content && (
            <div className="absolute bottom-16 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center">
              <p className="text-white text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-xs inline-block px-3.5 py-1.5 rounded-xl max-w-[90%] break-words">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Invisible Navigation Tap Zones (Left 35% / Right 35%) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            className="absolute left-0 top-16 bottom-16 w-[35%] z-20 cursor-pointer"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            className="absolute right-0 top-16 bottom-16 w-[35%] z-20 cursor-pointer"
          />
        </div>

        {/* Bottom Bar: Owner Views or Quick Reply */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent">
          {isOwner ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFetchViewers();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition"
              >
                <IoEyeOutline className="w-4 h-4" />
                <span>{currentStory.viewCount ?? userStories[currentStoryIndex]?.viewCount ?? 0} Views</span>
              </button>

              <span className="text-[10px] text-white/60">
                Story expires in 24h
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${currentUserGroup.user?.firstName || "user"}...`}
                className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-white/60 backdrop-blur-xs transition"
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
            </div>
          )}
        </div>

        {/* Viewers Drawer Modal (Owner Only) */}
        {showViewers && (
          <div
            className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#18181b] rounded-t-3xl border-t border-gray-800 max-h-[70%] flex flex-col p-4">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <IoEyeOutline className="w-5 h-5 text-[#e1306c]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Story Viewers ({viewersList.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewers(false);
                    setIsPaused(false);
                  }}
                  className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              {/* Viewers List */}
              <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 custom-scrollbar">
                {loadingViewers ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    Loading viewers...
                  </div>
                ) : viewersList.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                    <IoPersonOutline className="w-6 h-6 text-gray-500" />
                    <p>No views yet. Be the first to share your link!</p>
                  </div>
                ) : (
                  viewersList.map((item, idx) => (
                    <div
                      key={item.user?._id || idx}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.user?.profileImage || dp}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-gray-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {item.user?.firstName} {item.user?.lastName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            @{item.user?.userName}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-500">
                        {moment(item.viewedAt).fromNow()}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Desktop Next Button */}
      {currentUserIndex < storyFeed.length - 1 || currentStoryIndex < userStories.length - 1 ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextStory();
          }}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition backdrop-blur-sm"
          title="Next story"
        >
          <IoChevronForward className="w-6 h-6" />
        </button>
      ) : null}

    </div>
  );
}
