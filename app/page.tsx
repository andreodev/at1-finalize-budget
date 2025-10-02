"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWlExtension } from "./WlExtensionContext";
import { UserProvider, useUser } from "./UserContext";

function HomeContent() {
  const router = useRouter();
  type User = {
    userId: string;
    name: string;
  };

  type Channel = {
    channelId?: string;
    canalId?: string;
  };

  type WlExtension = {
    getInfoUser: () => Promise<User>;
    getInfoChannels: () => Promise<Channel[]>;
    alert: (options: { message: string; variant: string }) => void;
    initialize: (options: Record<string, unknown>) => void;
  };

  const { wl, loaded } = useWlExtension() as { wl: WlExtension; loaded: boolean };
  const [registered, setRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  
  console.log(userName, registered)

  useEffect(() => {
    const verificarOuCadastrar = async () => {
      if (!(loaded && wl)) return;
      setLoading(true);
      const [user, channels] = await Promise.all([
        wl.getInfoUser(),
        wl.getInfoChannels(),
      ]);
      setUser(user);
      const channelIds = channels
        .map((c: Channel) => c.channelId || c.canalId)
        .filter(Boolean);
      if (channelIds.length === 0) {
        wl.alert({
          message: "Nenhum canal disponível para cadastro.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
       wl.initialize({
    buttons: {
        'attendance-view': [
          {
            text: 'Finalizar atendimento personalizado',
            callback: () => {
              if (
                typeof window !== "undefined" &&
                window.WlExtension &&
                typeof window.WlExtension.modal === "function"
              ) {
                (window.WlExtension.modal as (options: {
                  url: string;
                  title: string;
                  maxWidth: string;
                  height: string;
                }) => void)({
                  url: `http://localhost:3000/teste`,
                  title: "Finalizar atendimento",
                  maxWidth: "600px",
                  height: "600px",
                });
              }
            }
          }
        ]
       },
      });
      const cacheKey = `userCache_${user.userId}_${channelIds.join("_")}`;
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
       
        setRegistered(true);
        setUserName(user.name || "Usuário");
        setTimeout(() => {
          router.push("/pedidos");
        }, 800);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          channelIds,
        }),
      });
      const result = await res.json();
      if (result.success && result.users && result.users[0]?.user) {
        const userResult = result.users[0].user;
        window.localStorage.setItem("userId", userResult.userId);
        window.localStorage.setItem("userName", userResult.name);
        window.localStorage.setItem(cacheKey, JSON.stringify(userResult));
        setRegistered(true);
        setUserName(userResult.name);
        setTimeout(() => {
          router.push("/pedidos");
        }, 800);
      } else if (result.error === "Conta já cadastrada, seguindo normalmente.") {
        window.localStorage.setItem(cacheKey, "cadastrada");
        setTimeout(() => {
          router.push("/home");
        }, 800);
      } else {
        wl.alert({
          message: result.error || "Erro ao registrar usuário.",
          variant: "error",
        });
      }
      setLoading(false);
    };
    verificarOuCadastrar();
  }, [loaded, wl, setUser, router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-[200px] h-[100px]  flex flex-col  p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-green-500 mb-2"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-lg text-gray-700">Carregando...</span>
          </div>
        ) : null}
        
      </div>
    </div>
    
  );
}

export default function Home() {
  return (
    <UserProvider>
      <HomeContent />
    </UserProvider>
  );
}
