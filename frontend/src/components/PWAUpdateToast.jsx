import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

const PWAUpdateToast = () => {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowToast(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowToast(false);
    window.location.reload();
  };

  if (!showToast) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-down">
      <div className="bg-dark-900/95 backdrop-blur-md border border-gold-400/50 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold-400/10 text-gold-400 border border-gold-400/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-gold-300">New Version Available</h4>
            <p className="text-[11px] text-gray-300">
              An updated version of DMD Jewellery is ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update</span>
          </button>
          <button
            onClick={() => setShowToast(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateToast;
