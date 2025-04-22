"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { IoArrowBack, IoMoon, IoSunny, IoLogOut } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function Header({ recipientEmail, showBackButton = false }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check user preference or system preference
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setDarkMode(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("privateKey");
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBackClick = () => {
    router.push("/chats");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <IoArrowBack className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {recipientEmail ? (
            <h1 className="text-xl font-semibold dark:text-white">
              {recipientEmail.split("@")[0]}
            </h1>
          ) : (
            <h1 className="text-xl font-semibold dark:text-white">
              ShadowLink
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <IoSunny className="w-5 h-5 text-yellow-400" />
            ) : (
              <IoMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {user.email.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <IoLogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
