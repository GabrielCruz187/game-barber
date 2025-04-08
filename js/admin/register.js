document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const btnRegister = document.getElementById('btnRegister');
    
    btnRegister.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Validar o formulário
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const telefone = document.getElementById('telefone').value;
      const senha = document.getElementById('senha').value;
      const confirmarSenha = document.getElementById('confirmarSenha').value;
      
      // Validar campos obrigatórios
      if (!nome || !email || !telefone || !senha) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Validar senhas
      if (senha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
      }
      
      // Dados do endereço
      const endereco = {
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        cep: document.getElementById('cep').value
      };
      
      try {
        // Enviar dados para a API
        const response = await fetch('http://localhost:5000/api/barbearias/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            email,
            telefone,
            senha,
            endereco
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao cadastrar barbearia');
        }
        
        // Salvar token no localStorage
        localStorage.setItem('barbeariaToken', data.token);
        localStorage.setItem('barbeariaData', JSON.stringify({
          id: data._id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone
        }));
        // Criar sessão de checkout
      const checkoutResponse = await fetch('/api/pagamentos/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barbeariaId: data._id
        })
      });
      
      const checkoutData = await checkoutResponse.json();
      
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.message || 'Erro ao criar checkout');
      }
      
      // Redirecionar para a página de checkout do Stripe
      window.location.href = checkoutData.url;
    } catch (error) {
      alert(error.message);
    }
  });
});

        
        