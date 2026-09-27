import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import UserContext from './context/UserContext.jsx'
import SocketProvider from './context/SocketContext.jsx'
import CallProvider from './context/CallContext.jsx'

import ThemeProvider from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthContext>
        <UserContext>
          <SocketProvider>
            <CallProvider>
              <App />
            </CallProvider>
          </SocketProvider>
        </UserContext>
      </AuthContext>
    </ThemeProvider>
  </BrowserRouter>
)
