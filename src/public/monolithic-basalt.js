/**
 * Monolithic Basalt - JavaScript Utilities
 * Animações e interatividade padrão do design system
 * Versão: 1.0.0
 */

const MonolithicBasalt = {
    /**
     * Inicializa todas as funcionalidades do design system
     * Chame esta função ao carregar a página
     */
    init() {
        this.initRowAnimations();
        this.initConfigGroupEffects();
        this.initAlerts();
    },

    /**
     * Animação de entrada escalonada para rows
     */
    initRowAnimations() {
        const rows = document.querySelectorAll('.row');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                row.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 100 + (index * 30));
        });
    },

    /**
     * Efeito sutil de hover nos config-groups
     */
    initConfigGroupEffects() {
        document.querySelectorAll('.config-group').forEach(group => {
            group.addEventListener('mousemove', e => {
                const rect = group.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                group.style.setProperty('--mouse-x', `${x}px`);
                group.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    },

    /**
     * Sistema de alertas
     */
    initAlerts() {
        // Listeners para alertas serão adicionados pela aplicação
    },

    /**
     * Mostra um alerta na página
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo do alerta: 'success', 'error', 'warning'
     * @param {number} duration - Duração em ms (0 = não desaparece automaticamente)
     */
    showAlert(message, type = 'success', duration = 5000) {
        const alert = document.getElementById('alert');
        if (!alert) return;

        // Remove classes antigas
        alert.className = 'alert';
        
        // Adiciona nova classe
        alert.classList.add(`alert-${type}`);
        alert.textContent = message;
        alert.style.display = 'block';

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideAlert();
            }, duration);
        }
    },

    /**
     * Esconde o alerta atual
     */
    hideAlert() {
        const alert = document.getElementById('alert');
        if (alert) {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.style.display = 'none';
                alert.style.opacity = '1';
            }, 300);
        }
    },

    /**
     * Cria um status dot dinamicamente
     * @param {string} state - Estado: 'active', 'inactive', 'error', 'warning'
     * @returns {HTMLElement}
     */
    createStatusDot(state = 'active') {
        const dot = document.createElement('span');
        dot.className = 'status-dot';
        if (state !== 'active') {
            dot.classList.add(state);
        }
        return dot;
    },

    /**
     * Anima a mudança de um toggle switch
     * @param {HTMLInputElement} checkbox
     * @param {Function} callback - Função executada após animação
     */
    animateToggle(checkbox, callback) {
        const slider = checkbox.nextElementSibling;
        if (slider && slider.classList.contains('slider')) {
            slider.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            if (callback) {
                setTimeout(callback, 400);
            }
        }
    },

    /**
     * Valida um formulário e mostra erros
     * @param {HTMLFormElement} form
     * @returns {boolean}
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--error)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--stone-300)';
            }
        });

        if (!isValid) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios', 'error', 4000);
        }

        return isValid;
    },

    /**
     * Adiciona animação de loading em um botão
     * @param {HTMLButtonElement} button
     * @param {boolean} loading
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Processando...';
            button.disabled = true;
        } else {
            button.textContent = button.dataset.originalText || button.textContent;
            button.disabled = false;
        }
    },

    /**
     * Smooth scroll para uma seção
     * @param {string} sectionId
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    },

    /**
     * Copia texto para clipboard com feedback
     * @param {string} text
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showAlert('Copiado para área de transferência', 'success', 2000);
        } catch (err) {
            this.showAlert('Erro ao copiar', 'error', 2000);
        }
    },

    /**
     * Formata um valor numérico para display
     * @param {number} value
     * @param {string} unit
     * @returns {string}
     */
    formatValue(value, unit = '') {
        return `${value.toLocaleString('pt-BR')}${unit ? ' ' + unit : ''}`;
    },

    /**
     * Debounce para inputs
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Cria um elemento de row programaticamente
     * @param {Object} options
     * @returns {HTMLElement}
     */
    createRow({ title, description, control }) {
        const row = document.createElement('div');
        row.className = 'row';

        const meta = document.createElement('div');
        meta.className = 'row-meta';
        meta.innerHTML = `
            <span class="row-title">${title}</span>
            <span class="row-desc">${description}</span>
        `;

        const controlDiv = document.createElement('div');
        controlDiv.className = 'row-control';
        
        if (typeof control === 'string') {
            controlDiv.innerHTML = control;
        } else {
            controlDiv.appendChild(control);
        }

        row.appendChild(meta);
        row.appendChild(controlDiv);

        return row;
    }
};

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MonolithicBasalt.init());
} else {
    MonolithicBasalt.init();
}

// Exporta para uso global
window.MonolithicBasalt = MonolithicBasalt;
