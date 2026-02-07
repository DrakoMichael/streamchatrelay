// Connections Configuration Editor JavaScript
(function() {
    'use strict';

    const form = document.getElementById('connectionsForm');
    const alertDiv = document.getElementById('alert');
    const reloadBtn = document.getElementById('reloadBtn');
    const backBtn = document.getElementById('backBtn');
    const configBtn = document.getElementById('configBtn');

    // Back button handler
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // Config button handler
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            window.location.href = '/config.html';
        });
    }

    // Show alert message
    function showAlert(message, isError = false) {
        alertDiv.textContent = message;
        alertDiv.className = isError ? 'alert alert-error' : 'alert alert-success';
        alertDiv.style.display = 'block';
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }

    // Load connections from server
    async function loadConnections() {
        try {
            const response = await fetch('/api/connections');
            if (!response.ok) {
                throw new Error('Falha ao carregar conexões');
            }
            
            const connections = await response.json();
            populateForm(connections);
            showAlert('Conexões carregadas com sucesso!');
        } catch (error) {
            console.warn('Conexões ainda não configuradas:', error.message);
            showAlert('Usando configuração padrão (vazia)', false);
        }
    }

    // Populate form with connections data
    function populateForm(connections) {
        // Twitch
        if (connections.twitch) {
            document.getElementById('twitch_enabled').checked = connections.twitch.enabled || false;
            document.getElementById('twitch_token').value = connections.twitch.token || '';
            document.getElementById('twitch_channel').value = connections.twitch.channel || '';
            document.getElementById('twitch_username').value = connections.twitch.username || '';
        }

        // YouTube
        if (connections.youtube) {
            document.getElementById('youtube_enabled').checked = connections.youtube.enabled || false;
            document.getElementById('youtube_api_key').value = connections.youtube.api_key || '';
            document.getElementById('youtube_channel_id').value = connections.youtube.channel_id || '';
            document.getElementById('youtube_live_id').value = connections.youtube.live_id || '';
        }

        // Rumble
        if (connections.rumble) {
            document.getElementById('rumble_enabled').checked = connections.rumble.enabled || false;
            document.getElementById('rumble_token').value = connections.rumble.token || '';
            document.getElementById('rumble_channel').value = connections.rumble.channel || '';
        }

        // Kick
        if (connections.kick) {
            document.getElementById('kick_enabled').checked = connections.kick.enabled || false;
            document.getElementById('kick_token').value = connections.kick.token || '';
            document.getElementById('kick_channel').value = connections.kick.channel || '';
        }

        // TikTok
        if (connections.tiktok) {
            document.getElementById('tiktok_enabled').checked = connections.tiktok.enabled || false;
            document.getElementById('tiktok_username').value = connections.tiktok.username || '';
            document.getElementById('tiktok_session').value = connections.tiktok.session || '';
        }
    }

    // Collect form data
    function getFormData() {
        return {
            twitch: {
                enabled: document.getElementById('twitch_enabled').checked,
                token: document.getElementById('twitch_token').value,
                channel: document.getElementById('twitch_channel').value,
                username: document.getElementById('twitch_username').value
            },
            youtube: {
                enabled: document.getElementById('youtube_enabled').checked,
                api_key: document.getElementById('youtube_api_key').value,
                channel_id: document.getElementById('youtube_channel_id').value,
                live_id: document.getElementById('youtube_live_id').value
            },
            rumble: {
                enabled: document.getElementById('rumble_enabled').checked,
                token: document.getElementById('rumble_token').value,
                channel: document.getElementById('rumble_channel').value
            },
            kick: {
                enabled: document.getElementById('kick_enabled').checked,
                token: document.getElementById('kick_token').value,
                channel: document.getElementById('kick_channel').value
            },
            tiktok: {
                enabled: document.getElementById('tiktok_enabled').checked,
                username: document.getElementById('tiktok_username').value,
                session: document.getElementById('tiktok_session').value
            }
        };
    }

    // Save connections to server
    async function saveConnections() {
        try {
            const data = getFormData();
            
            const response = await fetch('/api/connections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar conexões');
            }

            showAlert('Conexões salvas com sucesso!');
            console.log('Conexões salvas:', data);
        } catch (error) {
            showAlert('Erro ao salvar conexões: ' + error.message, true);
            console.error('Erro:', error);
        }
    }

    // Reset form to saved values
    reloadBtn.addEventListener('click', () => {
        loadConnections();
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveConnections();
    });

    // Initialize
    loadConnections();
})();
