import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { serverUrl } = useContext(authDataContext);
  const { setUserData } = useContext(userDataContext);
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-[360px] flex flex-col gap-3">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-8 flex flex-col items-center shadow-xs">
          
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center select-none">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent">
              EduConnect
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
              Learn. Connect. Grow.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
            <div>
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3.5 text-xs text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3.5 pr-10 text-xs text-gray-900 dark:text-white outline-none transition"
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

            {err && (
              <p className="text-xs text-red-500 text-center font-medium my-1">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full h-10 mt-2 bg-[#0095f6] hover:bg-[#0074cc] text-white rounded-xl text-xs font-bold transition disabled:opacity-40 shadow-xs"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

        </div>

        {/* Signup Box */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-5 text-center text-xs shadow-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-[#0095f6] font-bold hover:underline"
          >
            Sign up
          </button>
        </div>

      </div>
    </div>
  );
}
