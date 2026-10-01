import React, { createContext } from 'react'
export const authDataContext=createContext()
function AuthContext({children}) {
  const serverUrl =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:8000"
      : "https://educonnect-backendd.onrender.com");
  let value = {
    serverUrl
  }
  return (
    <div>
     <authDataContext.Provider value={value}> 
     {children}
     </authDataContext.Provider> 
    </div>
  )
}

export default AuthContext
