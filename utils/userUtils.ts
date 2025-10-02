// Utilitários para gerenciar informações do usuário

export function getUserFromLocalStorage() {
  if (typeof window === "undefined") return null;
  
  const userId = window.localStorage.getItem("userId");
  const userName = window.localStorage.getItem("userName");
  const isAdmin = window.localStorage.getItem("isAdmin");
  
  if (!userId || !userName) return null;
  
  return {
    userId,
    name: userName,
    isAdmin: isAdmin === "true"
  };
}

export function isUserAdmin(): boolean {
  const user = getUserFromLocalStorage();
  return user?.isAdmin || false;
}

export function clearUserFromLocalStorage() {
  if (typeof window === "undefined") return;
  
  window.localStorage.removeItem("userId");
  window.localStorage.removeItem("userName");
  window.localStorage.removeItem("isAdmin");
  
  // Limpar também os caches antigos
  const keys = Object.keys(window.localStorage);
  keys.forEach(key => {
    if (key.startsWith("userCache_")) {
      window.localStorage.removeItem(key);
    }
  });
}