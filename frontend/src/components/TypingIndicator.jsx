import React from "react";

export const TypingIndicator = ({ typingUsers = [], userName = "" }) => {
  // If typingUsers is provided, format user names cleanly
  let displayName = userName;
  if (Array.isArray(typingUsers) && typingUsers.length > 0) {
    if (typingUsers.length === 1) {
      displayName = typingUsers[0].userName || typingUsers[0].firstName || "Someone";
    } else if (typingUsers.length === 2) {
      displayName = `${typingUsers[0].userName || "Someone"} & ${typingUsers[1].userName || "Someone"}`;
    } else {
      displayName = `${typingUsers[0].userName || "Someone"} and ${typingUsers.length - 1} others`;
    }
  }

  if (!displayName) return null;

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/50 dark:border-zinc-700/50 shadow-sm w-fit max-w-[85%] text-xs font-medium text-slate-700 dark:text-zinc-200 transition-all duration-300 animate-fadeIn"
      role="status"
      aria-live="polite"
      aria-label={`${displayName} is typing`}
    >
      {/* Animated Bot Avatar */}
      <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white text-[13px] shadow-sm animate-bounce [animation-duration:1.6s]">
        <span className="select-none">🤖</span>
        {/* Glow halo */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-zinc-900 animate-ping [animation-duration:2s]" />
      </div>

      {/* Name and Text */}
      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="font-semibold text-slate-900 dark:text-zinc-100">{displayName}</span>
        <span className="text-slate-500 dark:text-zinc-400">is typing</span>
      </div>

      {/* Animated Dots Wave */}
      <div className="flex items-center gap-1 pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-pink-500 animate-pulse [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-pink-500 animate-pulse [animation-delay:200ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-pink-500 animate-pulse [animation-delay:400ms]" />
      </div>
    </div>
  );
};

export default TypingIndicator;
