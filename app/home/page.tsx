"use client";
import React from "react";

export default function HomePage({userId}: {userId: string}) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    console.log("HomePage userId:", userId);

  React.useEffect(() => {
    fetch(`/api/userinfo/${userId.userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.error || "Erro ao buscar usuário.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro de conexão.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Bem-vindo à Home!</h1>
      <p className="text-lg">Você já está cadastrado e foi redirecionado para a página principal.</p>
      {loading && <p>Carregando dados do usuário...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {user && (
        <div className="mt-4 p-4 border rounded bg-gray-50 text-black">
          <h2 className="text-xl font-semibold mb-2">Dados do Usuário</h2>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
