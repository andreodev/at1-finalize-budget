"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    WlExtension?: WlExtensionType;
  }
}

interface WlExtensionType {
  [key: string]: unknown;
}

interface WlExtensionContextType {
  wl: WlExtensionType | null;
  loaded: boolean;
}

// Cria o contexto com valor padrão
export const WlExtensionContext = createContext<WlExtensionContextType>({
  wl: null,
  loaded: false,
});

export const useWlExtension = () => useContext(WlExtensionContext);

export const WlExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wl, setWl] = useState<WlExtensionType | null>(null);
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
           console.log("EXTENSÃO FINALIZAR ATENDIMENTO PERSONALIZADO  .");
          }
        }}
      />
      <WlExtensionContext.Provider value={{ wl, loaded }}>
        {children}
      </WlExtensionContext.Provider>
    </>
  );
};
