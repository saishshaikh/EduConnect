import React, { useContext, useState, useRef, useEffect } from "react";
import { IoMoonOutline, IoSunnyOutline, IoSchoolOutline, IoCheckmark } from "react-icons/io5";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeSwitcher({ className = "", compact = false }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const THEME_OPTIONS = [
    {
      id: "dark",
      label: "Dark Mode",
      desc: "Sleek dark theme with pink accents",
      icon: IoMoonOutline,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      id: "light",
      label: "Light Mode",
      desc: "Clean light theme for daily use",
      icon: IoSunnyOutline,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "education",
      label: "Education",
      desc: "Academic platform theme with blue & gold",
      icon: IoSchoolOutline,
      color: "text-[#0066ff] bg-[#0066ff]/10",
    },
  ];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition select-none"
        title="Switch Theme (Dark, Light, Education)"
      >
        <div className={`p-1.5 rounded-lg ${activeOption.color}`}>
          <ActiveIcon className="w-4 h-4" />
        </div>
        {!compact && (
          <span className="hidden lg:inline text-xs font-semibold text-gray-800 dark:text-gray-200">
            {activeOption.label}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-56 bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#27272a] p-1.5 z-50 animate-slideUp select-none">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
            Choose Theme
          </div>

          <div className="flex flex-col gap-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                    isSelected
                      ? "bg-gray-100 dark:bg-[#27272a] font-bold text-gray-950 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#202023]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-gray-400 font-normal">{opt.desc}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <IoCheckmark className="w-4 h-4 text-[#0066ff] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
