import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  totemName: z.string()
    .min(1, "O nome do totem é obrigatório")
    .min(3, "O nome deve ter pelo menos 3 caracteres"),
  password: z.string()
    .min(1, "A senha de ativação é obrigatória")
    .min(4, "A senha deve ter pelo menos 4 caracteres"),
});

export default function LoginScreen() {
  const [totemName, setTotemName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ totemName?: string; password?: string }>({});
  
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setErrors({});

    const validationResult = loginSchema.safeParse({
      totemName,
      password,
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        totemName: fieldErrors.totemName?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      return; 
    }

    setIsLoading(true);

    try {
      // Puxa a base da URL do .env e monta a rota final
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const endpoint = `${apiUrl}/totens_ea/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // O Cookie com PHPSESSID geralmente é tratado automaticamente pelo navegador/app, 
          // mas estamos definindo o JSON estritamente conforme o seu cURL.
        },
        body: JSON.stringify({
          identificacao: validationResult.data.totemName,
          senha: validationResult.data.password,
        }),
      });

      const responseData = await response.json();
      console.log(responseData);


      // Verifica se a API retornou sucesso e o token esperado
      if (response.ok && responseData.token) {
        // Salva o token e os dados extras do totem (id, code, datetime) na memória da sessão
        await signIn(responseData.token, responseData.data);
      } else {
        Alert.alert('Erro na Autenticação', responseData.message || 'Credenciais inválidas.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor da API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <Image 
          source={require('../img/logo_branca.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        
        <Text style={styles.title}>Autenticação do Equipamento</Text>
        <Text style={styles.subtitle}>Insira as credenciais para ativar este totem</Text>

        {/* Input: Nome do Totem */}
        <View style={[styles.inputContainer, errors.totemName && styles.inputErrorBorder]}>
          <MaterialCommunityIcons name="monitor" size={24} color={errors.totemName ? "#EF4444" : "#6B7280"} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nome do Totem (Ex: T0001)"
            placeholderTextColor="#9CA3AF"
            value={totemName}
            onChangeText={(text) => {
              setTotemName(text);
              if (errors.totemName) setErrors({ ...errors, totemName: undefined });
            }}
            autoCapitalize="characters"
          />
        </View>
        {errors.totemName && <Text style={styles.errorText}>{errors.totemName}</Text>}

        {/* Input: Senha */}
        <View style={[styles.inputContainer, errors.password && styles.inputErrorBorder]}>
          <MaterialCommunityIcons name="lock-outline" size={24} color={errors.password ? "#EF4444" : "#6B7280"} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha de Ativação"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity 
          style={styles.loginButton} 
          activeOpacity={0.8} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.loginButtonText}>Autenticar Totem</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 250,
    height: 60,
    marginBottom: 20,
    backgroundColor: '#FF520D', 
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: '100%',
  },
  inputErrorBorder: {
    borderColor: '#EF4444', 
    backgroundColor: '#FEF2F2', 
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
    paddingVertical: 18,
    outlineStyle: 'none',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF520D',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});