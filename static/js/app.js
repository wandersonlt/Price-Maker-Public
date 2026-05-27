// static/js/app.js - JavaScript da página pública

// URL do seu backend no Render
const API_URL = 'https://precificador-pro-2k2v.onrender.com';

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
    const loginEmail = document.getElementById('loginEmail');
    const loginSenha = document.getElementById('loginSenha');
    const signupNome = document.getElementById('signupNome');
    const signupEmail = document.getElementById('signupEmail');
    const signupSenha = document.getElementById('signupSenha');
    const signupConfirmar = document.getElementById('signupConfirmar');
    const recuperarEmail = document.getElementById('recuperarEmail');
    
    if (loginEmail) loginEmail.value = '';
    if (loginSenha) loginSenha.value = '';
    if (signupNome) signupNome.value = '';
    if (signupEmail) signupEmail.value = '';
    if (signupSenha) signupSenha.value = '';
    if (signupConfirmar) signupConfirmar.value = '';
    if (recuperarEmail) recuperarEmail.value = '';
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
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

function mostrarRecuperar() {
    document.getElementById('loginPane').style.display = 'none';
    document.getElementById('signupPane').style.display = 'none';
    document.getElementById('recuperarPane').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}

function voltarLogin() {
    document.getElementById('recuperarPane').style.display = 'none';
    document.getElementById('loginPane').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}

function mostrarErro(mensagem) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.innerHTML = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function mostrarSucesso(mensagem) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.innerHTML = mensagem;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    if (!email || !senha) {
        mostrarErro('Preencha todos os campos!');
        return;
    }

    mostrarSucesso('Verificando dados...');

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
            localStorage.setItem('precificador_usuario', data.usuario_id);
            localStorage.setItem('precificador_email', email);
            
            mostrarSucesso('Login realizado! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = `${API_URL}/dashboard?token=${data.token}`;
            }, 1500);
        } else {
            mostrarErro(data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('Erro ao conectar ao servidor. Tente novamente.');
    }
}

async function fazerCadastro() {
    const nome = document.getElementById('signupNome').value;
    const email = document.getElementById('signupEmail').value;
    const senha = document.getElementById('signupSenha').value;
    const confirmar = document.getElementById('signupConfirmar').value;

    if (!email || !senha) {
        mostrarErro('Preencha todos os campos!');
        return;
    }

    if (senha !== confirmar) {
        mostrarErro('As senhas não coincidem!');
        return;
    }

    if (senha.length < 6) {
        mostrarErro('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    mostrarSucesso('Criando conta...');

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
            mostrarSucesso('Cadastro realizado com sucesso! Faça login.');
            setTimeout(() => {
                switchTab('login');
                const loginEmail = document.getElementById('loginEmail');
                if (loginEmail) loginEmail.value = email;
                const loginSenha = document.getElementById('loginSenha');
                if (loginSenha) loginSenha.value = '';
                limparCampos();
            }, 2000);
        } else {
            mostrarErro(data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('Erro ao conectar ao servidor. Tente novamente.');
    }
}

async function enviarRecuperacao() {
    const email = document.getElementById('recuperarEmail').value;

    if (!email) {
        mostrarErro('Digite seu email!');
        return;
    }

    mostrarSucesso('Enviando...');

    try {
        const response = await fetch(`${API_URL}/api/recuperar-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (data.sucesso) {
            mostrarSucesso(data.mensagem);
            setTimeout(() => {
                voltarLogin();
            }, 3000);
        } else {
            mostrarErro(data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('Erro ao enviar solicitação');
    }
}

// Verificar se já está logado
const token = localStorage.getItem('precificador_token');
if (token) {
    window.location.href = `${API_URL}/dashboard?token=${token}`;
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        fecharModal();
    }
};