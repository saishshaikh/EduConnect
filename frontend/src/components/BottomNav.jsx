import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHome,
  IoHomeOutline,
  IoSearch,
  IoSearchOutline,
  IoAddCircle,
  IoAddCircleOutline,
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/userContext";

export default function BottomNav({ onOpenCreatePost }) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-[54px] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-[#262626] flex items-center justify-around px-2 transition-colors duration-200">
      
      {/* Home */}
      <button
        onClick={() => navigate("/")}
        className="p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition"
      >
        {isActive("/") ? (
          <IoHome className="w-[26px] h-[26px] text-black dark:text-white" />
        ) : (
          <IoHomeOutline className="w-[26px] h-[26px]" />
        )}
      </button>

      {/* Explore / Search */}
      <button
        onClick={() => navigate("/explore")}
        className="p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition"
      >
        {isActive("/explore") ? (
          <IoSearch className="w-[26px] h-[26px] text-black dark:text-white" />
        ) : (
          <IoSearchOutline className="w-[26px] h-[26px]" />
        )}
      </button>

      {/* Create (+) */}
      <button
        onClick={onOpenCreatePost ? onOpenCreatePost : () => navigate("/")}
        className="p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition"
      >
        <div className="w-[30px] h-[30px] rounded-lg border-2 border-black dark:border-white flex items-center justify-center font-bold text-lg leading-none">
          +
        </div>
      </button>

      {/* Connections / Network */}
      <button
        onClick={() => navigate("/network")}
        className="p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition"
      >
        <FaUserGroup
          className={`w-[24px] h-[24px] ${
            isActive("/network") ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        />
      </button>

      {/* Activity / Notifications */}
      <button
        onClick={() => navigate("/notification")}
        className="p-2 text-gray-800 dark:text-gray-200 active:scale-90 transition relative"
      >
        {isActive("/notification") ? (
          <IoHeart className="w-[26px] h-[26px] text-[#e1306c]" />
        ) : (
          <IoHeartOutline className="w-[26px] h-[26px]" />
        )}
      </button>

      {/* Profile */}
      {userData && (
        <button
          onClick={() => handleGetProfile(userData.userName)}
          className="p-1 active:scale-90 transition"
        >
          <div
            className={`w-[28px] h-[28px] rounded-full overflow-hidden border-2 ${
              isActive("/profile")
                ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                : "border-transparent"
            }`}
          >
            <img
              src={userData.profileImage || dp}
              alt={userData.firstName}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      )}

    </nav>
  );
}
