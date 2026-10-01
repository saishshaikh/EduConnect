import React, { useState } from "react";
import {
  IoCodeSlashOutline,
  IoHardwareChipOutline,
  IoBarChartOutline,
  IoCloudOutline,
  IoShieldCheckmarkOutline,
  IoColorPaletteOutline,
  IoFlaskOutline,
  IoRocketOutline,
  IoArrowForward,
  IoLogoGoogle,
  IoBookOutline,
} from "react-icons/io5";
import DomainDetailModal, { DOMAIN_DETAILS } from "./DomainDetailModal";

export default function EducationCategoriesSection({ onSelectCategory }) {
  const [selectedDomainId, setSelectedDomainId] = useState(null);

  const CATEGORIES = [
    {
      id: "ai",
      title: "Artificial Intelligence",
      desc: "Deep Learning, LLMs, Neural Networks & Machine Learning",
      icon: IoHardwareChipOutline,
      color: "from-blue-600 to-indigo-600",
      badge: "Trending",
      googleQuery: "Artificial Intelligence Machine Learning complete roadmap 2026",
    },
    {
      id: "programming",
      title: "Computer Science & Dev",
      desc: "Full Stack, Algorithms, Systems & Modern Web Tech",
      icon: IoCodeSlashOutline,
      color: "from-blue-500 to-cyan-500",
      badge: "Popular",
      googleQuery: "Computer Science full stack software engineering roadmap",
    },
    {
      id: "datascience",
      title: "Data Science & Analytics",
      desc: "Big Data, Python, Statistics, Pandas & Visualization",
      icon: IoBarChartOutline,
      color: "from-emerald-500 to-teal-600",
      googleQuery: "Data Science analytics machine learning Python tutorial",
    },
    {
      id: "cloud",
      title: "Cloud & DevOps",
      desc: "AWS, Azure, Docker, Kubernetes & Microservices",
      icon: IoCloudOutline,
      color: "from-sky-500 to-blue-600",
      googleQuery: "Cloud Computing DevOps Docker Kubernetes AWS guide",
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity & Networks",
      desc: "Ethical Hacking, Cryptography & Security Architecture",
      icon: IoShieldCheckmarkOutline,
      color: "from-amber-500 to-orange-600",
      googleQuery: "Cybersecurity ethical hacking network security tutorials",
    },
    {
      id: "design",
      title: "UI/UX & Product Design",
      desc: "Design Systems, User Research, Prototyping & Figma",
      icon: IoColorPaletteOutline,
      color: "from-pink-500 to-rose-600",
      googleQuery: "UI UX design Figma product design roadmap",
    },
    {
      id: "research",
      title: "Academic Research & STEM",
      desc: "Scientific Publications, Mathematics, Physics & Lab Studies",
      icon: IoFlaskOutline,
      color: "from-purple-500 to-violet-600",
      googleQuery: "academic research methodology scientific paper publication",
    },
    {
      id: "career",
      title: "Internships & Career",
      desc: "Resume Reviews, Interview Prep, Hackathons & Job Referrals",
      icon: IoRocketOutline,
      color: "from-yellow-500 to-amber-600",
      badge: "Hot",
      googleQuery: "tech interview preparation resume building internships 2026",
    },
  ];

  const handleCardClick = (cat) => {
    setSelectedDomainId(cat.id);
    if (onSelectCategory) {
      onSelectCategory(cat.title);
    }
  };

  const handleDirectGoogleSearch = (e, cat) => {
    e.stopPropagation();
    const query = cat.googleQuery || `${cat.title} roadmap tutorials`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="w-full mb-8">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Explore Academic Domains
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click any domain to open in-depth roadmaps, deep learning guides & Google search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 hidden sm:inline">
              Interactive Deep Dive
            </span>
          </div>
        </div>

        {/* Grid of Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleCardClick(cat)}
                className="bg-white dark:bg-[#121212] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#262626] shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group hover:-translate-y-1.5 hover:border-[#0066ff]/60 relative overflow-hidden"
              >
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {cat.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                      {cat.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#0066ff] opacity-0 group-hover:opacity-100 transition">
                      Deep Dive →
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#0066ff] transition">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                {/* Direct Action Footer */}
                <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0066ff] flex items-center gap-1 group-hover:underline">
                    <IoBookOutline className="w-3.5 h-3.5" />
                    <span>In-Depth Guide</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDirectGoogleSearch(e, cat)}
                    className="p-1 rounded-lg bg-gray-100 dark:bg-[#1c1c1e] hover:bg-blue-50 text-gray-600 dark:text-gray-300 hover:text-[#0066ff] transition flex items-center gap-1 font-semibold px-2"
                    title={`Direct Google search for ${cat.title}`}
                  >
                    <IoLogoGoogle className="w-3 h-3 text-[#4285F4]" />
                    <span>Google ↗</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* In-Depth Academic Domain Knowledge & Search Modal */}
      {selectedDomainId && (
        <DomainDetailModal
          isOpen={Boolean(selectedDomainId)}
          domainId={selectedDomainId}
          onClose={() => setSelectedDomainId(null)}
        />
      )}
    </>
  );
}
