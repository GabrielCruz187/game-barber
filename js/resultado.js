// frontend/js/resultado.js
document.addEventListener('DOMContentLoaded', function() {
    // Obter código do resgate da URL
    const urlParams = new URLSearchParams(window.location.search);
    const codigo = urlParams.get('codigo');
    
    // Obter dados do resgate do localStorage (salvos após girar a roleta)
    const resgateData = JSON.parse(localStorage.getItem('resgateData') || '{}');
    
    // Função para buscar detalhes do resgate
    async function buscarResgate(codigo) {
      try {
        // Se não tiver código, usar dados do localStorage
        if (!codigo) {
          return resgateData;
        }
        
        const response = await fetch(`http://localhost:5000/api/resgates/publico/${codigo}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar resgate');
        }
        
        const resgate = await response.json();
        return resgate;
      } catch (error) {
        console.error('Erro:', error);
        return resgateData; // Usar dados do localStorage em caso de erro
      }
    }
    
    // Carregar dados do resgate
    buscarResgate(codigo).then(resgate => {
      if (!resgate) {
        alert('Erro ao carregar informações do prêmio');
        return;
      }
      
      // Preencher dados do prêmio na página
      document.getElementById('premioNome').textContent = resgate.premio || 'Prêmio';
      
      // Definir data de expiração
      const dataExp = new Date(resgate.dataExpiracao || new Date());
      dataExp.setDate(dataExp.getDate() + 30); // Fallback para 30 dias
      
      // Formatar a data de expiração
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      document.getElementById('dataExpiracao').textContent = dataExp.toLocaleDateString('pt-BR', options);
      
      // Exibir código do resgate
      document.getElementById('codigoPremio').textContent = resgate.codigo || codigo || Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Configurar QR Code e link do WhatsApp
      const telefone = '5500000000000'; // Substituir pelo telefone da barbearia
      const mensagem = `Olá! Ganhei um prêmio na promoção: ${resgate.premio}. Código: ${resgate.codigo}. Gostaria de agendar para utilizá-lo.`;
      const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
      
      // Configurar botão do WhatsApp
      const btnWhatsApp = document.getElementById('btnWhatsApp');
      if (btnWhatsApp) {
        btnWhatsApp.href = whatsappUrl;
      }
    });
    
    // Configurar contagem regressiva
    // ... (código existente)
  });