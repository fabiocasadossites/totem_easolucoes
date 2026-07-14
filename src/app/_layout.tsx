import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from './login'; // Vamos criar essa tela no próximo passo

// Um componente interno para decidir qual tela mostrar
function RootNavigation() {
  const { token, isLoading } = useAuth();

  // Enquanto o AuthProvider está carregando o token do AsyncStorage,
  // mostramos um indicador de carregamento para evitar um "flash" da tela de login.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }}>
        <ActivityIndicator size="large" color="#FF520D" />
      </View>
    );
  }

  // Se o token for nulo, tranca o usuário na tela de login
  if (!token) {
    return (
      <>
        <LoginScreen />
        <StatusBar hidden={true} />
      </>
    );
  }

  // Se tiver token, libera a navegação normal (o seu index.tsx do totem)
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar hidden={true} />
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}