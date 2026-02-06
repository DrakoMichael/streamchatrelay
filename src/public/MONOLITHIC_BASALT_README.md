# Monolithic Basalt Design System

Sistema de design minimalista dark com tipografia moderna para interfaces web.

## 📦 Instalação

Copie os seguintes arquivos para o diretório da sua aplicação:

- `monolithic-basalt.css` - Estilos do design system
- `monolithic-basalt.js` - Funcionalidades e animações

## 🚀 Uso Básico

### 1. Importar os arquivos no HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Minha Página</title>
    
    <!-- CSS do Design System -->
    <link rel="stylesheet" href="monolithic-basalt.css">
</head>
<body>
    <!-- Seu conteúdo aqui -->
    
    <!-- JavaScript do Design System -->
    <script src="monolithic-basalt.js"></script>
    
    <!-- Seu JavaScript customizado -->
    <script src="seu-script.js"></script>
</body>
</html>
```

### 2. Estrutura Básica da Página

```html
<div class="viewport">
    <!-- Header -->
    <header>
        <span class="system-id">Nome do Sistema // ID</span>
        <h1>Título da Página</h1>
        <p class="subtitle">Descrição breve</p>
    </header>

    <!-- Alert (opcional) -->
    <div id="alert" class="alert"></div>

    <!-- Conteúdo -->
    <section class="section">
        <h2 class="section-title">Seção</h2>
        <div class="config-group">
            <!-- Rows aqui -->
        </div>
    </section>

    <!-- Spacer para botões fixos -->
    <div class="spacer"></div>
</div>

<!-- Botões fixos no bottom -->
<div class="btn-container">
    <button class="btn">Cancelar</button>
    <button class="btn btn-primary">Confirmar</button>
</div>
```

## 🎨 Componentes

### Row com Select

```html
<div class="row">
    <div class="row-meta">
        <span class="row-title">Título do Campo</span>
        <span class="row-desc">Descrição do campo</span>
    </div>
    <div class="row-control">
        <select id="meu_select">
            <option value="1">Opção 1</option>
            <option value="2">Opção 2</option>
        </select>
    </div>
</div>
```

### Row com Toggle Switch

```html
<div class="row">
    <div class="row-meta">
        <span class="row-title">Ativar Recurso</span>
        <span class="row-desc">Liga ou desliga a funcionalidade</span>
    </div>
    <div class="row-control">
        <label class="switch">
            <input type="checkbox" id="meu_toggle">
            <span class="slider"></span>
        </label>
    </div>
</div>
```

### Row com Input de Texto

```html
<div class="row">
    <div class="row-meta">
        <span class="row-title">Nome</span>
        <span class="row-desc">Digite seu nome completo</span>
    </div>
    <div class="row-control">
        <input type="text" id="nome" placeholder="João Silva">
    </div>
</div>
```

### Grid Layout (2 Colunas)

```html
<div class="config-group">
    <div class="grid">
        <div class="row">
            <div class="row-meta">
                <span class="row-title">Porta HTTP</span>
                <span class="row-desc">Porta do servidor</span>
            </div>
            <div class="row-control">
                <input type="number" value="3000">
            </div>
        </div>
        
        <div class="row">
            <div class="row-meta">
                <span class="row-title">Porta HTTPS</span>
                <span class="row-desc">Porta segura</span>
            </div>
            <div class="row-control">
                <input type="number" value="443">
            </div>
        </div>
    </div>
</div>
```

### Status Dot

```html
<div class="row-meta">
    <span class="row-title">Servidor</span>
    <span class="row-desc">
        <span class="status-dot"></span> <!-- Verde (ativo) -->
        Conectado a <code>wss://example.com</code>
    </span>
</div>
```

**Variações:**
- `<span class="status-dot"></span>` - Verde (ativo)
- `<span class="status-dot inactive"></span>` - Cinza (inativo)
- `<span class="status-dot error"></span>` - Vermelho (erro)
- `<span class="status-dot warning"></span>` - Laranja (atenção)

## 🛠️ JavaScript API

### Inicialização Automática

O design system se auto-inicializa quando o DOM está pronto. Todas as funcionalidades estão disponíveis via objeto global `MonolithicBasalt`.

### Alertas

```javascript
// Sucesso (verde)
MonolithicBasalt.showAlert('Salvo com sucesso!', 'success', 3000);

// Erro (vermelho)
MonolithicBasalt.showAlert('Erro ao processar', 'error', 5000);

// Aviso (laranja)
MonolithicBasalt.showAlert('Atenção necessária', 'warning', 4000);

// Esconder alerta
MonolithicBasalt.hideAlert();
```

### Validação de Formulário

```javascript
const form = document.getElementById('meuForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!MonolithicBasalt.validateForm(form)) {
        return; // Campos obrigatórios não preenchidos
    }
    
    // Processar formulário...
});
```

### Loading em Botões

```javascript
const btn = document.querySelector('.btn-primary');

MonolithicBasalt.setButtonLoading(btn, true);  // Ativa loading
// ... processar ...
MonolithicBasalt.setButtonLoading(btn, false); // Desativa
```

### Criar Row Dinamicamente

```javascript
const newRow = MonolithicBasalt.createRow({
    title: 'Nova Configuração',
    description: 'Criada programaticamente',
    control: '<input type="text" placeholder="Digite...">'
});

document.querySelector('.config-group').appendChild(newRow);
```

### Copiar para Clipboard

```javascript
MonolithicBasalt.copyToClipboard('Texto para copiar');
// Mostra alerta de confirmação automaticamente
```

### Debounce de Inputs

```javascript
const input = document.getElementById('search');

input.addEventListener('input', MonolithicBasalt.debounce((e) => {
    console.log('Pesquisando:', e.target.value);
    // Executa 300ms após última digitação
}, 300));
```

### Scroll Suave

```javascript
MonolithicBasalt.scrollToSection('minhaSecao');
```

## 🎨 Variáveis CSS

Você pode customizar as cores editando as variáveis CSS:

```css
:root {
    --bg-deep: #0a0a0a;        /* Fundo principal */
    --stone-600: #121212;       /* Cards/grupos */
    --stone-500: #1a1a1a;       /* Hover states */
    --stone-400: #262626;       /* Bordas */
    --stone-300: #404040;       /* Bordas secundárias */
    --accent: #ffffff;          /* Cor principal */
    --text-dim: #a3a3a3;        /* Texto secundário */
    --success: #22c55e;         /* Verde */
    --error: #ef4444;           /* Vermelho */
    --warning: #f59e0b;         /* Laranja */
}
```

## 📱 Responsividade

O design system é responsivo por padrão:

- **Desktop:** Grid de 2 colunas funcional
- **Mobile (< 768px):** Grid colapsa para 1 coluna
- **Inputs:** Ajustam largura automaticamente

## 🎯 Classes Utilitárias

```html
<!-- Tipografia -->
<span class="text-mono">Texto monoespaçado</span>
<span class="text-dim">Texto esmaecido</span>
<span class="text-accent">Texto destacado</span>
<span class="text-success">Texto verde</span>
<span class="text-error">Texto vermelho</span>
<span class="text-warning">Texto laranja</span>

<!-- Code -->
<code>código inline</code>

<!-- Espacamento -->
<div class="spacer"></div> <!-- 120px de altura -->
```

## 📋 Template Completo

Veja o arquivo `monolithic-basalt-template.html` para um exemplo completo e funcional.

## 🔧 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- JavaScript ES6+
- CSS Grid e Flexbox

## 📄 Licença

Livre para uso em projetos pessoais e comerciais.

---

**Desenvolvido para Stream Chat Relay**  
Versão 1.0.0 - Fevereiro 2026
