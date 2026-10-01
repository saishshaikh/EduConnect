import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSparkles,
  IoArrowForward,
  IoSchoolOutline,
  IoPeopleOutline,
  IoBookOutline,
  IoCheckmarkCircle,
  IoFlashOutline,
} from "react-icons/io5";
import { userDataContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";

export default function EducationHeroPoster({ onOpenCreatePost, onScrollToDiscovery }) {
  const { userData } = useContext(userDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Dynamic Theme Colors: Blue in Education mode, Signature Pink/Magenta in Dark & Light modes
  const gradientBg = isEducation
    ? "bg-gradient-to-br from-[#0052cc] via-[#0066ff] to-[#38bdf8] border-blue-400/30"
    : "bg-gradient-to-br from-[#e1306c] via-[#fd1d1d] to-[#833ab4] border-pink-400/30";

  const primaryTextColor = isEducation ? "text-[#0052cc]" : "text-[#e1306c]";
  const accentTextColor = isEducation ? "text-amber-300" : "text-yellow-300";
  const accentBadgeBorder = isEducation ? "decoration-amber-400/60" : "decoration-yellow-400/60";

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden ${gradientBg} text-white p-6 sm:p-8 lg:p-9 shadow-xl mb-6 border transition-all duration-300`}>
      
      {/* Decorative Background Geometric Circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
        
        {/* Left Column: Headline, Description & CTAs */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-3.5 max-w-[560px]">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-wide shadow-xs">
            <IoSparkles className={`w-3.5 h-3.5 ${accentTextColor}`} />
            <span>Academic Networking & Collaborative Learning</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[38px] font-black tracking-tight leading-[1.15] text-white">
            Education that connects you to{" "}
            <span className={`${accentTextColor} underline decoration-wavy ${accentBadgeBorder}`}>
              what's next.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
            Welcome back, <span className="font-bold text-white">{userData?.firstName || "Scholar"}</span>! Connect with fellow students, discuss with professors, discover academic opportunities, and share your learning journey on EduConnect.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap pt-1.5 w-full">
            <button
              onClick={() => navigate("/network")}
              className={`px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 ${primaryTextColor} text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 group`}
            >
              <span>Explore Network</span>
              <IoArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {onOpenCreatePost && (
              <button
                onClick={onOpenCreatePost}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs sm:text-sm font-bold border border-white/30 shadow-xs hover:scale-105 active:scale-95 transition"
              >
                + Share Knowledge
              </button>
            )}

            {onScrollToDiscovery && (
              <button
                onClick={onScrollToDiscovery}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-white/90 hover:text-white text-xs sm:text-sm font-semibold transition"
              >
                Find Mentors ↓
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 sm:gap-6 pt-2.5 mt-0.5 border-t border-white/20 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <IoCheckmarkCircle className={`w-4 h-4 ${accentTextColor}`} />
              <span>95% Peer Collaboration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoFlashOutline className={`w-4 h-4 ${accentTextColor}`} />
              <span>Real-Time Q&A</span>
            </div>
          </div>

        </div>

        {/* Right Column: Visual Poster Card & Floating Badges */}
        <div className="relative w-full max-w-[320px] sm:max-w-[360px] flex-shrink-0 flex items-center justify-center">
          
          {/* Main Visual Poster Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] rounded-3xl bg-gradient-to-tr from-white/20 to-white/10 backdrop-blur-md border border-white/30 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Tag */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>EduConnect Live</span>
              </div>
              <span className={`${accentTextColor} font-bold text-xs bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/30`}>
                ⭐ Community
              </span>
            </div>

            {/* Central Graphic Illustration */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-3 z-10">
              <div className="w-18 h-18 rounded-2xl bg-white shadow-2xl flex items-center justify-center text-3xl mb-2.5 transform hover:rotate-6 transition">
                🎓
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                Academic Hub
              </h3>
              <p className="text-[11px] text-white/90 max-w-[220px] mt-1">
                Collaborate with peers, educators & researchers worldwide
              </p>
            </div>

            {/* Bottom Student Count Card */}
            <div className="bg-white text-gray-900 rounded-2xl p-3 shadow-lg flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${isEducation ? "bg-blue-100 text-[#0052cc]" : "bg-pink-100 text-[#e1306c]"} flex items-center justify-center font-bold text-sm`}>
                  <IoPeopleOutline className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">Active Community</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Students & Faculty</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/network")}
                className={`text-xs font-black ${primaryTextColor} ${isEducation ? "bg-blue-50" : "bg-pink-50"} px-2.5 py-1 rounded-lg hover:opacity-80 transition`}
              >
                Connect
              </button>
            </div>

          </div>

          {/* Floating Badge 1 (Top Left) */}
          <div className="absolute -top-3 -left-3 sm:-left-4 bg-white text-gray-900 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 border border-gray-100 animate-float-slow z-20">
            <span className="text-base">👨‍🏫</span>
            <div className="text-left">
              <p className="text-[11px] font-bold leading-tight">Verified Faculty</p>
              <p className="text-[9px] text-gray-400">Mentorship</p>
            </div>
          </div>

          {/* Floating Badge 2 (Bottom Right) */}
          <div className="absolute -bottom-3 -right-3 sm:-right-4 bg-white text-gray-900 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 font-bold text-xs animate-float-reverse z-20 border border-gray-100">
            <IoBookOutline className={`w-4 h-4 ${primaryTextColor}`} />
            <span>Knowledge Sharing</span>
          </div>

        </div>

      </div>

    </div>
  );
}
