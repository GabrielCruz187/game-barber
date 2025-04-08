// frontend/js/jogo.js
document.addEventListener('DOMContentLoaded', function() {
    const roleta = document.getElementById('roleta');
    const btnGirar = document.getElementById('btnGirar');
    const resultadoPremio = document.getElementById('resultadoPremio');
    const premioTexto = document.getElementById('premioTexto');
    
    // Obter dados do cliente do localStorage (salvos no login)
    const clienteData = JSON.parse(localStorage.getItem('clienteData') || '{}');
    
    // Obter ID da barbearia da URL ou de um valor padrão
    const urlParams = new URLSearchParams(window.location.search);
    const barbeariaId = urlParams.get('barbearia') || '5f7b5d8a9d3e2c1a3b5c7d9e'; // ID padrão para teste
    
    // Função para buscar prêmios da barbearia
    async function buscarPremios() {
      try {
        const response = await fetch(`http://localhost:5000/api/premios/todos?barbearia=${barbeariaId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar prêmios');
        }
        
        const premios = await response.json();
        return premios;
      } catch (error) {
        console.error('Erro:', error);
        return []; // Retornar array vazio em caso de erro
      }
    }
    
    // Função para registrar o resgate do prêmio
    async function registrarResgate(premioId) {
      try {
        const response = await fetch('http://localhost:5000/api/resgates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clienteNome: clienteData.nome || 'Cliente',
            clienteEmail: clienteData.email || 'cliente@exemplo.com',
            clienteTelefone: clienteData.telefone || '00000000000',
            premioId,
            barbeariaId
          })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao registrar resgate');
        }
        
        const data = await response.json();
        
        // Salvar código do resgate no localStorage para usar na página de resultado
        localStorage.setItem('resgateData', JSON.stringify(data.resgate));
        
        return data.resgate;
      } catch (error) {
        console.error('Erro:', error);
        return null;
      }
    }
    
    // Carregar prêmios da barbearia
    let PREMIOS = [];
    
    buscarPremios().then(premios => {
      if (premios.length > 0) {
        PREMIOS = premios;
      } else {
        // Usar prêmios padrão se não conseguir buscar do servidor
        PREMIOS = [
          { id: '1', nome: '20% de desconto em corte de cabelo e barba', icon: 'cut', probabilidade: 25, cor: 'from-blue-500 to-cyan-500' },
          { id: '2', nome: '30% de desconto em produto para barba', icon: 'box', probabilidade: 20, cor: 'from-purple-500 to-indigo-500' },
          { id: '3', nome: '20% de desconto em pomada para cabelo', icon: 'spray-can', probabilidade: 15, cor: 'from-pink-500 to-rose-500' },
          { id: '4', nome: 'Corte grátis', icon: 'gift', probabilidade: 5, cor: 'from-amber-500 to-orange-500' },
          { id: '5', nome: 'Café espresso grátis', icon: 'coffee', probabilidade: 10, cor: 'from-yellow-500 to-amber-500' },
          { id: '6', nome: '15% de desconto em camisetas da loja', icon: 'tshirt', probabilidade: 10, cor: 'from-emerald-500 to-green-500' },
          { id: '7', nome: 'Tratamento de barba com desconto de 25%', icon: 'magic', probabilidade: 10, cor: 'from-red-500 to-pink-500' },
          { id: '8', nome: 'Kit de cuidados faciais com 10% de desconto', icon: 'brush', probabilidade: 5, cor: 'from-sky-500 to-blue-500' }
        ];
      }
    });
    
    let girandoRoleta = false;
    
    // Função para criar confetes quando ganhar o prêmio
    function criarConfetes() {
      // ... (código existente)
    }
    
    // Função para sortear um prêmio baseado nas probabilidades
    function sortearPremio() {
      if (girandoRoleta || PREMIOS.length === 0) return;
      
      girandoRoleta = true;
      btnGirar.disabled = true;
      btnGirar.textContent = 'Girando...';
      
      // Sortear o prêmio baseado nas probabilidades
      const random = Math.random() * 100;
      let acumulado = 0;
      let premioIndex = 0;
      
      for (let i = 0; i < PREMIOS.length; i++) {
        acumulado += PREMIOS[i].probabilidade;
        if (random <= acumulado) {
          premioIndex = i;
          break;
        }
      }
      
      const premioSelecionado = PREMIOS[premioIndex];
      
      // Calcular o ângulo para o prêmio selecionado
      const anguloPorPremio = 360 / PREMIOS.length;
      const anguloFinal = 1800 + premioIndex * anguloPorPremio;
      
      // Girar a roleta
      roleta.style.transform = `rotate(${anguloFinal}deg)`;
      
      // Mostrar o resultado após a animação
      setTimeout(() => {
        premioTexto.textContent = premioSelecionado.nome;
        resultadoPremio.style.display = 'block';
        criarConfetes();
        
        // Registrar o resgate no backend
        registrarResgate(premioSelecionado.id).then(resgate => {
          // Redirecionar para a página de resultado após 3 segundos
          setTimeout(() => {
            window.location.href = `/app/resultado.html?codigo=${resgate?.codigo || ''}`;
          }, 3000);
        });
      }, 3000); // Tempo da animação da roleta
    }
    
    // Adicionar evento de clique ao botão
    btnGirar.addEventListener('click', sortearPremio);
  });