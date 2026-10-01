import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { IoEyeOutline, IoEyeOffOutline, IoSchoolOutline, IoSparkles } from "react-icons/io5";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { serverUrl } = useContext(authDataContext);
  const { setUserData } = useContext(userDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setErr("");
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email: email.trim(), password: password.trim() },
        { withCredentials: true }
      );
      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`;
      }
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid credentials. Please try again.");
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
          <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-[#0066ff]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="w-full max-w-[390px] flex flex-col gap-3 relative z-10 animate-slideUp">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-8 sm:p-9 flex flex-col items-center shadow-lg transition-all">
          
          {/* Logo & Headline */}
          <div className="mb-6 flex flex-col items-center select-none text-center">
            {isEducation ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white text-2xl shadow-md">
                  🎓
                </div>
                <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
                  Edu<span className="text-[#0066ff]">Connect</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Academic Networking & Learning Platform
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent">
                  EduConnect
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
                  Learn. Connect. Grow.
                </p>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3.5 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-[#0066ff] dark:focus:border-gray-600 rounded-xl px-3.5 pr-10 text-xs text-gray-900 dark:text-white outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <IoEyeOffOutline className="w-5 h-5" />
                  ) : (
                    <IoEyeOutline className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {err && (
              <p className="text-xs text-red-500 text-center font-medium my-1 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={`w-full h-11 mt-2 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 shadow-md ${
                isEducation
                  ? "bg-[#0066ff] hover:bg-[#0052cc]"
                  : "bg-gradient-to-r from-[#e1306c] to-[#833ab4] hover:opacity-95"
              }`}
            >
              {loading ? "Signing in..." : "Log In to EduConnect"}
            </button>
          </form>

        </div>

        {/* Signup Box */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 text-center text-xs shadow-xs">
          <span className="text-gray-500 dark:text-gray-400">
            New to EduConnect?{" "}
          </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-[#0066ff] dark:text-[#e1306c] font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>

      </div>
    </div>
  );
}
