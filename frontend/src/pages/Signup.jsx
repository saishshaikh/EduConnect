import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
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
      formData.append("userName", userName.trim().toLowerCase());
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-[360px] flex flex-col gap-3 my-6">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-7 flex flex-col items-center shadow-xs">
          
          {/* Logo */}
          <div className="mb-4 flex flex-col items-center select-none text-center">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent">
              EduConnect
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
              Sign up to connect, learn, and grow.
            </p>
          </div>

          {/* Profile Picture Selector */}
          <div className="mb-4 relative">
            <div className="w-16 h-16 rounded-full story-gradient p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[1.5px] overflow-hidden">
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
              className="absolute bottom-0 right-0 p-1 bg-[#0095f6] text-white rounded-full border-2 border-white dark:border-[#121212] shadow-xs hover:bg-[#0074cc] transition"
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
          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition"
              />

              <input
                type="text"
                placeholder="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Username"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3 text-xs text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 rounded-xl px-3 pr-9 text-xs text-gray-900 dark:text-white outline-none transition"
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

            {err && (
              <p className="text-xs text-red-500 text-center font-medium my-0.5">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-[#0095f6] hover:bg-[#0074cc] text-white rounded-xl text-xs font-bold transition disabled:opacity-40 shadow-xs"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

        </div>

        {/* Login Prompt Box */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-5 text-center text-xs shadow-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/login")}
            className="text-[#0095f6] font-bold hover:underline"
          >
            Log in
          </button>
        </div>

      </div>
    </div>
  );
}
