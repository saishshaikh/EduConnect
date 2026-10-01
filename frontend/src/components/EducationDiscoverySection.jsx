import React, { useState, useContext } from "react";
import {
  IoSearchOutline,
  IoSchoolOutline,
  IoPersonOutline,
  IoSparklesOutline,
  IoArrowForward,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import dp from "../assets/dp.webp";
import ConnectionButton from "./ConnectionButton";
import { userDataContext } from "../context/UserContext";

export default function EducationDiscoverySection({ users = [], id }) {
  const { handleGetProfile } = useContext(userDataContext);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const navigate = useNavigate();

  const filteredUsers = users.filter((u) => {
    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchUsername = u.userName?.toLowerCase().includes(q);
      const matchHeadline = u.headline?.toLowerCase().includes(q);
      const matchSkills = (u.skills || []).some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchUsername && !matchHeadline && !matchSkills) return false;
    }

    // Category filter
    if (activeFilter === "professors") {
      const headline = (u.headline || "").toLowerCase();
      const role = (u.currentRole || "").toLowerCase();
      return (
        headline.includes("professor") ||
        headline.includes("teacher") ||
        headline.includes("faculty") ||
        headline.includes("lecturer") ||
        headline.includes("mentor") ||
        role.includes("professor") ||
        role.includes("teacher") ||
        role.includes("instructor")
      );
    }

    if (activeFilter === "students") {
      const headline = (u.headline || "").toLowerCase();
      const role = (u.currentRole || "").toLowerCase();
      return (
        headline.includes("student") ||
        headline.includes("scholar") ||
        headline.includes("undergrad") ||
        headline.includes("candidate") ||
        role.includes("student") ||
        u.education?.length > 0
      );
    }

    return true;
  });

  return (
    <div id={id} className="w-full mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Discover People & Mentors
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Connect with students, educators, and researchers across the EduConnect community.
          </p>
        </div>

        <button
          onClick={() => navigate("/network")}
          className="text-xs font-bold text-[#0066ff] hover:text-[#0052cc] flex items-center gap-1 self-start sm:self-auto group transition"
        >
          <span>View All in Network</span>
          <IoArrowForward className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        
        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: "All Members", icon: IoSparklesOutline },
            { id: "professors", label: "Faculty & Mentors", icon: IoSchoolOutline },
            { id: "students", label: "Students & Peers", icon: IoPersonOutline },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-[#0066ff] text-white shadow-xs"
                    : "bg-white dark:bg-[#18181b] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#202023]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inline Search */}
        <div className="relative w-full sm:w-56 flex-shrink-0">
          <input
            type="text"
            placeholder="Filter by name/skill..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full h-9 bg-white dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 focus:border-[#0066ff] rounded-xl pl-8 pr-3 text-xs text-gray-900 dark:text-white outline-none transition"
          />
          <IoSearchOutline className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
        </div>

      </div>

      {/* People Grid Cards */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200/80 dark:border-[#262626] p-8 text-center flex flex-col items-center gap-2">
          <IoPersonOutline className="w-8 h-8 text-gray-400" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            No matching scholars found
          </p>
          <p className="text-[11px] text-gray-400">
            Try searching for a different skill or switch to "All Members".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredUsers.slice(0, 6).map((u) => (
            <div
              key={u._id}
              className="bg-white dark:bg-[#121212] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#262626] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group"
            >
              {/* User Avatar & Headline */}
              <div
                onClick={() => handleGetProfile(u.userName)}
                className="flex items-start gap-3 cursor-pointer"
              >
                <img
                  src={u.profileImage || dp}
                  alt={u.firstName}
                  className="w-12 h-12 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-[#0066ff] transition">
                    {u.firstName} {u.lastName}
                  </h4>
                  <p className="text-[11px] text-[#0066ff] font-bold truncate">
                    @{u.userName}
                  </p>
                  {u.headline ? (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                      {u.headline}
                    </p>
                  ) : u.location ? (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      📍 {u.location}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Skills Chips */}
              {u.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {u.skills.slice(0, 3).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#1c1c1e] text-[10px] font-semibold text-gray-700 dark:text-gray-300"
                    >
                      #{skill}
                    </span>
                  ))}
                  {u.skills.length > 3 && (
                    <span className="text-[10px] text-gray-400 self-center">
                      +{u.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Connect Action Button */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleGetProfile(u.userName)}
                  className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                >
                  View Profile
                </button>
                <div className="scale-95 origin-right">
                  <ConnectionButton userId={u._id} />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
