import React, { useState, useEffect } from 'react';
import { HiDownload, HiX, HiDeviceMobile } from 'react-icons/hi';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    // If dismissed recently (within 2 days), don't show automatically
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 2 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show after 3 seconds if not installed and not dismissed
    if (isIosDevice && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-bounce-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-blue-500/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <img src="/pwa-192x192.png" alt="EduConnect" className="w-10 h-10 rounded-lg object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Install EduConnect App</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
              {isIOS 
                ? 'Tap Share ⎋ and then "Add to Home Screen"' 
                : 'Fast access, offline mode & native feel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <HiDownload className="text-sm" />
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Close"
          >
            <HiX className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
