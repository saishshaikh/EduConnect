import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSparkles,
  IoArrowForward,
  IoPeopleOutline,
  IoBookOutline,
  IoCheckmarkCircle,
  IoFlashOutline,
  IoVideocamOutline,
  IoRocketOutline,
  IoBriefcaseOutline,
  IoChatbubblesOutline,
  IoChevronBack,
  IoChevronForward,
  IoPlayOutline,
  IoShieldCheckmarkOutline,
  IoNotificationsOutline
} from "react-icons/io5";
import { userDataContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";

export default function EducationHeroPoster({ onOpenCreatePost, onScrollToDiscovery }) {
  const { userData } = useContext(userDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "granted"
  );

  const touchStartXRef = useRef(null);
  const userName = userData?.firstName || "Scholar";

  // Request browser notification permission
  const handleEnableNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
    }
  };

  // 6 Solid, Ultra-Modern Poster Designs
  const slides = [
    {
      id: "academic-hub",
      badge: "Academic Networking & Learning",
      badgeIcon: <IoSparkles className="w-3.5 h-3.5 text-yellow-300" />,
      headline: "Education that connects you to",
      highlightText: "what's next.",
      description: `Welcome back, ${userName}! Connect with fellow students, discuss with professors, and accelerate your academic journey together.`,
      primaryCta: { text: "Explore Network", action: () => navigate("/network"), icon: <IoArrowForward className="w-4 h-4" /> },
      secondaryCta: { text: "+ Share Knowledge", action: onOpenCreatePost },
      metrics: [
        { icon: <IoCheckmarkCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />, label: "95% Peer Collaboration" },
        { icon: <IoFlashOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />, label: "Real-Time Q&A" },
      ],
      gradient: isEducation 
        ? "from-[#0052cc] via-[#0066ff] to-[#38bdf8]" 
        : "from-[#e1306c] via-[#fd1d1d] to-[#833ab4]",
      accentTextColor: "text-amber-300",
      graphicIcon: "🎓",
      graphicTitle: "Academic Hub",
      graphicSubtitle: "Collaborate with peers, educators & researchers worldwide",
      badge1: { icon: "👨‍🏫", title: "Verified Faculty", sub: "Mentorship" },
      badge2: { icon: <IoBookOutline className="w-4 h-4 text-blue-600" />, title: "Knowledge Sharing" },
      bottomCardTitle: "Active Community",
      bottomCardSub: "Students & Faculty",
      bottomCardCta: "Connect",
      bottomCardAction: () => navigate("/network")
    },
    {
      id: "live-mentorship",
      badge: "Live 1-on-1 Audio & Video Calls",
      badgeIcon: <IoVideocamOutline className="w-3.5 h-3.5 text-cyan-300" />,
      headline: "Instant Mentorship & Study Calls in",
      highlightText: "Real-Time.",
      description: "Start crystal-clear WebRTC video or voice sessions with classmates and mentors right inside your phone without any extra apps.",
      primaryCta: { text: "Open Messages & Calls", action: () => navigate("/chat"), icon: <IoVideocamOutline className="w-4 h-4" /> },
      secondaryCta: { text: "Find Mentors", action: onScrollToDiscovery || (() => navigate("/network")) },
      metrics: [
        { icon: <IoFlashOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />, label: "HD Low-Latency Calls" },
        { icon: <IoShieldCheckmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />, label: "End-to-End Encrypted" },
      ],
      gradient: "from-[#0d9488] via-[#0284c7] to-[#4f46e5]",
      accentTextColor: "text-cyan-200",
      graphicIcon: "🎙️",
      graphicTitle: "Live Study Rooms",
      graphicSubtitle: "One-click peer call & screen sharing for project reviews",
      badge1: { icon: "⚡", title: "Instant Connect", sub: "WebRTC Powered" },
      badge2: { icon: <IoVideocamOutline className="w-4 h-4 text-teal-600" />, title: "Voice & Video" },
      bottomCardTitle: "Online Now",
      bottomCardSub: "Peers ready to collaborate",
      bottomCardCta: "Call Now",
      bottomCardAction: () => navigate("/chat")
    },
    {
      id: "smart-feed",
      badge: "Campus Stories & 24h Updates",
      badgeIcon: <IoFlashOutline className="w-3.5 h-3.5 text-pink-300" />,
      headline: "Share your campus moments & stories with",
      highlightText: "the World.",
      description: "Post 24-hour visual stories, insights, club updates, project demos, and achievements directly to your student network.",
      primaryCta: { text: "View Student Stories", action: () => navigate("/feed"), icon: <IoPlayOutline className="w-4 h-4" /> },
      secondaryCta: { text: "+ Add Your Story", action: onOpenCreatePost },
      metrics: [
        { icon: <IoCheckmarkCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300" />, label: "24h Expiring Stories" },
        { icon: <IoChatbubblesOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />, label: "Instant Reactions" },
      ],
      gradient: "from-[#ec4899] via-[#8b5cf6] to-[#3b82f6]",
      accentTextColor: "text-pink-200",
      graphicIcon: "📸",
      graphicTitle: "Campus Stories",
      graphicSubtitle: "Catch up on what students & creators are sharing today",
      badge1: { icon: "🔥", title: "Daily Vibes", sub: "Trending Posts" },
      badge2: { icon: <IoSparkles className="w-4 h-4 text-purple-600" />, title: "Live Highlights" },
      bottomCardTitle: "Explore Feed",
      bottomCardSub: "Curated student posts",
      bottomCardCta: "Explore",
      bottomCardAction: () => navigate("/feed")
    },
    {
      id: "projects-hackathons",
      badge: "Projects & Team Building",
      badgeIcon: <IoRocketOutline className="w-3.5 h-3.5 text-amber-300" />,
      headline: "Build innovative projects & find your",
      highlightText: "dream teammates.",
      description: "Looking for developers, designers, or research partners? Pitch your project ideas and recruit skilled team members instantly.",
      primaryCta: { text: "Discover Opportunities", action: () => navigate("/explore"), icon: <IoRocketOutline className="w-4 h-4" /> },
      secondaryCta: { text: "Post a Project", action: onOpenCreatePost },
      metrics: [
        { icon: <IoRocketOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />, label: "50+ Active Projects" },
        { icon: <IoPeopleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />, label: "Multi-Disciplinary" },
      ],
      gradient: "from-[#ea580c] via-[#f59e0b] to-[#84cc16]",
      accentTextColor: "text-amber-100",
      graphicIcon: "🚀",
      graphicTitle: "Project Nexus",
      graphicSubtitle: "Turn ideas into reality with passionate student builders",
      badge1: { icon: "🏆", title: "Hackathons", sub: "Find Teammates" },
      badge2: { icon: <IoRocketOutline className="w-4 h-4 text-amber-600" />, title: "Build & Win" },
      bottomCardTitle: "Open Roles",
      bottomCardSub: "Frontend, AI & UI Designers",
      bottomCardCta: "Join Team",
      bottomCardAction: () => navigate("/explore")
    },
    {
      id: "career-internships",
      badge: "Career Growth & Placement Prep",
      badgeIcon: <IoBriefcaseOutline className="w-3.5 h-3.5 text-emerald-300" />,
      headline: "Showcase your portfolio & land top",
      highlightText: "internships.",
      description: "Get discovered by mentors and recruiters. Share your GitHub, resume, verified projects, and interview experiences.",
      primaryCta: { text: "Build Your Profile", action: () => navigate("/profile"), icon: <IoBriefcaseOutline className="w-4 h-4" /> },
      secondaryCta: { text: "Connect with Alumni", action: () => navigate("/network") },
      metrics: [
        { icon: <IoShieldCheckmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />, label: "Verified Credentials" },
        { icon: <IoPeopleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />, label: "Alumni Network" },
      ],
      gradient: "from-[#1e293b] via-[#0f766e] to-[#047857]",
      accentTextColor: "text-emerald-300",
      graphicIcon: "💼",
      graphicTitle: "Career Launchpad",
      graphicSubtitle: "Resume reviews, mock interviews & referral connections",
      badge1: { icon: "🌟", title: "Top Referrals", sub: "Alumni in Tech" },
      badge2: { icon: <IoBriefcaseOutline className="w-4 h-4 text-emerald-600" />, title: "Placement Hub" },
      bottomCardTitle: "Profile Strength",
      bottomCardSub: "Stand out to mentors",
      bottomCardCta: "Update",
      bottomCardAction: () => navigate("/profile")
    },
    {
      id: "ai-learning",
      badge: "Smart Q&A & Peer Discussions",
      badgeIcon: <IoSparkles className="w-3.5 h-3.5 text-indigo-300" />,
      headline: "Stuck on a problem? Get fast solutions from",
      highlightText: "the community.",
      description: "Ask academic doubts, discuss complex assignments, and get step-by-step guidance from subject toppers and instructors.",
      primaryCta: { text: "Explore Discussions", action: () => navigate("/explore"), icon: <IoArrowForward className="w-4 h-4" /> },
      secondaryCta: { text: "Ask a Question", action: onOpenCreatePost },
      metrics: [
        { icon: <IoFlashOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />, label: "Fast Responses" },
        { icon: <IoCheckmarkCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />, label: "Verified Answers" },
      ],
      gradient: "from-[#312e81] via-[#4338ca] to-[#7c3aed]",
      accentTextColor: "text-indigo-200",
      graphicIcon: "💡",
      graphicTitle: "Knowledge Base",
      graphicSubtitle: "24/7 collaborative learning & academic problem solving",
      badge1: { icon: "🧠", title: "Instant Answers", sub: "Peer Reviewed" },
      badge2: { icon: <IoFlashOutline className="w-4 h-4 text-indigo-600" />, title: "Study Faster" },
      bottomCardTitle: "Top Questions",
      bottomCardSub: "Math, CS & Core Engg",
      bottomCardCta: "Solve Now",
      bottomCardAction: () => navigate("/explore")
    }
  ];

  // Auto-slide interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (diffX > 45) {
      handleNext();
    } else if (diffX < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <div 
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${slide.gradient} text-white p-4 sm:p-7 lg:p-9 shadow-xl mb-4 sm:mb-6 border border-white/20 transition-all duration-700 select-none`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative Floating Blurs */}
      <div className="absolute -top-20 -right-20 sm:-top-24 sm:-right-24 w-60 sm:w-96 h-60 sm:h-96 rounded-full bg-white/10 blur-2xl sm:blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 sm:-bottom-24 sm:-left-24 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-white/10 blur-2xl sm:blur-3xl pointer-events-none" />

      {/* Desktop / Tablet Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 items-center justify-center text-white transition hover:scale-110 active:scale-95 shadow-md"
        title="Previous Slide"
      >
        <IoChevronBack className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 items-center justify-center text-white transition hover:scale-110 active:scale-95 shadow-md"
        title="Next Slide"
      >
        <IoChevronForward className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 lg:gap-10 sm:px-4">
        
        {/* Left Column: Headlines, Description & CTAs */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-2.5 sm:gap-3.5 max-w-[560px] w-full">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-xs">
            {slide.badgeIcon}
            <span className="truncate">{slide.badge}</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] xl:text-[38px] font-black tracking-tight leading-[1.2] text-white">
            {slide.headline}{" "}
            <span className={`${slide.accentTextColor} underline decoration-wavy decoration-white/40`}>
              {slide.highlightText}
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
            {slide.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 flex-wrap pt-1 w-full">
            <button
              onClick={slide.primaryCta.action}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-1.5 sm:gap-2 group"
            >
              <span>{slide.primaryCta.text}</span>
              {slide.primaryCta.icon}
            </button>

            {slide.secondaryCta && (
              <button
                onClick={slide.secondaryCta.action}
                className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs sm:text-sm font-bold border border-white/30 shadow-xs hover:scale-105 active:scale-95 transition"
              >
                {slide.secondaryCta.text}
              </button>
            )}

            {/* Notification Permission Prompt if default */}
            {notifPermission === "default" && (
              <button
                onClick={handleEnableNotifications}
                className="px-3 py-2 rounded-xl bg-amber-400/30 hover:bg-amber-400/40 backdrop-blur-md text-amber-200 text-xs font-bold border border-amber-300/40 flex items-center gap-1.5 transition active:scale-95"
                title="Enable Phone Ring & Message Push Notifications"
              >
                <IoNotificationsOutline className="w-3.5 h-3.5 animate-bounce" />
                <span>Turn On Phone Ring 🔔</span>
              </button>
            )}
          </div>

          {/* Metrics Row */}
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-2 border-t border-white/20 text-[11px] sm:text-xs text-white/90 w-full flex-wrap">
            {slide.metrics.map((m, idx) => (
              <div key={idx} className="flex items-center gap-1">
                {m.icon}
                <span>{m.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Dynamic Poster Graphic Card (Responsive on all viewports) */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] flex-shrink-0 flex items-center justify-center mt-2 lg:mt-0">
          
          <div className="relative w-full aspect-[16/10] sm:aspect-[1/1] rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/25 to-white/10 backdrop-blur-md border border-white/30 p-3 sm:p-4 shadow-xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Live Tag */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>EduConnect Live</span>
              </div>
              <span className={`${slide.accentTextColor} font-bold text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-md sm:rounded-lg border border-white/30`}>
                ⭐ Featured
              </span>
            </div>

            {/* Central Graphic Icon */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-1 sm:py-2 z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl sm:text-4xl mb-1.5 transform hover:rotate-6 hover:scale-110 transition duration-300">
                {slide.graphicIcon}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {slide.graphicTitle}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-white/90 max-w-[220px] mt-0.5 line-clamp-2">
                {slide.graphicSubtitle}
              </p>
            </div>

            {/* Bottom Card */}
            <div className="bg-white text-gray-900 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm">
                  <IoPeopleOutline className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] sm:text-xs font-bold leading-none">{slide.bottomCardTitle}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{slide.bottomCardSub}</p>
                </div>
              </div>
              <button
                onClick={slide.bottomCardAction}
                className="text-[10px] sm:text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md sm:rounded-lg hover:bg-blue-100 transition"
              >
                {slide.bottomCardCta}
              </button>
            </div>

          </div>

          {/* Floating Micro Badge 1 (Top Left) */}
          <div className="hidden sm:flex absolute -top-2.5 -left-2.5 sm:-left-3 bg-white text-gray-900 px-2.5 py-1 rounded-xl sm:rounded-2xl shadow-lg items-center gap-1.5 border border-gray-100 animate-float-slow z-20">
            <span className="text-sm">{slide.badge1.icon}</span>
            <div className="text-left">
              <p className="text-[10px] font-bold leading-tight">{slide.badge1.title}</p>
              <p className="text-[8px] text-gray-400">{slide.badge1.sub}</p>
            </div>
          </div>

          {/* Floating Micro Badge 2 (Bottom Right) */}
          <div className="hidden sm:flex absolute -bottom-2.5 -right-2.5 sm:-right-3 bg-white text-gray-900 px-2.5 py-1 rounded-xl sm:rounded-2xl shadow-lg items-center gap-1 font-bold text-[10px] animate-float-reverse z-20 border border-gray-100">
            {slide.badge2.icon}
            <span>{slide.badge2.title}</span>
          </div>

        </div>

      </div>

      {/* Slide Indicators / Dots at bottom (Tap or Swipe to navigate) */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 sm:gap-2 pt-3 sm:pt-4">
        {slides.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index 
                ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow-md" 
                : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
