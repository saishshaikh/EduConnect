import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHeartOutline,
  IoHeart,
  IoPaperPlaneOutline,
  IoAddCircleOutline,
  IoSearchOutline,
} from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";
import axios from "axios";

export default function Header({ onOpenCreatePost }) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { unreadTotal } = useContext(SocketContext);
  const { theme, isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  const handleSearch = async (queryVal = searchInput) => {
    try {
      setIsSearching(true);
      const queryParam = queryVal.trim() ? `?query=${encodeURIComponent(queryVal.trim())}` : "";
      const result = await axios.get(
        `${serverUrl}/api/user/search${queryParam}`,
        { withCredentials: true }
      );
      const list = (result.data || []).filter((u) => u._id !== userData?._id);
      setSearchData(list);
      setShowSearchDropdown(true);
    } catch {
      setSearchData([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[62px] bg-white/90 dark:bg-[#000000]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-[#262626] transition-colors duration-200">
      <div className="max-w-[1140px] h-full mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-1.5 group select-none"
        >
          {isEducation ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white font-black text-base shadow-sm">
                🎓
              </div>
              <span className="text-[22px] font-black tracking-tight text-[#0f172a] group-hover:text-[#0066ff] transition">
                Edu<span className="text-[#0066ff]">Connect</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[23px] font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent group-hover:opacity-90 transition">
                EduConnect
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e1306c] mb-2 animate-pulse" />
            </div>
          )}
        </div>

        {/* Search Bar (Tablet & Desktop) */}
        <div ref={searchContainerRef} className="hidden sm:flex relative flex-1 max-w-[280px] lg:max-w-[340px]">
          <div className="w-full h-[38px] bg-gray-100 dark:bg-[#1c1c1e] rounded-xl flex items-center px-3 gap-2 text-gray-500 dark:text-gray-400 focus-within:ring-2 focus-within:ring-[#0066ff]/30 dark:focus-within:ring-[#e1306c]/40 transition border border-transparent focus-within:border-transparent">
            <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search students, professors, skills..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                setShowSearchDropdown(true);
                handleSearch(searchInput);
              }}
              className="w-full bg-transparent outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
            />
            {isSearching && (
              <div className="w-3.5 h-3.5 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-[46px] left-0 w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl shadow-2xl p-2 max-h-[360px] overflow-y-auto custom-scrollbar z-50 animate-slideUp">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                {searchInput.trim() ? "Search Results" : "Suggested in Community"}
              </div>
              {searchData.length > 0 ? (
                searchData.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      handleGetProfile(user.userName);
                      setShowSearchDropdown(false);
                      setSearchInput("");
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1c1c1e] cursor-pointer transition"
                  >
                    <img
                      src={user.profileImage || dp}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                        @{user.userName}
                      </p>
                      {user.headline && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {user.headline}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : !isSearching ? (
                <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  {searchInput.trim() ? (
                    <>No users found for "<span className="font-semibold text-gray-700 dark:text-gray-300">{searchInput}</span>"</>
                  ) : (
                    "No other users found."
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Create Post Button (+) */}
          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              title="Create Post"
              className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition"
            >
              <IoAddCircleOutline className="w-[26px] h-[26px]" />
            </button>
          )}

          {/* Notifications / Activity Heart */}
          <button
            onClick={() => navigate("/notification")}
            title="Notifications"
            className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition relative"
          >
            {location.pathname === "/notification" ? (
              <IoHeart className="w-[25px] h-[25px] text-[#e1306c]" />
            ) : (
              <IoHeartOutline className="w-[25px] h-[25px]" />
            )}
          </button>

          {/* Direct Messages Icon */}
          <button
            onClick={() => navigate("/chat")}
            title="Messages"
            className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition relative"
          >
            <IoPaperPlaneOutline className="w-[23px] h-[23px]" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#0066ff] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white dark:ring-black">
                {unreadTotal > 9 ? "9+" : unreadTotal}
              </span>
            )}
          </button>

          {/* Theme Switcher Dropdown */}
          <ThemeSwitcher compact={true} />

          {/* User Profile Avatar (Desktop) */}
          {userData && (
            <div
              onClick={() => handleGetProfile(userData.userName)}
              className="hidden sm:block cursor-pointer relative"
              title="Your Profile"
            >
              <img
                src={userData.profileImage || dp}
                alt={userData.firstName}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 hover:border-[#0066ff] transition"
              />
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
