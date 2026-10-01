import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoLogoGithub,
  IoLogoLinkedin,
  IoGlobeOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoHeart,
  IoSchoolOutline,
  IoSparkles,
} from "react-icons/io5";
import { ThemeContext } from "../context/ThemeContext";

export default function Footer() {
  const navigate = useNavigate();
  const { isEducation } = useContext(ThemeContext);

  const primaryColor = isEducation ? "text-[#0066ff]" : "text-[#e1306c]";
  const primaryBg = isEducation ? "bg-[#0066ff]" : "bg-[#e1306c]";

  return (
    <footer className="w-full bg-white dark:bg-[#0c0c0e] border-t border-gray-200/80 dark:border-[#202023] mt-12 transition-colors duration-200">
      
      {/* Top Footer Content Grid */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Creator Info (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center gap-2.5 group w-fit"
            >
              {isEducation ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white text-xl shadow-md">
                  🎓
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e1306c] via-[#fd1d1d] to-[#833ab4] flex items-center justify-center text-white font-black text-xl shadow-md">
                  E
                </div>
              )}
              <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Edu<span className={primaryColor}>Connect</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              EduConnect is an advanced academic and professional networking platform connecting students, researchers, professors, and industry mentors worldwide.
            </p>

            {/* Creator Badge */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-[#161619] border border-gray-200/70 dark:border-[#27272a] w-fit">
              <span className="text-xs text-gray-500 dark:text-gray-400">Crafted with</span>
              <IoHeart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                by <span className={`${primaryColor} hover:underline cursor-pointer`}>Saish Shaikh</span>
              </span>
            </div>

            {/* Social & Contact Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/saishshaikh"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c1c20] hover:bg-gray-200 dark:hover:bg-[#28282d] text-gray-700 dark:text-gray-300 flex items-center justify-center transition"
                title="GitHub"
              >
                <IoLogoGithub className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/saishshaikh"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c1c20] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-gray-300 hover:text-[#0066ff] flex items-center justify-center transition"
                title="LinkedIn"
              >
                <IoLogoLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://saishshaikh.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c1c20] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:text-emerald-500 flex items-center justify-center transition"
                title="Portfolio Website"
              >
                <IoGlobeOutline className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@educonnect.app"
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c1c20] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-300 hover:text-purple-500 flex items-center justify-center transition"
                title="Email Support"
              >
                <IoMailOutline className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${primaryBg}`} />
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block"
                >
                  Academic Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/feed")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block font-semibold"
                >
                  User Community Feed
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/explore")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block"
                >
                  Explore Roadmaps
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/network")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block"
                >
                  Scholars & Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/chat")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block"
                >
                  Academic Messaging
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  className="hover:text-gray-900 dark:hover:text-white transition hover:translate-x-0.5 transform inline-block"
                >
                  Student / Faculty Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Domains */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${primaryBg}`} />
              Domains & STEM
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Artificial Intelligence
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Computer Science & Dev
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Data Science & Analytics
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Cloud & DevOps Systems
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Cybersecurity & Networks
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  UI/UX & Product Design
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal, Compliance & Privacy */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-emerald-500" />
              Legal & Trust
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Academic Honor Code
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Community Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Cookie Preferences
                </span>
              </li>
              <li>
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition">
                  Security & Data Safety
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="border-t border-gray-200/60 dark:border-[#1e1e22] bg-gray-50/70 dark:bg-[#070709]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          
          <div className="flex items-center gap-2 text-center sm:text-left flex-wrap justify-center sm:justify-start">
            <p>
              © {new Date().getFullYear()} <strong className="text-gray-800 dark:text-gray-200 font-bold">EduConnect</strong>. All rights reserved.
            </p>
            <span>•</span>
            <p>
              Architected & Built by <span className="font-bold text-gray-800 dark:text-gray-200">Saish Shaikh</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              All Systems Operational
            </span>
            <span className="text-gray-400">v2.4.0</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
