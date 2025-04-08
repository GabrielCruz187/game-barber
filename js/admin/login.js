document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    
    btnLogin.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Validar o formulário
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      
      if (!email || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      try {
        // Fazer login na API
        const response = await fetch('http://localhost:5000/api/barbearias/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao fazer login');
        }
        
        // Salvar token no localStorage
        localStorage.setItem('barbeariaToken', data.token);
        localStorage.setItem('barbeariaData', JSON.stringify({
          id: data._id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone
        }));
        
        // Redirecionar para o dashboard
        window.location.href = '/app/admin/dashboard.html';
      } catch (error) {
        alert(error.message);
      }
    });
  });