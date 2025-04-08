document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('barbeariaToken');
    const barbeariaData = JSON.parse(localStorage.getItem('barbeariaData') || '{}');
    
    if (!token) {
      window.location.href = '/app/admin/login.html';
      return;
    }
    
    // Configurar nome da barbearia
    document.getElementById('barbeariaNome').textContent = barbeariaData.nome || 'Barbearia';
    
    // Configurar navegação por tabs
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
      if (item.id === 'btnLogout') return;
      
      item.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Atualizar menu ativo
        menuItems.forEach(mi => mi.classList.remove('active'));
        this.classList.add('active');
        
        // Mostrar conteúdo da tab
        tabContents.forEach(tab => {
          if (tab.id === `${tabName}-tab`) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      });
    });
    
    // Configurar botão de logout
    document.getElementById('btnLogout').addEventListener('click', function() {
      localStorage.removeItem('barbeariaToken');
      localStorage.removeItem('barbeariaData');
      window.location.href = '/app/admin/login.html';
    });
    
    // Configurar menu mobile
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
    }
    
    // Carregar dados da barbearia
    loadBarbeariaProfile();
    
    // Carregar estatísticas
    loadStats();
    
    // Carregar prêmios
    loadPremios();
    
    // Configurar eventos dos botões
    setupButtonEvents();
  });
  
  // Função para carregar o perfil da barbearia
  async function loadBarbeariaProfile() {
    try {
      const token = localStorage.getItem('barbeariaToken');
      
      const response = await fetch('http://localhost:5000/api/barbearias/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar perfil da barbearia');
      }
      
      const barbearia = await response.json();
      
      // Preencher formulário de informações
      document.getElementById('barbNome').value = barbearia.nome || '';
      document.getElementById('barbEmail').value = barbearia.email || '';
      document.getElementById('barbTelefone').value = barbearia.telefone || '';
      
      if (barbearia.endereco) {
        document.getElementById('barbRua').value = barbearia.endereco.rua || '';
        document.getElementById('barbNumero').value = barbearia.endereco.numero || '';
        document.getElementById('barbBairro').value = barbearia.endereco.bairro || '';
        document.getElementById('barbCidade').value = barbearia.endereco.cidade || '';
        document.getElementById('barbEstado').value = barbearia.endereco.estado || '';
        document.getElementById('barbCep').value = barbearia.endereco.cep || '';
      }
      
      // Preencher configurações de personalização
      if (barbearia.logo) {
        document.getElementById('logoPreview').src = barbearia.logo;
      }
      
      if (barbearia.cores) {
        document.getElementById('corPrimaria').value = barbearia.cores.primaria || '#6a11cb';
        document.getElementById('corSecundaria').value = barbearia.cores.secundaria || '#2575fc';
        document.getElementById('corBotoes').value = barbearia.cores.botoes || '#ff6b6b';
      }
      
      if (barbearia.configuracoes) {
        document.getElementById('limiteTentativas').value = barbearia.configuracoes.limiteTentativasMes || 1;
        document.getElementById('diasValidade').value = barbearia.configuracoes.diasValidadePremio || 30;
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }
  
  // Função para carregar estatísticas
  async function loadStats() {
    try {
      const token = localStorage.getItem('barbeariaToken');
      
      const response = await fetch('http://localhost:5000/api/barbearias/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      const stats = await response.json();
      
      // Atualizar cards de estatísticas
      document.getElementById('totalPremios').textContent = stats.totalPremios || 0;
      document.getElementById('totalResgates').textContent = stats.totalResgates || 0;
      document.getElementById('resgatesConfirmados').textContent = stats.resgatesConfirmados || 0;
      document.getElementById('novosResgates').textContent = stats.novosResgates || 0;
      
      // Criar gráfico de distribuição de prêmios
      if (stats.distribuicaoPremios && stats.distribuicaoPremios.length > 0) {
        const ctx = document.getElementById('premiosChart').getContext('2d');
        
        const labels = stats.distribuicaoPremios.map(p => p.nome);
        const data = stats.distribuicaoPremios.map(p => p.count);
        
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Quantidade de Resgates',
              data: data,
              backgroundColor: 'rgba(106, 17, 203, 0.7)',
              borderColor: 'rgba(106, 17, 203, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }
  
  // Função para carregar prêmios
  async function loadPremios() {
    try {
      const token = localStorage.getItem('barbeariaToken');
      
      const response = await fetch('http://localhost:5000/api/barbearias/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar prêmios');
      }
      
      const barbearia = await response.json();
      
      if (barbearia.premiosPersonalizados && barbearia.premiosPersonalizados.length > 0) {
        const premiosResponse = await fetch('http://localhost:5000/api/premios/todos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!premiosResponse.ok) {
          throw new Error('Erro ao carregar prêmios');
        }
        
        const premios = await premiosResponse.json();
        const premiosBarbearia = premios.filter(p => 
          barbearia.premiosPersonalizados.includes(p._id)
        );
        
        renderPremiosList(premiosBarbearia);
      } else {
        const premiosResponse = await fetch('http://localhost:5000/api/premios/todos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!premiosResponse.ok) {
          throw new Error('Erro ao carregar prêmios');
        }
        
        const premios = await premiosResponse.json();
        renderPremiosList(premios);
      }
    } catch (error) {
      console.error('Erro ao carregar os prêmios:', error);
    }
  }
  
  
  
  // Função para renderizar a lista de prêmios
  function renderPremiosList(premios) {
    const premiosList = document.getElementById('premiosList');
    premiosList.innerHTML = '';
    
    premios.forEach((premio, index) => {
      const premioItem = document.createElement('div');
      premioItem.className = 'premio-item mb-4 p-4 border rounded';
      premioItem.dataset.id = premio._id;
      
      premioItem.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <div class="premio-icon mr-3 p-2 rounded-full" style="background: ${premio.cor}; color: white;">
              <i class="fas fa-${premio.icon}"></i>
            </div>
            <div>
              <h3 class="font-bold">${premio.nome}</h3>
              <p class="text-sm text-gray-600">${premio.descricao || premio.nome}</p>
            </div>
          </div>
          <div>
            <button class="btn-edit-premio btn btn-outline btn-sm mr-2" data-index="${index}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete-premio btn btn-outline btn-sm text-red-500" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Probabilidade</label>
            <input type="range" min="1" max="100" value="${premio.probabilidade}" class="premio-prob w-full" data-index="${index}">
            <div class="text-right text-sm"><span class="premio-prob-value">${premio.probabilidade}</span>%</div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Status</label>
            <div class="flex items-center">
              <label class="switch">
                <input type="checkbox" class="premio-ativo" data-index="${index}" ${premio.ativo ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
              <span class="ml-2 text-sm">${premio.ativo ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
        </div>
      `;
      
      premiosList.appendChild(premioItem);
    });
    
    // Adicionar evento para os sliders de probabilidade
    document.querySelectorAll('.premio-prob').forEach(slider => {
      slider.addEventListener('input', function() {
        const value = this.value;
        const index = this.dataset.index;
        document.querySelectorAll('.premio-prob-value')[index].textContent = value;
      });
    });
    
    // Adicionar eventos para os botões de editar e excluir
    setupPremioButtons();
  }
  
  // Configurar eventos dos botões
  function setupButtonEvents() {
    // Botão para salvar informações da barbearia
    document.getElementById('btnSalvarBarbearia').addEventListener('click', async function() {
      try {
        const token = localStorage.getItem('barbeariaToken');
        
        const nome = document.getElementById('barbNome').value;
        const email = document.getElementById('barbEmail').value;
        const telefone = document.getElementById('barbTelefone').value;
        
        const endereco = {
          rua: document.getElementById('barbRua').value,
          numero: document.getElementById('barbNumero').value,
          bairro: document.getElementById('barbBairro').value,
          cidade: document.getElementById('barbCidade').value,
          estado: document.getElementById('barbEstado').value,
          cep: document.getElementById('barbCep').value
        };
        
        const response = await fetch('http://localhost:5000//api/barbearias/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            email,
            telefone,
            endereco
          })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao atualizar informações');
        }
        
        const data = await response.json();
        
        // Atualizar dados no localStorage
        const barbeariaData = JSON.parse(localStorage.getItem('barbeariaData') || '{}');
        barbeariaData.nome = data.nome;
        barbeariaData.email = data.email;
        barbeariaData.telefone = data.telefone;
        localStorage.setItem('barbeariaData', JSON.stringify(barbeariaData));
        
        // Atualizar nome na sidebar
        document.getElementById('barbeariaNome').textContent = data.nome;
        
        alert('Informações atualizadas com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    });
    
    // Botão para upload de logo
    document.getElementById('btnUploadLogo').addEventListener('click', function() {
      document.getElementById('logoUpload').click();
    });
    
    document.getElementById('logoUpload').addEventListener('change', async function(e) {
      if (!this.files || !this.files[0]) return;
      
      const file = this.files[0];
      const formData = new FormData();
      formData.append('logo', file);
      
      try {
        const token = localStorage.getItem('barbeariaToken');
        
        const response = await fetch('http://localhost:5000/api/barbearias/upload-logo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Erro ao fazer upload da logo');
        }
        
        const data = await response.json();
        
        // Atualizar preview da logo
        document.getElementById('logoPreview').src = data.logo;
        
        alert('Logo atualizada com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    });
    
    // Botão para salvar personalização
    document.getElementById('btnSalvarPersonalizacao').addEventListener('click', async function() {
      try {
        const token = localStorage.getItem('barbeariaToken');
        
        const cores = {
          primaria: document.getElementById('corPrimaria').value,
          secundaria: document.getElementById('corSecundaria').value,
          botoes: document.getElementById('corBotoes').value
        };
        
        const configuracoes = {
          limiteTentativasMes: parseInt(document.getElementById('limiteTentativas').value),
          diasValidadePremio: parseInt(document.getElementById('diasValidade').value)
        };
        
        const response = await fetch('http://localhost:5000/api/barbearias/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cores,
            configuracoes
          })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao atualizar personalização');
        }
        
        alert('Personalização atualizada com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    });
    
    // Botão para adicionar novo prêmio
    document.getElementById('btnAddPremio').addEventListener('click', function() {
      const premiosList = document.getElementById('premiosList');
      
      const novoPremioItem = document.createElement('div');
      novoPremioItem.className = 'premio-item mb-4 p-4 border rounded bg-gray-50';
      
      novoPremioItem.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <div class="premio-icon mr-3 p-2 rounded-full bg-blue-500 text-white">
              <i class="fas fa-gift"></i>
            </div>
            <div>
              <input type="text" class="font-bold bg-transparent border-b border-gray-300 focus:outline-none" placeholder="Nome do prêmio" required>
              <input type="text" class="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none w-full" placeholder="Descrição do prêmio">
            </div>
          </div>
          <div>
            <button class="btn-cancel-premio btn btn-outline btn-sm text-red-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Probabilidade</label>
            <input type="range" min="1" max="100" value="10" class="w-full">
            <div class="text-right text-sm"><span>10</span>%</div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Ícone</label>
            <select class="w-full p-2 border rounded">
              <option value="gift">Presente</option>
              <option value="cut">Tesoura</option>
              <option value="box">Caixa</option>
              <option value="spray-can">Spray</option>
              <option value="coffee">Café</option>
              <option value="tshirt">Camiseta</option>
              <option value="magic">Mágica</option>
              <option value="brush">Pincel</option>
            </select>
          </div>
        </div>
      `;
      
      premiosList.prepend(novoPremioItem);
      
      // Adicionar evento para o botão de cancelar
      novoPremioItem.querySelector('.btn-cancel-premio').addEventListener('click', function() {
        premiosList.removeChild(novoPremioItem);
      });
    });
    
    // Botão para salvar prêmios
    document.getElementById('btnSalvarPremios').addEventListener('click', async function() {
      try {
        const token = localStorage.getItem('barbeariaToken');
        
        // Coletar dados dos prêmios
        const premiosItems = document.querySelectorAll('.premio-item');
        const premios = [];
        
        premiosItems.forEach(item => {
          const id = item.dataset.id;
          const nome = item.querySelector('h3') ? 
                      item.querySelector('h3').textContent : 
                      item.querySelector('input[placeholder="Nome do prêmio"]').value;
                      
          const descricao = item.querySelector('p') ? 
                          item.querySelector('p').textContent : 
                          item.querySelector('input[placeholder="Descrição do prêmio"]').value || nome;
                          
          const probabilidade = item.querySelector('.premio-prob') ? 
                              parseInt(item.querySelector('.premio-prob').value) : 
                              parseInt(item.querySelector('input[type="range"]').value);
                              
          const ativo = item.querySelector('.premio-ativo') ? 
                      item.querySelector('.premio-ativo').checked : 
                      true;
                      
          const icon = item.querySelector('select') ? 
                      item.querySelector('select').value : 
                      item.querySelector('.fas').className.replace('fas fa-', '');
                      
          const cor = item.querySelector('.premio-icon').style.background || 
                    'from-blue-500 to-cyan-500';
          
          premios.push({
            _id: id,
            nome,
            descricao,
            probabilidade,
            ativo,
            icon,
            cor
          });
        });
        
        const response = await fetch('http://localhost:5000/api/barbearias/premios', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ premios })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao salvar prêmios');
        }
        
        const data = await response.json();
        
        // Atualizar lista de prêmios
        renderPremiosList(data.premios);
        
        alert('Prêmios atualizados com sucesso!');
      } catch (error) {
        alert(error.message);
      }
    });
    
    // Botão para verificar resgate
    document.getElementById('btnVerificarResgate').addEventListener('click', async function() {
      const codigo = document.getElementById('codigoResgate').value;
      
      if (!codigo) {
        alert('Por favor, digite um código de resgate.');
        return;
      }
      
      try {
        const token = localStorage.getItem('barbeariaToken');
        
        const response = await fetch(`http://localhost:5000/api/premios/todos/resgate/${codigo}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Código de resgate inválido ou expirado');
        }
        
        const resgate = await response.json();
        
        // Exibir informações do resgate
        const resgateInfo = document.getElementById('resgateInfo');
        resgateInfo.style.display = 'block';
        
        resgateInfo.innerHTML = `
          <div class="bg-gray-50 p-4 rounded mb-4">
            <h3 class="font-bold mb-2">Informações do Resgate</h3>
            <p><strong>Cliente:</strong> ${resgate.user.name}</p>
            <p><strong>Email:</strong> ${resgate.user.email}</p>
            <p><strong>Telefone:</strong> ${resgate.user.phone}</p>
            <p><strong>Prêmio:</strong> ${resgate.premio.nome}</p>
            <p><strong>Código:</strong> ${resgate.codigo}</p>
            <p><strong>Data de Expiração:</strong> ${new Date(resgate.dataExpiracao).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${resgate.resgatado ? 'Já Resgatado' : 'Não Resgatado'}</p>
          </div>
          
          ${!resgate.resgatado ? `
            <button id="btnConfirmarResgate" class="btn btn-primary w-full">
              <i class="fas fa-check-circle"></i> Confirmar Resgate
            </button>
          ` : ''}
        `;
        
        // Adicionar evento para o botão de confirmar resgate
        if (!resgate.resgatado) {
          document.getElementById('btnConfirmarResgate').addEventListener('click', async function() {
            try {
              const confirmResponse = await fetch(`/api/premios/todos/resgate/${codigo}/confirmar`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (!confirmResponse.ok) {
                throw new Error('Erro ao confirmar resgate');
              }
              
              alert('Resgate confirmado com sucesso!');
              
              // Atualizar informações do resgate
              document.getElementById('btnVerificarResgate').click();
            } catch (error) {
              alert(error.message);
            }
          });
        }
      } catch (error) {
        alert(error.message);
      }
    });
    
    // Botão para exportar lista de clientes
    document.getElementById('btnExportarClientes').addEventListener('click', function() {
      alert('Funcionalidade de exportação será implementada em breve.');
    });
  }
  
  // Configurar eventos dos botões de prêmios
  function setupPremioButtons() {
    // Botões de editar prêmio
    document.querySelectorAll('.btn-edit-premio').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = this.dataset.index;
        const premioItem = document.querySelectorAll('.premio-item')[index];
        
        // Implementar lógica de edição
        alert('Funcionalidade de edição será implementada em breve.');
      });
    });
    
    // Botões de excluir prêmio
    document.querySelectorAll('.btn-delete-premio').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = this.dataset.index;
        const premioItem = document.querySelectorAll('.premio-item')[index];
        
        if (confirm('Tem certeza que deseja excluir este prêmio?')) {
          premioItem.remove();
        }
      });
    });
  }