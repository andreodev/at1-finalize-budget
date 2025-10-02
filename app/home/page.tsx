"use client";


import Modal from "@/components/Modal";
import React, { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useWlExtension } from "../WlExtensionContext";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Pedido {
    id: string;
    name: string;
    isAdmin: boolean | string;
    valor: string;
    motivo: string;
    obs: string;
    status: string;
    name_contact: string;
}

export default function CadastrarMotivos() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [modal, setModal] = useState(false);
  const [motivos, setMotivos] = useState<{ id: string; motivo: string }[]>([]);
  const [motivosLoading, setMotivosLoading] = useState(false);
  const [motivosError, setMotivosError] = useState<string | null>(null);
  const [motivoInput, setMotivoInput] = useState("");
  const [motivoLoading, setMotivoLoading] = useState(false);
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [motivoSuccess, setMotivoSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const { wl } = useWlExtension()

  // Função para buscar pedidos
  const fetchPedidos = async () => {
    setPedidosLoading(true);
    try {
      const res = await fetch("/api/finalbudget");
      const data = await res.json();
      if (data.success) {
        setPedidos(data.pedidos);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
    setPedidosLoading(false);
  };

  // Calcular estatísticas dos motivos
  const calcularEstatisticasMotivos = () => {
    if (pedidos.length === 0) return { motivosCounts: {}, motivoMaisComum: 'N/A', totalPedidos: 0 };

    const totalPedidos = pedidos.length;
    
    // Calcular motivos mais comuns
    const motivosCounts = pedidos.reduce((acc, p) => {
      acc[p.motivo] = (acc[p.motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const motivoMaisComum = Object.entries(motivosCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      motivosCounts,
      motivoMaisComum,
      totalPedidos
    };
  };

  // Função para navegar com animação
  const navigateWithAnimation = (path: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  // Obtém userId da extensão WL
  useEffect(() => {
    if (wl && typeof wl.getInfoUser === "function") {
      wl.getInfoUser().then((data: { userId: string }) => {
        setUserId(data.userId);
        console.log("[DEBUG] userId obtido da extensão WL:", data.userId);
      });
    }
  }, [wl]);

  // Busca usuário na API quando userId estiver definido e user ainda não estiver no contexto
  useEffect(() => {
    if (!user && userId) {
      console.log("[DEBUG] Buscando usuário na API com userId:", userId);
      fetch(`/api/user-info/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("[DEBUG] /api/userinfo response:", data);
          if (data.success && data.user) {
            setUser(data.user);
            console.log("[DEBUG] setUser chamado com:", data.user);
          } else {
            console.warn("[DEBUG] Usuário não encontrado na API", data);
          }
        })
        .catch((err) => {
          console.error("[DEBUG] Erro ao buscar usuário na API:", err);
        });
    }
  }, [userId, user, setUser]);





  // Buscar motivos ao abrir a tela ou ao cadastrar novo motivo
  const fetchMotivos = async () => {
    setMotivosLoading(true);
    setMotivosError(null);
    try {
      const res = await fetch("/api/motivos");
      const data = await res.json();
      if (data.success) {
        setMotivos(data.motivos);
      } else {
        setMotivosError(data.error || "Erro ao buscar motivos.");
      }
    } catch {
      setMotivosError("Erro de conexão.");
    }
    setMotivosLoading(false);
  };

  useEffect(() => {
    fetchMotivos();
    fetchPedidos();
  }, []);



  const handleMotivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMotivoLoading(true);
    setMotivoError(null);
    setMotivoSuccess(null);
    try {
      const res = await fetch("/api/motivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: motivoInput, createdBy: user?.userId }),
      });
      const data = await res.json();
      if (data.success) {
        setMotivoSuccess("Motivo cadastrado com sucesso!");
        setMotivoInput("");
        fetchMotivos(); // Atualiza lista após cadastro
      } else {
        setMotivoError(data.error || "Erro ao cadastrar motivo.");
      }
    } catch {
      setMotivoError("Erro de conexão.");
    }
    setMotivoLoading(false);
  };

  // Salva userId no localStorage quando usuário estiver disponível
  useEffect(() => {
    if (user?.userId && typeof window !== "undefined") {
      window.localStorage.setItem("userId", user.userId);
      console.log("[DEBUG][home] userId salvo no localStorage:", user.userId);
    }
  }, [user]);

  if (user?.isAdmin === false) return <p>ACESSO NEGADO</p>;

  console.log("[DEBUG] user do contexto:", user);


  return (
    <div className={`flex flex-col text-black min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
      <div className="mb-4 flex gap-2 animate-fade-in">
        <button
          className="group px-4 py-2 text-white rounded-full cursor-pointer  bg-white  "
          onClick={() => navigateWithAnimation("/pedidos")}
        >
          <ArrowLeft color="#1d1d1d" className="transition-transform duration-200 group-hover:translate-x-[-2px]" />
        </button>
      </div>
      <div className="flex justify-center w-full animate-slide-up">
        <button
          className="group inline-flex cursor-pointer items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]"
          onClick={() => setModal(true)}
        >
          Cadastrar motivos
        </button>
      </div>

      <div className="mt-8 animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 justify-center text-center flex to-indigo-50 px-2 py-2 border-b border-gray-200">
            <h2 className="text-md font-bold text-gray-800 flex items-center">
              
              Motivos Cadastrados
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {motivos.length}
              </span>
            </h2>
          </div>
          
          <div className="p-6 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {motivosLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando motivos...</span>
              </div>
            ) : motivosError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>Erro:</strong> {motivosError}
                </div>
              </div>
            ) : motivos.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">Nenhum motivo cadastrado</p>
                <p className="text-gray-400 text-sm">Clique no botão acima para adicionar o primeiro motivo</p>
              </div>
            ) : (
              <div className="overflow-x-auto animate-slide-up ">
                <div className="grid gap-3">
                  {motivos.map((m, index) => (
                    <div 
                      key={m.id} 
                      className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:border-blue-300"
                      style={{
                        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-center">
                        
                        <span className="text-gray-800 font-medium">{m.motivo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Análise de Motivos */}
      {!pedidosLoading && pedidos.length > 0 && (
        <div className="mt-6 animate-fade-in max-h-80 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 " >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Análise de Motivos nos Pedidos
            </h3>
            {(() => {
              const stats = calcularEstatisticasMotivos();
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Motivo Mais Usado:</span>
                    <span className="text-sm font-bold text-gray-900 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                      {stats.motivoMaisComum}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Distribuição de Motivos nos Pedidos ({stats.totalPedidos} pedidos analisados):</p>
                    <div className="space-y-3">
                      {Object.entries(stats.motivosCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([motivo, count]) => {
                          const percentage = (count / stats.totalPedidos) * 100;
                          return (
                            <div key={motivo} className="flex items-center">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700 font-medium" title={motivo}>
                                    {motivo}
                                  </span>
                                  <span className="text-gray-600">{count} uso{count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {pedidosLoading && (
        <div className="mt-8 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Carregando análise de motivos...</span>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => {
          setModal(false);
          setMotivoError(null);
          setMotivoSuccess(null);
        }}
        title="Cadastrar Motivos"
      >
        <form onSubmit={handleMotivoSubmit} className="space-y-4">
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Novo Motivo:
            </label>
            <input
              type="text"
              id="motivo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Digite o motivo aqui..."
              value={motivoInput}
              onChange={e => setMotivoInput(e.target.value)}
              disabled={motivoLoading}
              required
            />
          </div>
          
          {motivoError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center text-red-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {motivoError}
              </div>
            </div>
          )}
          
          {motivoSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {motivoSuccess}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={motivoLoading}
          >
            {motivoLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cadastrando...
              </span>
            ) : (
              "Cadastrar Motivo"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
