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

// Controles de processamento para evitar duplicatas
const PROCESSING_KEY = 'user_processing';
const PROCESSING_TIMEOUT = 10000; // 10 segundos timeout

export function isUserProcessing(userId: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const processing = window.localStorage.getItem(`${PROCESSING_KEY}_${userId}`);
    if (!processing) return false;
    
    const timestamp = parseInt(processing);
    const now = Date.now();
    
    // Se passou do timeout, considera como não processando
    if (now - timestamp > PROCESSING_TIMEOUT) {
      window.localStorage.removeItem(`${PROCESSING_KEY}_${userId}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar processamento:', error);
    return false;
  }
}

export function setUserProcessing(userId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.setItem(`${PROCESSING_KEY}_${userId}`, Date.now().toString());
  } catch (error) {
    console.error('Erro ao marcar processamento:', error);
  }
}

export function clearUserProcessing(userId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(`${PROCESSING_KEY}_${userId}`);
  } catch (error) {
    console.error('Erro ao limpar processamento:', error);
  }
}