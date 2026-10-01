import React, { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  EDUCATION: "education",
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("educonnect_theme");
    if (saved && ["dark", "light", "education"].includes(saved)) {
      return saved;
    }
    return "dark"; // Default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove("dark", "theme-education", "theme-light");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "education") {
      root.classList.add("theme-education");
    } else {
      root.classList.add("theme-light");
    }

    localStorage.setItem("educonnect_theme", theme);
  }, [theme]);

  // Cycle through themes: dark -> light -> education -> dark
  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "education";
      return "dark";
    });
  };

  const selectTheme = (selectedTheme) => {
    if (["dark", "light", "education"].includes(selectedTheme)) {
      setTheme(selectedTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: selectTheme,
        toggleTheme,
        isDark: theme === "dark",
        isLight: theme === "light",
        isEducation: theme === "education",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
