import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running in Standalone Mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsStandalone(checkStandalone);

    // Check if user dismissed recently
    const dismissedTime = localStorage.getItem('dmd_pwa_install_dismissed');
    if (dismissedTime) {
      const hoursPassed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setIsDismissed(true);
      }
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed PWA installation');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('dmd_pwa_install_dismissed', Date.now().toString());
  };

  if (isStandalone || isDismissed || (!deferredPrompt && !installedSuccess)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-bounce-short">
      <div className="bg-dark-900/95 backdrop-blur-md border border-gold-400/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt="DMD Jewellery"
            className="w-11 h-11 rounded-xl border border-gold-400/50 object-cover shadow"
            onError={(e) => {
              e.target.src = '/dmd_logo.jpg';
            }}
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-gold-300">Install DMD Jewellery</h4>
            <p className="text-[11px] text-gray-300 leading-tight">
              Add app to your home screen for quick access & offline browsing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {installedSuccess ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800">
              <Check className="w-3.5 h-3.5" /> Installed
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWAPrompt;
