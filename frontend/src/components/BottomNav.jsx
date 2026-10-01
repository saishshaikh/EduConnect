import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHome,
  IoHomeOutline,
  IoReader,
  IoReaderOutline,
  IoAdd,
  IoSparkles,
} from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { FiCompass } from "react-icons/fi";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";

export default function BottomNav({ onOpenCreatePost }) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const activeColorClass = isEducation ? "text-[#0066ff]" : "text-[#e1306c]";
  const activeBgClass = isEducation ? "bg-[#0066ff]" : "bg-[#e1306c]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-[58px] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-[#262626] flex items-center justify-around px-3 transition-colors duration-200 safe-area-pb">
      
      {/* 1. Home */}
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center justify-center p-1 text-gray-700 dark:text-gray-300 active:scale-90 transition relative"
        aria-label="Home"
      >
        {isActive("/") ? (
          <IoHome className={`w-[24px] h-[24px] ${activeColorClass}`} />
        ) : (
          <IoHomeOutline className="w-[24px] h-[24px]" />
        )}
        {isActive("/") && (
          <span className={`w-1 h-1 rounded-full ${activeBgClass} mt-0.5`} />
        )}
      </button>

      {/* 2. User Feed */}
      <button
        onClick={() => navigate("/feed")}
        className="flex flex-col items-center justify-center p-1 text-gray-700 dark:text-gray-300 active:scale-90 transition relative"
        aria-label="Feed"
      >
        {isActive("/feed") ? (
          <IoReader className={`w-[24px] h-[24px] ${activeColorClass}`} />
        ) : (
          <IoReaderOutline className="w-[24px] h-[24px]" />
        )}
        {isActive("/feed") && (
          <span className={`w-1 h-1 rounded-full ${activeBgClass} mt-0.5`} />
        )}
      </button>

      {/* 3. Create Post Button (+) */}
      <button
        onClick={onOpenCreatePost ? onOpenCreatePost : () => navigate("/")}
        className="flex items-center justify-center -mt-3 p-1.5 active:scale-90 transition group"
        aria-label="Create Post"
      >
        <div className={`w-[42px] h-[42px] rounded-2xl ${isEducation ? "bg-gradient-to-tr from-[#0066ff] to-[#38bdf8]" : "bg-gradient-to-tr from-[#e1306c] to-[#fd1d1d]"} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition`}>
          <IoAdd className="w-7 h-7 stroke-[2]" />
        </div>
      </button>

      {/* 4. Network */}
      <button
        onClick={() => navigate("/network")}
        className="flex flex-col items-center justify-center p-1 text-gray-700 dark:text-gray-300 active:scale-90 transition relative"
        aria-label="Network"
      >
        <FaUserGroup
          className={`w-[22px] h-[22px] ${
            isActive("/network") ? activeColorClass : "text-gray-700 dark:text-gray-300"
          }`}
        />
        {isActive("/network") && (
          <span className={`w-1 h-1 rounded-full ${activeBgClass} mt-0.5`} />
        )}
      </button>

      {/* 5. Profile */}
      {userData && (
        <button
          onClick={() => handleGetProfile(userData.userName)}
          className="flex flex-col items-center justify-center p-1 active:scale-90 transition relative"
          aria-label="Profile"
        >
          <div
            className={`w-[26px] h-[26px] rounded-full overflow-hidden border-2 ${
              isActive("/profile")
                ? isEducation ? "border-[#0066ff] ring-1 ring-[#0066ff]" : "border-[#e1306c] ring-1 ring-[#e1306c]"
                : "border-transparent"
            }`}
          >
            <img
              src={userData.profileImage || dp}
              alt={userData.firstName}
              className="w-full h-full object-cover"
            />
          </div>
          {isActive("/profile") && (
            <span className={`w-1 h-1 rounded-full ${activeBgClass} mt-0.5`} />
          )}
        </button>
      )}

    </nav>
  );
}
