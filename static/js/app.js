// public/static/js/app.js - Landing Page com recuperação por email

const API_URL = 'https://precificador-pro-2k2v.onrender.com';

// ==================== FUNÇÃO PARA SELECIONAR TEXTO AO CLICAR ====================
function setupAutoSelectOnClick() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('click', function() {
            if (this.type === 'number' || this.type === 'text' || this.type === 'email' || this.type === 'password') {
                this.select();
            }
        });
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.blur();
                const event = new Event('change', { bubbles: true });
                this.dispatchEvent(event);
            }
        });
    });
}

// ==================== MODAL ====================
function abrirModal() {
    document.getElementById('modalAuth').style.display = 'flex';
    switchTab('login');
    document.getElementById('recuperarPane').style.display = 'none';
    document.getElementById('loginPane').style.display = 'block';
    document.getElementById('signupPane').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    limparCampos();
}

function abrirModalCadastro() {
    document.getElementById('modalAuth').style.display = 'flex';
    switchTab('signup');
    document.getElementById('recuperarPane').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    limparCampos();
}

function limparCampos() {
    const campos = ['loginEmail', 'loginSenha', 'signupNome', 'signupEmail', 'signupSenha', 'signupConfirmar', 'recuperarEmail'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function fecharModal() {
    document.getElementById('modalAuth').style.display = 'none';
}

function switchTab(tab) {
    const loginPane = document.getElementById('loginPane');
    const signupPane = document.getElementById('signupPane');
    const loginBtn = document.querySelectorAll('.tab-btn')[0];
    const signupBtn = document.querySelectorAll('.tab-btn')[1];
    
    if (tab === 'login') {
        if (loginPane) loginPane.style.display = 'block';
        if (signupPane) signupPane.style.display = 'none';
        if (loginBtn) loginBtn.classList.add('active');
        if (signupBtn) signupBtn.classList.remove('active');
    } else {
        if (loginPane) loginPane.style.display = 'none';
        if (signupPane) signupPane.style.display = 'block';
        if (loginBtn) loginBtn.classList.remove('active');
        if (signupBtn) signupBtn.classList.add('active');
    }
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

function mostrarRecuperar() {
    document.getElementById('loginPane').style.display = 'none';
    document.getElementById('signupPane').style.display = 'none';
    document.getElementById('recuperarPane').style.display = 'block';
}

function voltarLogin() {
    document.getElementById('recuperarPane').style.display = 'none';
    document.getElementById('loginPane').style.display = 'block';
}

function mostrarMensagem(tipo, mensagem) {
    const element = document.getElementById(tipo === 'erro' ? 'errorMessage' : 'successMessage');
    if (element) {
        element.innerHTML = mensagem;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// ==================== LOGIN E CADASTRO ====================
async function fazerLogin() {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    if (!email || !senha) {
        mostrarMensagem('erro', 'Preencha todos os campos!');
        return;
    }

    mostrarMensagem('sucesso', 'Verificando dados...');

    try {
        const response = await fetch(`${API_URL}/api/login-direto`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        
        if (data.sucesso) {
            localStorage.setItem('precificador_token', data.token);
            mostrarMensagem('sucesso', 'Login realizado! Redirecionando...');
            setTimeout(() => {
                window.location.href = `${API_URL}/?token=${data.token}`;
            }, 1500);
        } else {
            mostrarMensagem('erro', data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('erro', 'Erro ao conectar ao servidor. Tente novamente.');
    }
}

async function fazerCadastro() {
    const nome = document.getElementById('signupNome').value;
    const email = document.getElementById('signupEmail').value;
    const senha = document.getElementById('signupSenha').value;
    const confirmar = document.getElementById('signupConfirmar').value;

    if (!email || !senha) {
        mostrarMensagem('erro', 'Preencha todos os campos!');
        return;
    }

    if (senha !== confirmar) {
        mostrarMensagem('erro', 'As senhas não coincidem!');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('erro', 'A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    mostrarMensagem('sucesso', 'Criando conta...');

    try {
        const response = await fetch(`${API_URL}/api/cadastro-direto`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();
        
        if (data.sucesso) {
            mostrarMensagem('sucesso', 'Cadastro realizado! Faça login.');
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginSenha').value = '';
                limparCampos();
            }, 2000);
        } else {
            mostrarMensagem('erro', data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('erro', 'Erro ao conectar ao servidor.');
    }
}

// ==================== RECUPERAR SENHA (SEGURA - ENVIA POR EMAIL) ====================
async function enviarRecuperacao() {
    const email = document.getElementById('recuperarEmail').value;

    if (!email) {
        mostrarMensagem('erro', 'Digite seu email!');
        return;
    }

    mostrarMensagem('sucesso', 'Enviando solicitação...');

    try {
        const response = await fetch(`${API_URL}/api/recuperar-senha`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (data.sucesso) {
            mostrarMensagem('sucesso', data.mensagem);
            setTimeout(() => {
                voltarLogin();
                document.getElementById('loginEmail').value = email;
            }, 3000);
        } else {
            mostrarMensagem('erro', data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('erro', 'Erro ao enviar solicitação');
    }
}

// ==================== FECHAR MODAL AO CLICAR FORA ====================
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        fecharModal();
    }
};

// ==================== INICIALIZAR ====================
setupAutoSelectOnClick();