
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Wifi, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    setIsInstalled(isStandalone || isFullscreen);

    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds if not already installed
      if (!isInstalled) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS devices, show manual install instructions
    if (iOS && !isInstalled) {
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('PWA was installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    }
    setShowInstallPrompt(false);
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom duration-500">
      <Card className="glass-card border-cyan-400/20 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-50 mb-1">
                Add XTATE to Home Screen
              </h3>
              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-sm text-cyan-200 mb-3">
                    Tap the Share button and select "Add to Home Screen" for quick access.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-cyan-300">
                    <Wifi className="h-3 w-3" />
                    <span>Works offline</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-cyan-200 mb-3">
                    Install our app for faster access and offline functionality.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-cyan-300">
                    <div className="flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      <span>Works offline</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      <span>Push notifications</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {!isIOS && (
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install App
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                  className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
