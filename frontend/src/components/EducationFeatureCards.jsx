import React from "react";
import {
  IoPeopleOutline,
  IoSchoolOutline,
  IoSparklesOutline,
  IoChatbubblesOutline,
  IoChevronForward,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function EducationFeatureCards({ onOpenCreatePost }) {
  const navigate = useNavigate();

  const FEATURES = [
    {
      title: "Academic Mentors",
      desc: "Connect with senior researchers & PhD scholars for project guidance.",
      icon: IoPeopleOutline,
      actionText: "Find Mentor",
      action: () => navigate("/network"),
      color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      title: "Faculty Communication",
      desc: "Reach out to verified professors & educators for coursework help.",
      icon: IoSchoolOutline,
      actionText: "Browse Faculty",
      action: () => navigate("/network"),
      color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      title: "Collaborative Study Hub",
      desc: "Engage with students across AI, CS, data science & STEM.",
      icon: IoChatbubblesOutline,
      actionText: "Explore Feed",
      action: () => navigate("/explore"),
      color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      title: "Publish & Share Work",
      desc: "Post your code, hackathon wins, study notes or research updates.",
      icon: IoSparklesOutline,
      actionText: "Create Post",
      action: onOpenCreatePost || (() => navigate("/")),
      color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#121212] rounded-3xl p-4 border border-gray-200/80 dark:border-[#262626] shadow-xs flex flex-col gap-3">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0066ff]" />
          <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Academic Resources & Hub
          </h4>
        </div>
      </div>

      {/* Feature Items List */}
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              onClick={feat.action}
              className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-3 cursor-pointer group rounded-2xl p-2 -mx-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1c] transition"
            >
              {/* Feature Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${feat.color} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Feature Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#0066ff] transition">
                    {feat.title}
                  </h5>
                  <IoChevronForward className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0066ff] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
