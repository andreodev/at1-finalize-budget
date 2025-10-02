
"use client";


import { ArrowRight, Check, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function PedidosPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detalhe, setDetalhe] = useState<Pedido | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    // Calcular estatísticas dos pedidos
    const calcularEstatisticas = () => {
        const totalPedidos = pedidos.length;
        const pedidosGanhos = pedidos.filter(p => p.status === 'GANHOU').length;
        const pedidosPerdidos = pedidos.filter(p => p.status === 'PERDEU').length;
        
        const valorTotalGanhos = pedidos
            .filter(p => p.status === 'GANHOU')
            .reduce((total, p) => {
                const num = typeof p.valor === 'string'
                    ? parseFloat(p.valor.replace(/\./g, '').replace(',', '.'))
                    : Number(p.valor);
                return total + (isNaN(num) ? 0 : num);
            }, 0);

        const valorTotalPerdidos = pedidos
            .filter(p => p.status === 'PERDEU')
            .reduce((total, p) => {
                const num = typeof p.valor === 'string'
                    ? parseFloat(p.valor.replace(/\./g, '').replace(',', '.'))
                    : Number(p.valor);
                return total + (isNaN(num) ? 0 : num);
            }, 0);

        const taxaSucesso = totalPedidos > 0 ? ((pedidosGanhos / totalPedidos) * 100) : 0;

        return {
            totalPedidos,
            pedidosGanhos,
            pedidosPerdidos,
            valorTotalGanhos,
            valorTotalPerdidos,
            taxaSucesso
        };
    };

    // Calcular paginação
    const calculatePagination = () => {
        const totalPages = Math.ceil(pedidos.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = pedidos.slice(startIndex, endIndex);
        
        return {
            totalPages,
            currentItems,
            startIndex,
            endIndex: Math.min(endIndex, pedidos.length)
        };
    };

    // Função para navegar com animação
    const navigateWithAnimation = (path: string) => {
        setIsAnimating(true);
        setTimeout(() => {
            router.push(path);
        }, 300);
    };

    // Função para buscar pedidos, pode ser chamada de fora
    const fetchPedidos = () => {
        setLoading(true);
        fetch("/api/finalbudget")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setPedidos(data.pedidos);
                    setCurrentPage(1); // Reset para primeira página
                    setError(null);
                } else {
                    setError(data.error || "Erro ao buscar pedidos.");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Erro de conexão.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6 transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            <div className="max-w-full mx-auto animate-fade-in">
                <div className="flex justify-center items-center mb-6">
                    <button
                        className="flex items-center justify-center px-4 py-2 cursor-pointer bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-300 text-sm group"
                        onClick={fetchPedidos}
                        title="Atualizar pedidos"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                        <span className="ml-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                            {loading ? 'Carregando...' : 'Atualizar'}
                        </span>
                    </button>
                </div>

                <div className="mb-2 text-center">
                    <button
                        className="group inline-flex cursor-pointer items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]"
                        onClick={() => navigateWithAnimation("/home")}
                    >
                        <span>Cadastrar Motivos</span>
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Painel de Estatísticas */}
                {!loading && pedidos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
                        {(() => {
                            const stats = calcularEstatisticas();
                            return (
                                <>
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow duration-200">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow duration-200">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                <Check className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Pedidos Ganhos</p>
                                                <p className="text-2xl font-bold text-green-700">{stats.pedidosGanhos}</p>
                                                <p className="text-xs text-green-600 font-medium">
                                                    {stats.valorTotalGanhos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow duration-200">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                <X className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Pedidos Perdidos</p>
                                                <p className="text-2xl font-bold text-red-700">{stats.pedidosPerdidos}</p>
                                                <p className="text-xs text-red-600 font-medium">
                                                    {stats.valorTotalPerdidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow duration-200">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                                                <p className="text-2xl font-bold text-purple-700">{stats.taxaSucesso.toFixed(1)}%</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                                        style={{ width: `${Math.min(stats.taxaSucesso, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}



                {/* Loading/Error States */}
                {loading && !pedidos.length ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Carregando pedidos...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                        <strong>Erro:</strong> {error}
                    </div>
                ) : (
                    /* Tabela */
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up">
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                            <div className="overflow-x-auto table-responsive">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Funcionário</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Motivo</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {pedidos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-lg font-medium mb-2">Nenhum pedido encontrado</p>
                                                    <p className="text-sm">Quando houver pedidos, eles aparecerão aqui</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            const { currentItems } = calculatePagination();
                                            return currentItems.map((p, index) => (
                                                <tr 
                                                    key={p.id} 
                                                    className="table-row-hover hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 last:border-b-0 table-row-enter"
                                                    style={{
                                                        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                                                        animationDelay: `${index * 0.1}s`
                                                    }}
                                                >
                                                    <td className="px-4 py-5">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900" title={p.name}>{p.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="text-sm font-medium text-gray-900" title={p.name_contact}>{p.name_contact}</div>
                                                    </td>
                                                    <td className="px-4 py-5 text-right">
                                                        <div className="text-base font-bold text-green-600">
                                                            {(() => {
                                                                const num = typeof p.valor === 'string'
                                                                    ? parseFloat(p.valor.replace(/\./g, '').replace(',', '.'))
                                                                    : Number(p.valor);
                                                                if (isNaN(num)) return p.valor;
                                                                return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="text-sm text-gray-900 font-medium" title={p.motivo}>{p.motivo}</div>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold ${
                                                            p.status === 'GANHOU' 
                                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                            {p.status === 'GANHOU' ? (
                                                                <>
                                                                    <Check className="w-4 h-4 mr-1" />
                                                                    Ganhou
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <X className="w-4 h-4 mr-1" />
                                                                    Perdeu
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <button
                                                            className="inline-flex items-center px-4 py-2 0 text-white bg-gray-600 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 transform hover:translate-y-[-1px]"
                                                            onClick={() => setDetalhe(p)}
                                                            title="Ver detalhes"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Detalhes
                                                        </button>
                                                    </td>
                                                </tr>
                                            ));
                                        })()
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controles de Paginação */}
                {!loading && pedidos.length > 0 && (
                    <div className=" rounded-xl  animate-fade-in ">
                        {(() => {
                            const { totalPages, startIndex, endIndex } = calculatePagination();
                            return (
                                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                                    {totalPages > 1 && (
                                        <div className="flex items-center ">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600  hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 transform ${
                                                            page === currentPage
                                                                ? 'bg-gray-600  text-white shadow-md hover:shadow-lg scale-105'
                                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 bg-white'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600  hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200 "
                                            >
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}
                
                {/* Informações adicionais */}
               
            </div>

            {/* Modal de detalhes */}
            {detalhe && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4  animate-fade-in">
                    <div className="bg-white rounded-xl   w-full  overflow-hidden animate-slide-up">
                        {/* Header do Modal */}
                        <div className="  py-5 text-[#1d1d1d]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-md font-bold">Detalhes do Pedido</h3>
                                    </div>
                                </div>
                                <button
                                    className="text-black cursor-pointer transition-all duration-200 p-2 rounded-full"
                                    onClick={() => setDetalhe(null)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Corpo do Modal */}
                        <div className="p-2  overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="space-y-4">
                                {/* Status Badge em Destaque */}
                                <div className="flex justify-center ">
                                    <div className={`inline-flex items-center px-3 py-3 rounded-2xl text-lg font-bold  ${
                                        detalhe.status === 'GANHOU' 
                                            ? 'bg-green-600  text-white' 
                                            : 'bg-red-500  text-white'
                                    }`}>
                                        {detalhe.status === 'GANHOU' ? (
                                            <>
                                                <Check className="w-6 h-6 mr-2" />
                                                Pedido Ganho
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-6 h-6 mr-2" />
                                                Pedido Perdido
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Informações Principais */}
                                <div className="grid gap-4">
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-gray-700">Nome do Cliente</label>
                                        </div>
                                        <p className="text-gray-900 font-medium text-lg">{detalhe.name}</p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-gray-700">Contato</label>
                                        </div>
                                        <p className="text-gray-900 font-medium">{detalhe.name_contact}</p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl border-l-4 border-green-500">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-gray-700">Valor do Pedido</label>
                                        </div>
                                        <p className="font-bold text-2xl text-green-700">
                                            {(() => {
                                                const num = typeof detalhe.valor === 'string'
                                                    ? parseFloat(detalhe.valor.replace(/\./g, '').replace(',', '.'))
                                                    : Number(detalhe.valor);
                                                if (isNaN(num)) return detalhe.valor;
                                                return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                                            })()}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-gray-700">Motivo</label>
                                        </div>
                                        <p className="text-gray-900 font-medium">{detalhe.motivo}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-gray-50 to-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <label className="block text-sm font-semibold text-gray-700">Observações</label>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-yellow-200">
                                            {detalhe.obs ? (
                                                <p className="text-gray-900 whitespace-pre-wrap">{detalhe.obs}</p>
                                            ) : (
                                                <p className="italic text-gray-500 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    Nenhuma observação adicionada
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}