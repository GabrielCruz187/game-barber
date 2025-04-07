document.addEventListener('DOMContentLoaded', function() {
    const btnLogin = document.getElementById('btnLogin');
    const loginForm = document.getElementById('loginForm');
    
    btnLogin.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Validar o formulário
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      
      if (!email || !phone) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      try {
        // Fazer login na API
        const response = await fetch('/api/auth/login-simple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, phone })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao fazer login');
        }
        
        // Salvar token no localStorage
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone
        }));
        
        // Redirecionar para a página do jogo
        window.location.href = '/app/jogo.html';
      } catch (error) {
        alert(error.message);
      }
    });
  });