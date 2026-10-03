import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoChatbubbleEllipses, 
  IoPersonAdd, 
  IoHeart, 
  IoChatboxEllipses, 
  IoSparkles, 
  IoVideocam, 
  IoClose 
} from "react-icons/io5";

export default function NotificationToast({ toast, onDismiss }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const { title, subtitle, avatar, type, targetPath, senderName } = toast;

  const handleClick = () => {
    onDismiss();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "message":
        return <IoChatbubbleEllipses className="w-3.5 h-3.5 text-blue-500" />;
      case "connectionRequest":
      case "connectionAccepted":
        return <IoPersonAdd className="w-3.5 h-3.5 text-emerald-500" />;
      case "like":
        return <IoHeart className="w-3.5 h-3.5 text-rose-500" />;
      case "comment":
        return <IoChatboxEllipses className="w-3.5 h-3.5 text-amber-500" />;
      case "story":
        return <IoSparkles className="w-3.5 h-3.5 text-purple-500" />;
      case "call":
        return <IoVideocam className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <IoSparkles className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-down">
      <div 
        onClick={handleClick}
        className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-3.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden select-none group"
      >
        {/* Progress Bar */}
        <div 
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-3">
          {/* User Avatar with Type Badge */}
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img 
                src={avatar} 
                alt={senderName || "User"} 
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {(senderName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700">
              {getIcon()}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {title || senderName}
              </h4>
              <span className="text-[10px] text-gray-400 flex-shrink-0">just now</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Close / Action Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Dismiss"
            >
              <IoClose className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
