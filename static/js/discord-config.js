// public/js/discord-config.js
let discordState = { connected: false, monitoringEnabled: false, guilds: [] };

async function carregarStatusDiscord() {
    try {
        const response = await fetch(`https://price-maker-pro.onrender.com/api/discord/status`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
            discordState.connected = data.connected;
            discordState.monitoringEnabled = data.monitoring_enabled;
            atualizarInterfaceDiscord(data);
        }
    } catch (error) { console.error(error); }
}

function atualizarInterfaceDiscord(data) {
    const area = document.getElementById('discordConfigArea');
    if (!area) return;
    if (data.connected) {
        if (data.monitoring_enabled) {
            area.innerHTML = `<div>✅ Conectado como ${data.discord_username}<br>📡 ${data.guild_name} / #${data.channel_name}</div>
            <button onclick="desconectarDiscord()">🔌 DESCONECTAR</button>`;
        } else {
            area.innerHTML = `<div>✅ Conectado como ${data.discord_username}</div>
            <button onclick="abrirModalDiscord()">⚙️ CONFIGURAR</button>
            <button onclick="desconectarDiscord()">🔌 DESCONECTAR</button>`;
        }
    } else {
        area.innerHTML = `<div>❌ Não conectado</div><button onclick="conectarDiscord()">🔐 CONECTAR DISCORD</button>`;
    }
}

async function conectarDiscord() {
    const res = await fetch(`https://price-maker-pro.onrender.com/api/discord/auth-url`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) {
        localStorage.setItem('discord_state', data.state);
        window.location.href = data.auth_url;
    }
}

async function abrirModalDiscord() {
    const res = await fetch(`https://price-maker-pro.onrender.com/api/discord/auth-url`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success && data.guilds) {
        discordState.guilds = data.guilds;
        mostrarModal();
    }
}

function mostrarModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content"><h2>Configurar Discord</h2>
        <select id="guildSelect" onchange="carregarCanais()"><option>Selecione o servidor</option>
        ${discordState.guilds.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}</select>
        <select id="channelSelect" disabled><option>Selecione um canal</option></select>
        <button onclick="salvarConfig()">Salvar</button>
        <button onclick="fecharModal()">Cancelar</button></div>`;
    document.body.appendChild(modal);
}

async function carregarCanais() {
    const guildId = document.getElementById('guildSelect').value;
    const res = await fetch(`https://price-maker-pro.onrender.com/api/discord/canais`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ guild_id: guildId })
    });
    const data = await res.json();
    const channelSelect = document.getElementById('channelSelect');
    channelSelect.disabled = false;
    channelSelect.innerHTML = data.channels.map(c => `<option value="${c.id}">#${c.name}</option>`).join('');
}

async function salvarConfig() {
    const guildId = document.getElementById('guildSelect').value;
    const guildName = document.getElementById('guildSelect').options[document.getElementById('guildSelect').selectedIndex]?.text;
    const channelId = document.getElementById('channelSelect').value;
    const channelName = document.getElementById('channelSelect').options[document.getElementById('channelSelect').selectedIndex]?.text.replace('#', '');
    
    await fetch(`https://price-maker-pro.onrender.com/api/discord/salvar-config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ guild_id: guildId, guild_name: guildName, channel_id: channelId, channel_name: channelName })
    });
    fecharModal();
    carregarStatusDiscord();
}

async function desconectarDiscord() {
    await fetch(`https://price-maker-pro.onrender.com/api/discord/desconectar`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    carregarStatusDiscord();
}

function fecharModal() { document.querySelector('.modal')?.remove(); }

function processarCallbackDiscord() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (code && state === localStorage.getItem('discord_state')) {
        localStorage.removeItem('discord_state');
        fetch(`https://price-maker-pro.onrender.com/api/discord/trocar-token`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ code })
        }).then(() => { window.history.replaceState({}, '', window.location.pathname); carregarStatusDiscord(); });
    }
}