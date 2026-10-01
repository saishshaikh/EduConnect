import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { IoEyeOutline, IoEyeOffOutline, IoCamera } from "react-icons/io5";
import dp from "../assets/dp.webp";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fileInputRef = useRef(null);
  const { serverUrl } = useContext(authDataContext);
  const { setUserData } = useContext(userDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !userName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("userName", userName.trim().toLowerCase().replace(/\s+/g, ""));
      formData.append("email", email.trim());
      formData.append("password", password.trim());

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`;
      }

      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden">
      
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher compact={true} />
      </div>

      {/* Decorative Background Elements in Education Theme */}
      {isEducation && (
        <>
          <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-[#0066ff]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="w-full max-w-[420px] flex flex-col gap-3 my-6 relative z-10 animate-slideUp">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-7 sm:p-8 flex flex-col items-center shadow-lg">
          
          {/* Logo */}
          <div className="mb-4 flex flex-col items-center select-none text-center">
            {isEducation ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white text-xl shadow-md">
                  🎓
                </div>
                <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
                  Join <span className="text-[#0066ff]">EduConnect</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Connect with students, professors & researchers
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent">
                  EduConnect
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
                  Sign up to connect, learn, and grow.
                </p>
              </>
            )}
          </div>

          {/* Profile Picture Selector */}
          <div className="mb-4 relative">
            <div className={`w-18 h-18 rounded-full p-[2.5px] ${isEducation ? "bg-gradient-to-tr from-[#0066ff] to-amber-400" : "story-gradient"}`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2px] overflow-hidden">
                <img
                  src={profilePicPreview || dp}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-[#0066ff] text-white rounded-full border-2 border-white dark:border-[#121212] shadow-sm hover:scale-110 active:scale-95 transition"
              title="Upload profile photo"
            >
              <IoCamera className="w-3.5 h-3.5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePicChange}
              className="hidden"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  First Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Last Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taylor"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Username *
              </label>
              <input
                type="text"
                placeholder="choose a handle (e.g. alextaylor)"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3 pr-9 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <IoEyeOffOutline className="w-4 h-4" />
                  ) : (
                    <IoEyeOutline className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {err && (
              <p className="text-xs text-red-500 text-center font-medium my-0.5 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 mt-2 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 shadow-md ${
                isEducation
                  ? "bg-[#0066ff] hover:bg-[#0052cc]"
                  : "bg-gradient-to-r from-[#e1306c] to-[#833ab4] hover:opacity-95"
              }`}
            >
              {loading ? "Creating account..." : "Complete Registration"}
            </button>
          </form>

        </div>

        {/* Login Prompt Box */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 text-center text-xs shadow-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/login")}
            className="text-[#0066ff] dark:text-[#e1306c] font-bold hover:underline"
          >
            Log in
          </button>
        </div>

      </div>
    </div>
  );
}
