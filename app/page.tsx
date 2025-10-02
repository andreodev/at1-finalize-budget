"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWlExtension } from "./WlExtensionContext";
import CadastrarMotivos from "./home/page";
import { UserProvider, useUser } from "./UserContext";
import HomeCrm from "./pedidos/page";

function HomeContent() {
  const router = useRouter();
  const { wl, loaded } = useWlExtension();
  const [registered, setRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUser();

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
        .map((c: any) => c.channelId || c.canalId)
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
            callback: (atendimento) => {
              window.WlExtension.modal({
                url: `http://localhost:3000/teste`,
                title: "Finalizar atendimento",
                maxWidth: "600px",
                height: "600px",
              });
            }
          }
        ]
       },
      });
      const cacheKey = `userCache_${user.userId}_${channelIds.join("_")}`;
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        wl.alert({
          message: "Usuário já cadastrado (cache). Redirecionando...",
          variant: "info",
        });
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
        wl.alert({
          message: `Bem-vindo, ${userResult.name}! Redirecionando...`,
          variant: "success",
        });
        setTimeout(() => {
          router.push("/pedidos");
        }, 800);
      } else if (result.error === "Conta já cadastrada, seguindo normalmente.") {
        window.localStorage.setItem(cacheKey, "cadastrada");
        wl.alert({
          message: "Conta já cadastrada! Redirecionando...",
          variant: "info",
        });
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
