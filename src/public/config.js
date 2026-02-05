// Config Editor JavaScript
(function() {
    'use strict';

    const form = document.getElementById('configForm');
    const alertDiv = document.getElementById('alert');
    const reloadBtn = document.getElementById('reloadBtn');
    const typeAmbienceSelect = document.getElementById('type_ambience');
    const devSection = document.getElementById('dev_section');
    const prodSection = document.getElementById('prod_section');

    // Show/hide sections based on environment type
    function toggleSections() {
        const isDev = typeAmbienceSelect.value === 'dev';
        devSection.style.display = isDev ? 'block' : 'none';
        prodSection.style.display = isDev ? 'none' : 'block';
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

    // Load configuration from server
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('Falha ao carregar configurações');
            }
            
            const config = await response.json();
            populateForm(config);
            showAlert('Configurações carregadas com sucesso!');
        } catch (error) {
            showAlert('Erro ao carregar configurações: ' + error.message, true);
        }
    }

    // Populate form with config data
    function populateForm(config) {
        // General settings
        document.getElementById('type_ambience').value = config.type_ambience || 'dev';
        document.getElementById('use_webserver').checked = config.use_webserver || false;
        document.getElementById('debbug').checked = config.debbug || false;
        document.getElementById('use_websocket').checked = config.use_websocket || false;

        // Development settings
        if (config.dev_config) {
            document.getElementById('dev_websocket_port').value = config.dev_config.dev_websocket_port || '';
            document.getElementById('dev_express_port').value = config.dev_config.dev_express_port || '';
            document.getElementById('enable_spam').checked = config.dev_config.enable_spam || false;
            document.getElementById('connected_chat_notify').checked = config.dev_config.connected_chat_notify || false;
            document.getElementById('print_spam_chats').checked = config.dev_config.print_spam_chats || false;
        }

        // Production settings
        document.getElementById('websocket_port').value = config.websocket_port || '';
        document.getElementById('express_port').value = config.express_port || '';

        // Twitch settings
        if (config.twitch) {
            document.getElementById('enable_twitch_connection').checked = config.twitch.enable_twitch_connection || false;
            document.getElementById('client_id').value = config.twitch.client_id || '';
            document.getElementById('access_token').value = config.twitch.access_token || '';
        }

        // Database settings
        if (config.database) {
            document.getElementById('enable_database').checked = config.database.enable_database || false;
            document.getElementById('enable_in_disk_db').checked = config.database.enable_in_disk_db || false;
            document.getElementById('enable_in_memory_db').checked = config.database.enable_in_memory_db || false;
            document.getElementById('indisk_db_name').value = config.database.indisk_db_name || '';
        }

        // Data control settings
        if (config.data_control) {
            document.getElementById('storage_messages_enabled').checked = config.data_control.storage_messages_enabled || false;
            document.getElementById('max_stored_messages').value = config.data_control.max_stored_messages || '';
            document.getElementById('message_cleanup_interval_ms').value = config.data_control.message_cleanup_interval_ms || '';
        }

        // Data analysis settings
        if (config.data_analysis) {
            document.getElementById('enable_data_analysis').checked = config.data_analysis.enable_data_analysis || false;
            document.getElementById('data_analysis_interval_ms').value = config.data_analysis.data_analysis_interval_ms || '';
        }

        toggleSections();
    }

    // Get form data as config object
    function getFormData() {
        return {
            type_ambience: document.getElementById('type_ambience').value,
            use_webserver: document.getElementById('use_webserver').checked,
            debbug: document.getElementById('debbug').checked,
            dev_config: {
                dev_websocket_port: parseInt(document.getElementById('dev_websocket_port').value) || 8181,
                dev_express_port: parseInt(document.getElementById('dev_express_port').value) || 3232,
                enable_spam: document.getElementById('enable_spam').checked,
                connected_chat_notify: document.getElementById('connected_chat_notify').checked,
                print_spam_chats: document.getElementById('print_spam_chats').checked
            },
            twitch: {
                client_id: document.getElementById('client_id').value,
                access_token: document.getElementById('access_token').value,
                enable_twitch_connection: document.getElementById('enable_twitch_connection').checked
            },
            database: {
                enable_database: document.getElementById('enable_database').checked,
                enable_in_disk_db: document.getElementById('enable_in_disk_db').checked,
                enable_in_memory_db: document.getElementById('enable_in_memory_db').checked,
                indisk_db_name: document.getElementById('indisk_db_name').value
            },
            data_control: {
                storage_messages_enabled: document.getElementById('storage_messages_enabled').checked,
                max_stored_messages: parseInt(document.getElementById('max_stored_messages').value) || 200,
                message_cleanup_interval_ms: parseInt(document.getElementById('message_cleanup_interval_ms').value) || 5000
            },
            data_analysis: {
                enable_data_analysis: document.getElementById('enable_data_analysis').checked,
                data_analysis_interval_ms: parseInt(document.getElementById('data_analysis_interval_ms').value) || 6000
            },
            use_websocket: document.getElementById('use_websocket').checked,
            websocket_port: parseInt(document.getElementById('websocket_port').value) || 8080,
            express_port: parseInt(document.getElementById('express_port').value) || 3030
        };
    }

    // Save configuration to server
    async function saveConfig(event) {
        event.preventDefault();
        
        const config = getFormData();
        
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao salvar configurações');
            }

            showAlert('✅ Configurações salvas com sucesso! Reinicie a aplicação para aplicar as mudanças.');
        } catch (error) {
            showAlert('❌ Erro ao salvar: ' + error.message, true);
        }
    }

    // Event listeners
    form.addEventListener('submit', saveConfig);
    reloadBtn.addEventListener('click', loadConfig);
    typeAmbienceSelect.addEventListener('change', toggleSections);

    // Load config on page load
    loadConfig();
})();
