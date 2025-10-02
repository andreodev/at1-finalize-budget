"use client"



import React, { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { Award, X } from "lucide-react";

export default function Page() {
const { user, setUser } = useUser();
  const [motivos, setMotivos] = useState<{ id: string; motivo: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    isAdmin: user?.isAdmin || false,
    valor: "",
    motivo: "",
    obs: "",
    status: "", // novo campo para status
    name_contact: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Função para enviar o formulário com status
  const handleSubmit = async (status: "GANHOU" | "PERDEU") => {
    if (!form.name_contact.trim() || !form.valor.trim() || !form.motivo.trim()) {
      setSubmitMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      setTimeout(() => setSubmitMessage(null), 4000);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const valorFormatado = form.valor
      .replace(/[^\d,\.]/g, "") // remove tudo que não é número, vírgula ou ponto
      .replace(/,/g, "."); // troca vírgula por ponto
    const valorNumber = parseFloat(valorFormatado);
    const valorFinal = isNaN(valorNumber) ? "0.00" : valorNumber.toFixed(2);

    const payload = {
      ...form,
      valor: valorFinal,
      isAdmin: typeof form.isAdmin === "string"
        ? form.isAdmin === "true" || form.isAdmin === "Sim"
        : !!form.isAdmin,
      status,
    };

    try {
      const res = await fetch("/api/finalbudget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, valor: "", motivo: "", obs: "", name_contact: "" }));
        setSubmitMessage({ 
          type: 'success', 
          text: `✅ Orçamento enviado com sucesso! Status: ${status}` 
        });
        setTimeout(() => setSubmitMessage(null), 5000);
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: data.error || "Erro ao enviar orçamento." 
        });
        setTimeout(() => setSubmitMessage(null), 5000);
      }
    } catch (err) {
      setSubmitMessage({ 
        type: 'error', 
        text: "Erro de conexão. Tente novamente." 
      });
      setTimeout(() => setSubmitMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carregar usuário do localStorage/API se não houver no contexto
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const userId = window.localStorage.getItem("userId");
      if (userId) {
        fetch(`/api/user-info/${userId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
              setUser(data.user);
            } else {
              console.warn("[DEBUG][teste] Usuário não encontrado na API", data);
            }
          })
          .catch((err) => {
            console.error("[DEBUG][teste] Erro ao buscar usuário na API:", err);
          });
      } else {
        console.warn("[DEBUG][teste] Nenhum userId encontrado no localStorage");
      }
    }
  }, [user, setUser]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: user?.name || "",
      isAdmin: user?.isAdmin !== undefined ? (user.isAdmin) : "",
    }));
    // Salva userId no localStorage quando usuário estiver disponível
    if (user?.userId && typeof window !== "undefined") {
      window.localStorage.setItem("userId", user.userId);
    }
  }, [user]);


  useEffect(() => {
    fetch("/api/motivos")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMotivos(data.motivos);
        } else {
          setError(data.error || "Erro ao buscar motivos.");
        }
      })
      .catch(() => {
        setError("Erro de conexão.");
      });
  }, []);

  return (
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 animate-in slide-in-from-top-2 duration-300 ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              {submitMessage.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            
            {/* Nome do contato */}
            <div className="space-y-2">
              <label htmlFor="name_contact" className="block text-sm font-semibold text-gray-700">
                Nome do Contato <span className="text-red-500">*</span>
              </label>
              <input
                id="name_contact"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                value={form.name_contact}
                placeholder="Ex: João Silva"
                onChange={(e) => setForm((f) => ({ ...f, name_contact: e.target.value }))}
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label htmlFor="valor" className="block text-sm font-semibold text-gray-700">
                Valor do Orçamento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  id="valor"
                  type="text"
                  required
                  inputMode="decimal"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  value={form.valor}
                  placeholder="1.000,00"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    if (!raw) {
                      setForm((f) => ({ ...f, valor: "" }));
                      return;
                    }
                    const cents = parseInt(raw, 10);
                    const formatted = (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    setForm((f) => ({ ...f, valor: formatted }));
                  }}
                />
              </div>
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <label htmlFor="motivo" className="block text-sm font-semibold text-gray-700">
                Motivo <span className="text-red-500">*</span>
              </label>
              {error ? (
                <p className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
              ) : (
                <select
                  id="motivo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 cursor-pointer transition-all duration-200"
                  value={form.motivo}
                  onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                >
                  <option value="" disabled>
                    Selecione um motivo
                  </option>
                  {motivos.map((m) => (
                    <option key={m.id} value={m.motivo}>
                      {m.motivo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label htmlFor="obs" className="block text-sm font-semibold text-gray-700">
                Observações
              </label>
              <textarea
                id="obs"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                value={form.obs}
                placeholder="Detalhes adicionais do orçamento (opcional)"
                onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
              />
            </div>

            {/* Botões de ação */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:px-8 py-3 cursor-pointer bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  onClick={() => handleSubmit("GANHOU")}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                ) : (
                     <div className="flex items-center justify-center">
                    <Award /> GANHOU
                     </div>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                className="flex-1 sm:flex-none cursor-pointer sm:px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  onClick={() => handleSubmit("PERDEU")}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    <div className="flex items-center justify-center">
                      <X /> PERDEU
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
}