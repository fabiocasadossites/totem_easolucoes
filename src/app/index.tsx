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

// Dados para o seletor de estados
const states = [
  { label: 'AC | Acre', value: 'AC' },
  { label: 'AL | Alagoas', value: 'AL' },
  { label: 'AP | Amapá', value: 'AP' },
  { label: 'AM | Amazonas', value: 'AM' },
  { label: 'CE | Ceará', value: 'CE' },
  { label: 'DF | Distrito Federal', value: 'DF' },
  { label: 'ES | Espírito Santo', value: 'ES' },
  { label: 'GO | Goiás', value: 'GO' },
  { label: 'MA | Maranhão', value: 'MA' },
  { label: 'MT | Mato Grosso', value: 'MT' },
  { label: 'MS | Mato Grosso do Sul', value: 'MS' },
  { label: 'MG | Minas Gerais', value: 'MG' },
  { label: 'PA | Pará', value: 'PA' },
  { label: 'PB | Paraíba', value: 'PB' },
  { label: 'PR | Paraná', value: 'PR' },
  { label: 'PI | Piauí', value: 'PI' },
  { label: 'RJ | Rio de Janeiro', value: 'RJ' },
  { label: 'RN | Rio Grande do Norte', value: 'RN' },
  { label: 'RO | Rondônia', value: 'RO' },
  { label: 'RR | Roraima', value: 'RR' },
  { label: 'SC | Santa Catarina', value: 'SC' },
  { label: 'SP | São Paulo', value: 'SP' },
  { label: 'TO | Tocantins', value: 'TO' },
];

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

  // Estado do Modal de Débitos Veiculares
  const [modalDebitosVisible, setModalDebitosVisible] = useState(false);
  const [placa, setPlaca] = useState('');
  const [renavam, setRenavam] = useState('');
  const [selectedState, setSelectedState] = useState('PA'); // Default to Pará
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [debitosWhatsapp, setDebitosWhatsapp] = useState('');
  const [isLoadingDebitos, setIsLoadingDebitos] = useState(false);
  const [isStatePickerVisible, setStatePickerVisible] = useState(false);

  // Estado do Modal de Pagar Boleto
  const [modalBoletoVisible, setModalBoletoVisible] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [isLoadingBoleto, setIsLoadingBoleto] = useState(false);
  const [boletoDetails, setBoletoDetails] = useState<any | null>(null);
  const [boletoInstallments, setBoletoInstallments] = useState<any[] | null>(null);
  const [selectedBoletoInstallment, setSelectedBoletoInstallment] = useState<number>(1);

  // Dados para a tabela de taxas
  const feeData = [
    { installments: 1, rate: '5,16%' },
    { installments: 2, rate: '8,58%' },
    { installments: 3, rate: '9,60%' },
    { installments: 4, rate: '13,02%' },
    { installments: 5, rate: '15,41%' },
    { installments: 6, rate: '16,51%' },
    { installments: 7, rate: '19,12%' },
    { installments: 8, rate: '21,65%' },
    { installments: 9, rate: '24,47%' },
    { installments: 10, rate: '27,36%' },
    { installments: 11, rate: '28,68%' },
    { installments: 12, rate: '30,06%' },
  ];

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
      // Reset do modal de débitos
      setModalDebitosVisible(false);
      // Reset do modal de boletos
      setModalBoletoVisible(false);
      setBoletoDetails(null);
      setBoletoInstallments(null);
      Alert.alert(
        'Sessão Expirada', 
        'Por segurança, sua sessão foi encerrada devido à inatividade.'
      );
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    if (modalPixVisible || modalDebitosVisible || modalBoletoVisible) {
      resetInactivityTimeout();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    
    // Limpeza crucial para totens para evitar vazamento de memória se o componente desmontar
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [modalPixVisible, modalDebitosVisible, modalBoletoVisible]);
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
    } else if (service === 'DebitosVeiculares') {
      // Resetar estados do modal de débitos
      setPlaca('');
      setRenavam('');
      setSelectedState('PA');
      setCpfCnpj('');
      setDebitosWhatsapp('');
      setModalDebitosVisible(true);
    } else if (service === 'PagarBoleto') {
      // Resetar estados do modal de boleto
      setCodigoBarras('');
      setBoletoDetails(null);
      setBoletoInstallments(null);
      setSelectedBoletoInstallment(1);
      setCustomerName('');
      setCustomerWhatsapp('');
      setModalBoletoVisible(true);
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

  // Busca as opções de parcelamento na API
  const handleFetchInstallments = async () => {
    resetInactivityTimeout();
    const unformattedValue = pixValue.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(unformattedValue);

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, digite um valor válido para o Pix.');
      return;
    }

    setIsLoading(true);
    setInstallments(null); // Limpa os resultados anteriores

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("URL da API não configurada. Verifique o arquivo .env");
      }
      const endpoint = `${apiUrl}/taxas/simular`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor_total: numericValue,
          fator_id: 2, // Fator fixo conforme exemplo
          parcelas: 12, // Solicita todas as 12 parcelas
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Não foi possível buscar as opções de parcelamento.');
      }

      // A API retorna um objeto para 'credito', precisamos converter para um array
      const creditInstallments = responseData.simulacao.credito;
      const formattedInstallments = Object.values(creditInstallments).map((item: any) => ({
        parcelas: item.parcelas,
        valorParcela: formatCurrency(item.valor_parcela),
        total: formatCurrency(item.valor_total),
      }));
      
      // Garante a ordenação correta das parcelas
      formattedInstallments.sort((a, b) => a.parcelas - b.parcelas);

      setInstallments(formattedInstallments);
      setSelectedInstallment(1);
    } catch (error: any) {
      console.error("Erro ao buscar parcelas:", error);
      Alert.alert(
        'Erro na Simulação',
        error.message || 'Ocorreu um erro ao buscar as opções. Tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
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

  // Busca os débitos veiculares na API
  const handleFetchVehicleDebits = async () => {
    // Validação simples
    if (!placa || !renavam) {
      Alert.alert('Dados Incompletos', 'Por favor, preencha a Placa e o Renavam.');
      return;
    }

    setIsLoadingDebitos(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("URL da API não configurada. Verifique o arquivo .env");
      }
      const endpoint = `${apiUrl}/detrans/debitosbuscar`;

      const requestBody = {
        placa: placa.toUpperCase(),
        renavam,
        estado: selectedState,
        cpf_cnpj: cpfCnpj,
        whatsapp: debitosWhatsapp,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': 'M99Q9OSBiwdcc74',
          'x-api-secret': '7vtlqN7YZ6hAaQk6A4F3',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Não foi possível buscar os débitos.');
      }

      // TODO: Processar a resposta da API e mostrar os débitos
      console.log('Débitos encontrados:', responseData);
      Alert.alert('Sucesso!', 'Busca de débitos realizada. Verifique o console para detalhes.');
      // Aqui você implementaria a lógica para exibir os débitos encontrados

    } catch (error: any) {
      console.error("Erro ao buscar débitos:", error);
      Alert.alert('Erro na Busca', error.message || 'Ocorreu um erro ao buscar os débitos. Tente novamente.');
    } finally {
      setIsLoadingDebitos(false);
    }
  };

  // Envio do pagamento do Boleto para o Pinpad
  const handleBoletoPaymentSubmit = () => {
    resetInactivityTimeout();
    if (!customerName || !customerWhatsapp) {
      Alert.alert('Dados Incompletos', 'Preencha seu nome e WhatsApp para continuar.');
      return;
    }

    console.log('--- ENVIANDO BOLETO PARA O PINPAD ---');
    console.log('Código de Barras:', boletoDetails?.codigo_limpo);
    console.log('Valor Original: R$', formatCurrency(boletoDetails?.valor));
    console.log('Parcelas Selecionadas:', selectedBoletoInstallment + 'x');
    console.log('Nome:', customerName);
    console.log('WhatsApp:', customerWhatsapp);

    Alert.alert(
      'Enviado ao Pinpad!',
      `Pagamento de ${selectedBoletoInstallment}x iniciado.\nSiga as instruções no terminal.`,
      [{ text: 'OK', onPress: () => {
        setModalBoletoVisible(false);
        setBoletoDetails(null);
        setBoletoInstallments(null);
      }}]
    );
  };

  // Valida o código de barras do boleto na API
  const handleValidateBoleto = async () => {
    resetInactivityTimeout();
    const cleanBarcode = codigoBarras.replace(/\D/g, '');

    if (!cleanBarcode || cleanBarcode.length < 44) {
      Alert.alert('Código Inválido', 'Por favor, digite ou escaneie um código de barras válido.');
      return;
    }

    setIsLoadingBoleto(true);
  setBoletoDetails(null);
  setBoletoInstallments(null);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("URL da API não configurada. Verifique o arquivo .env");
      }
      const endpoint = `${apiUrl}/totens/validar-boleto`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo_barras: cleanBarcode }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Não foi possível validar o boleto.');
      }

      if (!responseData.data.boleto.pode_processar) {
        throw new Error(responseData.data.boleto.alerta || 'Este boleto não pode ser processado no momento.');
      }

      // Armazena os detalhes do boleto
      setBoletoDetails(responseData.data.boleto);

      // Processa as opções de parcelamento (igual ao Pix Parcelado)
      const creditInstallments = responseData.data.simulacao_taxas.simulacao.credito;
      const formattedInstallments = Object.values(creditInstallments).map((item: any) => ({
        parcelas: item.parcelas,
        valorParcela: formatCurrency(item.valor_parcela),
        total: formatCurrency(item.valor_total),
      }));
      
      formattedInstallments.sort((a, b) => a.parcelas - b.parcelas);

      setBoletoInstallments(formattedInstallments);
      setSelectedBoletoInstallment(1); // Inicia com 1x selecionado
    } catch (error: any) {
      console.error("Erro ao validar boleto:", error);
      Alert.alert('Erro na Validação', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
    // O loading é finalizado aqui, permitindo que os detalhes (ou erro) sejam mostrados.
      setIsLoadingBoleto(false);
    }
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
            
            {/* Tabela de Taxas */}
            <View style={styles.feeTableBase}>
              <View style={[styles.feeRowBase, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.feeService, { color: '#1F2937' }]}>Nº de Parcelas</Text>
                <Text style={[styles.feeValue, { color: '#1F2937' }]}>Taxa Total</Text>
              </View>
              <ScrollView style={{ maxHeight: 450 }}>
                {feeData.map((fee, index) => (
                  <View key={index} style={[styles.feeRowBase, index % 2 === 0 && { backgroundColor: '#FFFFFF' }]}>
                    <Text style={styles.feeService}>{fee.installments}x</Text>
                    <Text style={styles.feeValue}>{fee.rate}</Text>
                  </View>
                ))}
              </ScrollView>
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

      {/* MODAL 3: DÉBITOS VEICULARES */}
      <Modal animationType="slide" transparent={true} visible={modalDebitosVisible} onRequestClose={() => setModalDebitosVisible(false)}>
        <View style={styles.modalOverlay} onTouchStart={resetInactivityTimeout}>
          <ScrollView contentContainerStyle={styles.scrollModalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalContent, { width: '96%' }]}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Débitos Veiculares</Text>
                <TouchableOpacity onPress={() => setModalDebitosVisible(false)} style={styles.closeIcon}>
                  <MaterialCommunityIcons name="close" size={40} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Consulte os débitos do seu veículo</Text>

              <View style={styles.formRow}>
                <View style={styles.formInputContainer}>
                  <Text style={styles.inputLabel}>Placa</Text>
                  <TextInput
                    style={styles.textInputFull}
                    placeholder="AAA0A00"
                    value={placa}
                    onChangeText={setPlaca}
                    maxLength={7}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.formInputContainer}>
                  <Text style={styles.inputLabel}>Renavam</Text>
                  <TextInput
                    style={styles.textInputFull}
                    placeholder="00000000000"
                    keyboardType="numeric"
                    value={renavam}
                    onChangeText={setRenavam}
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formInputContainer}>
                  <Text style={styles.inputLabel}>Estado</Text>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setStatePickerVisible(true)}>
                    <Text style={styles.pickerButtonText}>{selectedState}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.formInputContainer}>
                  <Text style={styles.inputLabel}>CPF/CNPJ (Opcional)</Text>
                  <TextInput
                    style={styles.textInputFull}
                    placeholder="Proprietário do veículo"
                    keyboardType="numeric"
                    value={cpfCnpj}
                    onChangeText={setCpfCnpj}
                    maxLength={14}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.inputLabel}>WhatsApp (Opcional)</Text>
                <TextInput
                  style={styles.textInputFull}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  value={debitosWhatsapp}
                  onChangeText={setDebitosWhatsapp}
                />
              </View>

              <TouchableOpacity style={styles.searchButtonFull} activeOpacity={0.8} onPress={handleFetchVehicleDebits} disabled={isLoadingDebitos}>
                {isLoadingDebitos ? (
                  <ActivityIndicator color="#FFFFFF" size="large" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="magnify" size={28} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={styles.searchButtonText}>Buscar Débitos</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* AQUI ENTRARIA A LISTA DE DÉBITOS ENCONTRADOS */}

            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 4: SELETOR DE ESTADOS */}
      <Modal animationType="fade" transparent={true} visible={isStatePickerVisible} onRequestClose={() => setStatePickerVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setStatePickerVisible(false)}>
          <View style={[styles.modalContent, { width: '60%', maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { fontSize: 32, marginBottom: 20 }]}>Selecione um Estado</Text>
            <ScrollView>
              {states.map((state) => (
                <TouchableOpacity 
                  key={state.value} 
                  style={styles.statePickerItem}
                  onPress={() => {
                    setSelectedState(state.value);
                    setStatePickerVisible(false);
                  }}
                >
                  <Text style={styles.statePickerItemText}>{state.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 5: PAGAR BOLETO */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalBoletoVisible} 
        onRequestClose={() => {
          setModalBoletoVisible(false);
          setBoletoDetails(null);
          setBoletoInstallments(null);
        }}
      >
        <View style={styles.modalOverlay} onTouchStart={resetInactivityTimeout}>
          <ScrollView contentContainerStyle={styles.scrollModalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalContent, { width: '96%' }]}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pagar Boleto</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setModalBoletoVisible(false);
                    setBoletoDetails(null);
                    setBoletoInstallments(null);
                  }} 
                  style={styles.closeIcon}
                >
                  <MaterialCommunityIcons name="close" size={36} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Digite ou escaneie o código de barras</Text>

              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={styles.primaryInputFull}
                  placeholder="00000.00000 00000.000000..."
                  keyboardType="numeric"
                  value={codigoBarras}
                  onChangeText={(t) => { setCodigoBarras(t); resetInactivityTimeout(); }}
                />
              </View>
              <TouchableOpacity style={[styles.searchButtonFull, { marginBottom: 30 }]} activeOpacity={0.8} onPress={handleValidateBoleto} disabled={isLoadingBoleto}>
                {isLoadingBoleto ? (
                  <ActivityIndicator color="#FFFFFF" size="large" />
                ) : (
                  <><MaterialCommunityIcons name="barcode-scan" size={28} color="#FFFFFF" style={{ marginRight: 10 }} /><Text style={styles.searchButtonText}>Validar Boleto</Text></>
                )}
              </TouchableOpacity>

              {/* O indicador de carregamento agora está dentro do botão, como no Pix Parcelado. */}

              {boletoDetails && !isLoadingBoleto && (
                <>
                  <View style={styles.boletoDetailsContainer}>
                    <View style={styles.boletoDetailRow}>
                      <Text style={styles.boletoDetailLabel}>Valor do Boleto:</Text>
                      <Text style={styles.boletoDetailValue}>R$ {formatCurrency(boletoDetails.valor)}</Text>
                    </View>
                    <View style={styles.boletoDetailRow}>
                      <Text style={styles.boletoDetailLabel}>Vencimento:</Text>
                      <Text style={[styles.boletoDetailValue, boletoDetails.is_vencido && { color: '#EF4444' }]}>
                        {new Date(boletoDetails.vencimento + 'T03:00:00Z').toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    {boletoDetails.is_vencido && (
                      <View style={styles.boletoAlert}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#D97706" />
                        <Text style={styles.boletoAlertText}>{boletoDetails.alerta}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.installmentsContainer}>
                    <Text style={styles.sectionTitle}>Opções de Parcelamento</Text>
                    <View style={styles.gridContainer}>
                      {boletoInstallments?.map((item, index) => {
                        const isSelected = selectedBoletoInstallment === item.parcelas;
                        return (
                          <TouchableOpacity key={index} style={[styles.gridItem, isSelected && styles.gridItemSelected]} activeOpacity={0.8} onPress={() => { setSelectedBoletoInstallment(item.parcelas); resetInactivityTimeout(); }}>
                            <Text style={[styles.gridService, isSelected && styles.gridTextSelected]}>{item.parcelas}x</Text>
                            <Text style={[styles.gridValue, isSelected && styles.gridTextSelected]}>R$ {item.valorParcela}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.sectionTitle}>Para finalizar, preencha seus dados:</Text>
                    <View style={styles.formRow}>
                      <View style={styles.formInputContainer}>
                        <Text style={styles.inputLabel}>Nome Completo</Text>
                        <TextInput style={styles.textInputFull} placeholder="Ex: João da Silva" value={customerName} onChangeText={(t) => { setCustomerName(t); resetInactivityTimeout(); }} />
                      </View>
                      <View style={styles.formInputContainer}>
                        <Text style={styles.inputLabel}>WhatsApp</Text>
                        <TextInput style={styles.textInputFull} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={customerWhatsapp} onChangeText={(t) => { setCustomerWhatsapp(t); resetInactivityTimeout(); }} />
                      </View>
                    </View>

                    <TouchableOpacity style={styles.payButton} activeOpacity={0.8} onPress={handleBoletoPaymentSubmit}>
                      <MaterialCommunityIcons name="credit-card-outline" size={32} color="#FFFFFF" style={{ marginRight: 10 }} />
                      <Text style={styles.payButtonText}>Ir para Pagamento</Text>
                    </TouchableOpacity>
                  </View>
                </>
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
  
  feeTableBase: { backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 30, overflow: 'hidden' },
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
  textInput: { flex: 1, fontSize: 32, fontWeight: 'bold', color: '#1F2937', paddingVertical: 20, outlineStyle: 'none' },
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
    outlineStyle: 'none',
  },
  
  primaryInputFull: {
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 20, fontSize: 32, fontWeight: 'bold', color: '#1F2937',
    outlineStyle: 'none',
  },

  payButton: {
    backgroundColor: '#FF520D', flexDirection: 'row', paddingVertical: 28, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  payButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },

  // Estilos do Modal de Débitos
  pickerButton: {
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    outlineStyle: 'none',
  },
  pickerButtonText: {
    fontSize: 22,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  searchButtonFull: {
    backgroundColor: '#FF520D', flexDirection: 'row', paddingVertical: 28, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  statePickerItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statePickerItemText: {
    fontSize: 22,
    color: '#374151',
    textAlign: 'center',
  },

  // Estilos do Modal de Boleto (Detalhes)
  boletoDetailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    marginBottom: 30,
  },
  boletoDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  boletoDetailLabel: { fontSize: 22, color: '#6B7280' },
  boletoDetailValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  boletoAlert: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginTop: 10
  },
  boletoAlertText: { fontSize: 18, color: '#92400E', marginLeft: 10, flex: 1 },
});