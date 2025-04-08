document.addEventListener('DOMContentLoaded', function() {
    const roleta = document.getElementById('roleta');
    const btnGirar = document.getElementById('btnGirar');
    const resultadoPremio = document.getElementById('resultadoPremio');
    const premioTexto = document.getElementById('premioTexto');
    
    let girandoRoleta = false;
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = '/app/login.html';
      return;
    }
    
    // Função para criar confetes quando ganhar o prêmio
    function criarConfetes() {
      // ... (código existente)
    }
    
    // Função para sortear um prêmio
    async function sortearPremio() {
      if (girandoRoleta) return;
      
      girandoRoleta = true;
      btnGirar.disabled = true;
      btnGirar.textContent = 'Girando...';
      
      try {
        // Fazer requisição para a API
        const response = await fetch('http://localhost:5000/api/premios/todos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao sortear prêmio');
        }
        
        // Encontrar o índice do prêmio na roleta
        const premioIndex = Array.from(document.querySelectorAll('.roleta-section'))
          .findIndex(section => section.querySelector('.roleta-content span').textContent.includes(data.premio.nome.substring(0, 10)));
        
        // Calcular o ângulo para o prêmio selecionado
        const anguloFinal = 1800 + 22.5 + (premioIndex * 45);
        
        // Girar a roleta
        roleta.style.transform = `rotate(${anguloFinal}deg)`;
        
        // Mostrar o resultado após a animação
        setTimeout(() => {
          premioTexto.textContent = data.premio.nome;
          resultadoPremio.style.display = 'block';
          criarConfetes();
          
          // Salvar dados do prêmio no localStorage
          localStorage.setItem('premioDados', JSON.stringify({
            premio: data.premio,
            resgate: data.resgate
          }));
          
          // Redirecionar para a página de resultado após 3 segundos
          setTimeout(() => {
            window.location.href = `/app/resultado.html?premio=${data.premio._id}`;
          }, 3000);
          
        }, 3000); // Tempo da animação da roleta
      } catch (error) {
        alert(error.message);
        girandoRoleta = false;
        btnGirar.disabled = false;
        btnGirar.textContent = 'Girar Roleta';
      }
    }
    
    // Adicionar evento de clique ao botão
    btnGirar.addEventListener('click', sortearPremio);
  });