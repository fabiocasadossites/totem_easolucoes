import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Home() {
  // Estado do Modal de Taxas
  const [modalTaxasVisible, setModalTaxasVisible] = useState(false);

  // Estados do Modal Pix Parcelado
  const [modalPixVisible, setModalPixVisible] = useState(false);
  const [pixValue, setPixValue] = useState('');
  const [installments, setInstallments] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  
  // Estados do Formulário Final
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [pixKey, setPixKey] = useState('');

  // --- SISTEMA DE INATIVIDADE ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TIMEOUT_MS = 3 * 60 * 1000; 

  const resetInactivityTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setModalPixVisible(false);
      setPixValue('');
      setInstallments(null);
      setCustomerName('');
      setCustomerWhatsapp('');
      setPixKey('');
      setSelectedInstallment(1);
      Alert.alert(
        'Sessão Expirada', 
        'Por segurança, sua sessão foi encerrada devido à inatividade.'
      );
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    if (modalPixVisible) {
      resetInactivityTimeout();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    
    // Limpeza crucial para totens para evitar vazamento de memória se o componente desmontar
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [modalPixVisible]);
  // --------------------------------

  // Ação dos botões
  const handlePress = (service: string) => {
    if (service === 'PixParcelado') {
      setPixValue('');
      setInstallments(null);
      setCustomerName('');
      setCustomerWhatsapp('');
      setPixKey('');
      setSelectedInstallment(1);
      setModalPixVisible(true);
    } else {
      console.log(`Navegar para: ${service}`);
    }
  };

  // MÁSCARA DE MOEDA
  const handleValueChange = (text: string) => {
    resetInactivityTimeout(); 
    const numericText = text.replace(/\D/g, '');
    if (!numericText) {
      setPixValue('');
      return;
    }
    const value = (parseInt(numericText, 10) / 100).toFixed(2);
    let formatted = value.replace('.', ',');
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setPixValue(formatted);
  };

  const formatCurrency = (val: number) => {
    let formatted = val.toFixed(2).replace('.', ',');
    return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Simula a API
  const handleFetchInstallments = () => {
    resetInactivityTimeout(); 
    const unformattedValue = pixValue.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(unformattedValue);

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, digite um valor válido para o Pix.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const mockApiData = Array.from({ length: 12 }).map((_, index) => {
        const times = index + 1;
        const fakeInterest = 1 + (0.0399 * times); 
        const totalValue = numericValue * fakeInterest;
        return {
          parcelas: times,
          valorParcela: formatCurrency(totalValue / times),
          total: formatCurrency(totalValue)
        };
      });

      setInstallments(mockApiData);
      setSelectedInstallment(1); 
      setIsLoading(false);
    }, 1500);
  };

  // Envio para o Pinpad
  const handlePaymentSubmit = () => {
    resetInactivityTimeout(); 
    if (!customerName || !customerWhatsapp || !pixKey) {
      Alert.alert('Dados Incompletos', 'Preencha todos os campos do formulário para continuar.');
      return;
    }

    console.log('--- ENVIANDO PARA O PINPAD ---');
    console.log('Valor Original: R$', pixValue);
    console.log('Parcelas Selecionadas:', selectedInstallment + 'x'); 
    console.log('Nome:', customerName);
    console.log('WhatsApp:', customerWhatsapp);
    console.log('Chave Pix:', pixKey);
    
    Alert.alert(
      'Enviado ao Pinpad!', 
      `Pagamento de ${selectedInstallment}x iniciado.\nSiga as instruções no terminal.`,
      [{ text: 'OK', onPress: () => setModalPixVisible(false) }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.header}>
        <Image 
          // Certifique-se de que a imagem existe nesse caminho na estrutura do seu projeto!
          source={require('../img/logo_branca.png')} 
          style={styles.logoImage}
          resizeMode="contain" 
        />
        <Text style={styles.subtitle}>O que você deseja pagar hoje?</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => handlePress('DebitosVeiculares')}>
          <MaterialCommunityIcons name="car-info" size={64} color="#FF520D" />
          <Text style={styles.cardTitle}>Débitos Veiculares</Text>
          <Text style={styles.cardDescription}>IPVA, multas e licenciamento do seu veículo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => handlePress('PixParcelado')}>
          <MaterialCommunityIcons name="qrcode-scan" size={64} color="#FF520D" />
          <Text style={styles.cardTitle}>Pix Parcelado</Text>
          <Text style={styles.cardDescription}>Pague via Pix usando seu cartão de crédito</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => handlePress('PagarBoleto')}>
          <FontAwesome5 name="barcode" size={64} color="#FF520D" />
          <Text style={styles.cardTitle}>Pagar Boleto</Text>
          <Text style={styles.cardDescription}>Contas de água, luz, telefone e boletos em geral</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.securityRow}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#6B7280" />
          <Text style={styles.footerText}>Ambiente 100% Seguro e Criptografado</Text>
        </View>
        <Text style={styles.footerTextVersion}>Versão 1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.floatingEar} activeOpacity={0.9} onPress={() => setModalTaxasVisible(true)}>
        <MaterialCommunityIcons name="percent-circle-outline" size={30} color="#FFFFFF" />
        <Text style={styles.floatingEarText}>Taxas</Text>
      </TouchableOpacity>

      {/* MODAL 1: TAXAS */}
      <Modal animationType="fade" transparent={true} visible={modalTaxasVisible} onRequestClose={() => setModalTaxasVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nossas Taxas</Text>
              <TouchableOpacity onPress={() => setModalTaxasVisible(false)} style={styles.closeIcon}>
                <MaterialCommunityIcons name="close" size={40} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Transparência em todas as suas operações</Text>
            <View style={styles.feeTableBase}>
              <View style={styles.feeRowBase}>
                <Text style={styles.feeService}>1x a 12x</Text>
                <Text style={styles.feeValue}>3,99% a.m.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={() => setModalTaxasVisible(false)}>
              <Text style={styles.closeButtonText}>Entendi, Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: PIX PARCELADO */}
      <Modal animationType="slide" transparent={true} visible={modalPixVisible} onRequestClose={() => setModalPixVisible(false)}>
        <View style={styles.modalOverlay} onTouchStart={resetInactivityTimeout}>
          <ScrollView contentContainerStyle={styles.scrollModalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalContent, { width: '96%' }]}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pix Parcelado</Text>
                <TouchableOpacity onPress={() => setModalPixVisible(false)} style={styles.closeIcon}>
                  <MaterialCommunityIcons name="close" size={40} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Digite o valor que deseja enviar:</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0,00"
                    keyboardType="numeric"
                    value={pixValue}
                    onChangeText={handleValueChange} 
                    maxLength={14}
                  />
                </View>

                <TouchableOpacity style={styles.searchButton} activeOpacity={0.8} onPress={handleFetchInstallments} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="large" />
                  ) : (
                    <Text style={styles.searchButtonText}>Buscar Opções</Text>
                  )}
                </TouchableOpacity>
              </View>

              {installments && (
                <View style={styles.installmentsContainer}>
                  <Text style={styles.sectionTitle}>Opções de Parcelamento</Text>
                  
                  {/* GRID SELECIONÁVEL DE PARCELAS */}
                  <View style={styles.gridContainer}>
                    {installments.map((item, index) => {
                      const isSelected = selectedInstallment === item.parcelas;
                      
                      return (
                        <TouchableOpacity 
                          key={index} 
                          style={[
                            styles.gridItem, 
                            isSelected && styles.gridItemSelected // Aplica fundo laranja se estiver selecionado
                          ]}
                          activeOpacity={0.8}
                          onPress={() => {
                            setSelectedInstallment(item.parcelas);
                            resetInactivityTimeout();
                          }}
                        >
                          <Text style={[styles.gridService, isSelected && styles.gridTextSelected]}>
                            {item.parcelas}x
                          </Text>
                          <Text style={[styles.gridValue, isSelected && styles.gridTextSelected]}>
                            R$ {item.valorParcela}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionTitle}>Para finalizar, preencha seus dados:</Text>
                  
                  <View style={styles.formRow}>
                    <View style={styles.formInputContainer}>
                      <Text style={styles.inputLabel}>Nome Completo</Text>
                      <TextInput
                        style={styles.textInputFull}
                        placeholder="Ex: João da Silva"
                        value={customerName}
                        onChangeText={(t) => { setCustomerName(t); resetInactivityTimeout(); }}
                      />
                    </View>

                    <View style={styles.formInputContainer}>
                      <Text style={styles.inputLabel}>WhatsApp</Text>
                      <TextInput
                        style={styles.textInputFull}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        value={customerWhatsapp}
                        onChangeText={(t) => { setCustomerWhatsapp(t); resetInactivityTimeout(); }}
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.inputLabel}>Chave Pix (Destino)</Text>
                    <TextInput
                      style={styles.textInputFull}
                      placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                      value={pixKey}
                      autoCapitalize="none"
                      onChangeText={(t) => { setPixKey(t); resetInactivityTimeout(); }}
                    />
                  </View>

                  <TouchableOpacity style={styles.payButton} activeOpacity={0.8} onPress={handlePaymentSubmit}>
                    <MaterialCommunityIcons name="credit-card-outline" size={32} color="#FFFFFF" style={{marginRight: 10}}/>
                    <Text style={styles.payButtonText}>Ir para Pagamento</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#FF520D', paddingVertical: 38, paddingHorizontal: 32,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10, 
  },
  logoImage: { width: 500, height: 100, marginBottom: 0 },
  subtitle: { fontSize: 24, color: '#FFFFFF', fontWeight: '500' },
  menuContainer: { flex: 1, padding: 32, justifyContent: 'center', gap: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 40, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5, 
  },
  cardTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginTop: 20, marginBottom: 8 },
  cardDescription: { fontSize: 18, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
  footer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#E5E7EB' },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  footerText: { marginLeft: 8, fontSize: 18, color: '#6B7280', fontWeight: '500' },
  footerTextVersion: { fontSize: 14, color: '#9CA3AF' },

  floatingEar: {
    position: 'absolute', right: 0, top: '40%', backgroundColor: '#1F2937', 
    paddingVertical: 24, paddingHorizontal: 16, borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: -4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  floatingEarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  scrollModalContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, width: '100%' },
  modalContent: {
    backgroundColor: '#FFFFFF', width: '90%', borderRadius: 24, padding: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 42, fontWeight: '900', color: '#FF520D' },
  closeIcon: { padding: 10 },
  modalSubtitle: { fontSize: 24, color: '#6B7280', marginBottom: 30 },

  feeTableBase: { backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 30 },
  feeRowBase: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 32 },
  feeService: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
  feeValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  gridItem: {
    width: '48%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB',
    paddingVertical: 18, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16,
  },
  /* --- ESTILOS DE ITEM SELECIONADO --- */
  gridItemSelected: {
    backgroundColor: '#FF520D', 
    borderColor: '#FF520D',
  },
  gridTextSelected: {
    color: '#FFFFFF', 
  },
  gridService: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
  gridValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },

  closeButton: { backgroundColor: '#6B7280', paddingVertical: 24, borderRadius: 16, alignItems: 'center' },
  closeButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },

  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', marginBottom: 20, gap: 16 },
  inputContainer: {
    flex: 2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 20,
  },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', color: '#6B7280', marginRight: 10 },
  textInput: { flex: 1, fontSize: 32, fontWeight: 'bold', color: '#1F2937', paddingVertical: 20 },
  searchButton: { flex: 1, backgroundColor: '#FF520D', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  
  installmentsContainer: { marginTop: 10, borderTopWidth: 2, borderColor: '#E5E7EB', paddingTop: 20 },
  sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#374151', marginBottom: 20 },
  
  formRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 10 },
  formInputContainer: { flex: 1 },
  inputLabel: { fontSize: 20, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 },
  textInputFull: {
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 20, fontSize: 22, color: '#1F2937',
  },
  
  payButton: {
    backgroundColor: '#FF520D', flexDirection: 'row', paddingVertical: 28, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  payButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
});