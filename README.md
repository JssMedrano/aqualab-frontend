# AquaLab - Frontend

Plataforma educativa para gestão de aulas, quizzes, vídeos e artigos. Interface desenvolvida para estudantes e professores.

---

## 📋 Descrição do Projeto

AquaLab é uma aplicação web educativa que permite:
- **Professores**: Criar e gerenciar quizzes, visualizar desempenho dos alunos, organizar conteúdo por anos escolares da E.E. Barão de Ramalho
- **Estudantes**: Responder quizzes, assistir vídeos educativos, ler artigos, revisar histórico de resultados
- **Autenticação**: Sistema JWT para segurança de acesso

---

## 🛠️ Tecnologias e Bibliotecas

### Framework Principal
- **React** `18.x` - Biblioteca UI moderna com Hooks
- **Vite** `5.x` - Ferramenta de build rápida e otimizada
- **React Router** `6.x` - Roteamento declarativo e gerenciamento de rotas

### Gestão de Estado e Contexto
- **Context API** - Gerenciamento de contexto de autenticação e dados globais (`AuthContext.jsx`)

### Autenticação e Segurança
- **JWT (JSON Web Tokens)** - Autenticação via headers `Authorization: Bearer <token>`
- **localStorage** - Persistência de tokens no navegador

### Comunicação HTTP
- **Axios** (implícito no contexto) - Requisições HTTP para o backend

### Estilos
- **CSS Puro** - Folhas de estilo modulares por componente
- **CSS Flexbox/Grid** - Layouts responsivos
- **Variáveis CSS** - Temas e cores centralizadas

### Utilitários
- **JavaScript ES6+** - Async/await, destructuring, operadores spread

---

## 📦 Instalação e Configuração

### Requisitos Prévios
- Node.js `16.x` ou superior
- npm ou yarn

### Passos de Instalação

1. **Clonar repositório**
   ```bash
   git clone <repository-url>
   cd aqualab-frontend
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente** (se aplicável)
   ```bash
   # Criar arquivo .env se necessário para endpoint da API
   VITE_API_URL=http://localhost:5000
   ```

4. **Iniciar servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   - Abrirá em `http://localhost:5173` por padrão
   - Com flag `--host`: `npm run dev -- --host` (acessível na rede)

5. **Build para produção**
   ```bash
   npm run build
   ```

---

## 🚀 Uso da Aplicação

### Para Estudantes

1. **Login**: Acessar com credenciais de estudante
2. **Painel Principal**: Ver área de início com opções de conteúdo
3. **Quizzes**: Responder questionários atribuídos
4. **Vídeos**: Visualizar conteúdo multimídia educativo
5. **Artigos**: Ler material de apoio
6. **Resultados**: Revisar histórico e desempenho em quizzes

### Para Professores

1. **Login**: Acessar com credenciais de professor
2. **Painel de Controle**: Visualizar estatísticas de estudantes e quizzes
3. **Criar Quiz**: Projetar novos questionários
4. **Gerenciar Turmas**: Organizar estudantes por anos escolares
5. **Ver Quizzes**: Administrar quizzes criados
6. **Controle de Estudantes**: Visualizar desempenho individual com modal de resumo

---

## 📁 Estrutura de Pastas

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── LayoutAluno.jsx  # Layout base para visualizações de estudante
│   ├── PainelAluno.jsx  # Dashboard do estudante
│   ├── PainelProfessor.jsx # Dashboard do professor
│   ├── QuizzesAluno.jsx # Listagem de quizzes para estudante
│   ├── ResponderQuiz.jsx # Visualização para responder quiz
│   ├── ModalResumo.jsx  # Modal com resumo do estudante
│   └── ...
├── contexts/            # Context API
│   └── AuthContext.jsx  # Gerenciamento de autenticação e dados
├── assets/              # Recursos estáticos (imagens)
├── App.jsx              # Componente principal com rotas
├── main.jsx             # Ponto de entrada
├── index.css            # Estilos globais
└── vite.config.js       # Configuração do Vite
```

---

## 🔐 Autenticação

O sistema usa **JWT** com os seguintes fluxos:

1. **Login**: POST `/api/login` → retorna `token`
2. **Armazenamento de Token**: Token salvo em `localStorage` como `token`
3. **Headers**: Todas as requisições incluem:
   ```
   Authorization: Bearer <token>
   Content-Type: application/json
   ```
4. **Decodificação**: JWT decodificado no contexto para extrair `role`, `sub` (userId), etc.
5. **Proteção de Rotas**: `RotaProtegida.jsx` valida permissões

---

## 🎨 Temas e Estilos

- **Tema Claro** (Início do Estudante): Sidebar branco com botões azuis
- **Tema Escuro** (Outras visualizações): Sidebar azul degradado com botões brancos
- **Variáveis CSS**: Definidas em `index.css` (cores, espaçamento, transições)

---

## 🔗 Endpoints Principais da API

O frontend se comunica com o backend através de rotas como:
- `POST /auth/login` - Autenticação
- `GET /students` - Listar estudantes
- `GET /quizzes` - Obter quizzes do professor
- `POST /quizzes` - Criar quiz
- `GET /student/:id/results` - Resultados do estudante
- `POST /quiz/:id/respond` - Enviar resposta

---

## 📱 Design Responsivo

- Design mobile-first
- Sidebar recolhível em telas pequenas
- Tabelas adaptativas
- CSS Flexbox para layouts fluidos

---

## 🐛 Resolução de Problemas

| Problema | Solução |
|----------|----------|
| "npm run dev" falha | Executar `npm install` novamente |
| Estilos não são aplicados | Limpar cache: `npm run build && npm run dev` |
| Erro CORS | Verificar VITE_API_URL no .env |
| Token expirado | Fazer login novamente |

---

---

**Equipe de Desenvolvimento:** [Amanda Dias RU:4848296, Jesus Medrano RU:4930652 e Thiago Andrade RU:4917625]  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** [Centro Universitário Internacional - Uninter]

---
