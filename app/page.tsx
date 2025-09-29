"use client";
import React, { useEffect, useState } from "react";
import { useWlExtension } from "./WlExtensionContext";
import HomePage from "./home/page";
import { UserProvider, useUser } from "./UserContext";

function HomeContent() {
  const { wl, loaded } = useWlExtension();
  const [registered, setRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    const storedUserId = window.localStorage.getItem("userId");
    const storedUserName = window.localStorage.getItem("userName");
    if (storedUserId && storedUserName) {
      setRegistered(true);
      setUserName(storedUserName);
    }
    if (loaded && wl) {
      wl.alert({
        message: "Teste: WL Extension está disponível!",
        variant: "success",
      });
    }
    // Só executa se wl estiver definido
    if (loaded && wl) {
      Promise.all([wl.getInfoUser(), wl.getInfoChannels()]).then(
        ([userInfo, channels]) => {
          setUser(userInfo); // Salva globalmente
          // ...existing code...
          const channelIds = channels.map((c: any) => c.channelId).filter(Boolean);
          fetch("/api/userinfo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userInfo.userId,
              systemKey: userInfo.systemKey,
              channelIds,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.success) {
                console.log("Dados da API externa:", result.data);
              } else {
                console.error("Erro na API externa:", result.error);
              }
            })
            .catch((err) => {
              console.error("Erro ao enviar para backend:", err);
            });
        }
      );
    }

  }, [loaded, wl]);
  // Função para registrar usuário
 const handleRegister = async () => {
   if (loaded && wl) {
     setLoading(true);
     const [user, channels] = await Promise.all([
       wl.getInfoUser(),
       wl.getInfoChannels(),
     ]);
     const channelIds = channels
       .map((c) => c.channelId || c.canalId)
       .filter(Boolean);
     if (channelIds.length === 0) {
       wl.alert({
         message: "Nenhum canal disponível para cadastro.",
         variant: "error",
       });
       setLoading(false);
       return;
     }

     // Cache local
     const cacheKey = `userCache_${user.userId}_${channelIds.join("_")}`;
     const cached = window.localStorage.getItem(cacheKey);
     if (cached) {
       wl.alert({
         message: "Usuário já cadastrado (cache).",
         variant: "info",
       });
       setRegistered(true);
       setUserName(user.name || "Usuário");
       setLoading(false);
       return;
     }

     const data = {
       
     }

     const res = await fetch("/api/userinfo", {
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
    if (result.success && result.user) {
      window.localStorage.setItem("userId", result.user.userId);
      window.localStorage.setItem("userName", result.user.name);
      window.localStorage.setItem(cacheKey, JSON.stringify(result.user));
      setRegistered(true);
      setUserName(result.user.name);
      wl.alert({
        message: `Bem-vindo, ${result.user.name}!`,
        variant: "success",
      });
      window.location.href = "/home";
    } else if (result.error === "Conta já cadastrada, seguindo normalmente.") {
      window.localStorage.setItem(cacheKey, "cadastrada");
      wl.alert({
        message: "Conta já cadastrada! Redirecionando...",
        variant: "info",
      });
      window.location.href = "/home";
    } else {
      wl.alert({
        message: result.error || "Erro ao registrar usuário.",
        variant: "error",
      });
    }
    setLoading(false);
   }
 };


  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
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
          <span className="text-lg text-white">Carregando...</span>
        </div>
      ) : registered ? (
          <div className="text-xl font-bold text-white">
            <HomePage userId={user} />
        </div>
      ) : (
        <button
          className="rounded-full bg-green-500 text-white px-8 py-4 text-lg font-bold shadow-lg hover:bg-green-600 transition-all"
          onClick={handleRegister}
        >
          Cadastrar
        </button>
      )}
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
