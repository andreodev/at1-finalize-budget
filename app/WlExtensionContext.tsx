"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Script from "next/script";

// Tipagem global para evitar erro do TypeScript
declare global {
  interface Window {
    WlExtension?: any;
  }
}

interface WlExtensionContextType {
  wl: any | null;
  loaded: boolean;
}

const WlExtensionContext = createContext<WlExtensionContextType>({ wl: null, loaded: false });

export const useWlExtension = () => useContext(WlExtensionContext);

export const WlExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wl, setWl] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.WlExtension) {
      setWl(window.WlExtension);
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <Script
        src="https://fileschat.sfo2.cdn.digitaloceanspaces.com/public/libs/wlclient.js"
        strategy="afterInteractive"
        onLoad={() => {
          setWl(window.WlExtension ?? null);
          setLoaded(!!window.WlExtension);
          if (window.WlExtension) {
            window.WlExtension.alert({
              message: "WL Extension carregada!",
              variant: "success"
            });
          }
        }}
      />
      <WlExtensionContext.Provider value={{ wl, loaded }}>
        {children}
      </WlExtensionContext.Provider>
    </>
  );
};
