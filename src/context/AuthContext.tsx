import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define o formato dos dados que a sua API retorna
interface TotemData {
  id: number;
  totem: string;
  code: string;
  datetime: string;
}

interface AuthContextData {
  token: string | null;
  totemData: TotemData | null;
  isLoading: boolean;
  signIn: (newToken: string, newData: TotemData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Chaves para o AsyncStorage, para evitar erros de digitação
const TOKEN_KEY = '@totem_easervico:token';
const TOTEM_DATA_KEY = '@totem_easervico:totemData';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // O estado agora será inicializado a partir do armazenamento persistente
  const [token, setToken] = useState<string | null>(null);
  const [totemData, setTotemData] = useState<TotemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para carregar os dados do AsyncStorage na inicialização do app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedTotemData = await AsyncStorage.getItem(TOTEM_DATA_KEY);

        if (storedToken && storedTotemData) {
          setToken(storedToken);
          setTotemData(JSON.parse(storedTotemData));
        }
      } catch (e) {
        console.error("Falha ao carregar dados de autenticação do armazenamento.", e);
      } finally {
        // Garante que o app continue mesmo se houver erro
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(newToken: string, newData: TotemData) {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(TOTEM_DATA_KEY, JSON.stringify(newData));
    setToken(newToken); // Atualiza o estado na memória
    setTotemData(newData); // Atualiza o estado na memória
  }

  async function signOut() {
    await AsyncStorage.multiRemove([TOKEN_KEY, TOTEM_DATA_KEY]);
    setToken(null);
    setTotemData(null);
  }

  return (
    <AuthContext.Provider value={{ token, totemData, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}