# Life Tracker - Aplicativo de Monitoramento de Objetivos de Vida

![Life Tracker Logo](./public/logo.svg)

Uma aplicação web moderna e responsiva para monitoramento holístico de hábitos e objetivos de vida, construída com Next.js, TypeScript, Tailwind CSS, e gerenciamento de estado com Zustand.

## 📋 Visão Geral

Life Tracker é baseado na filosofia de Aristóteles de que "o todo é maior que a soma das partes". O aplicativo ajuda os usuários a monitorar e desenvolver hábitos em diferentes áreas da vida, visualizando como o progresso em uma área afeta positivamente as outras.

## 🚀 Tecnologias

- **Framework**: [Next.js 14](https://nextjs.org/) com App Router
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Formulários**: React Hook Form + Zod
- **Tema**: Tema escuro/claro com next-themes
- **Gráficos**: Recharts para visualização de dados
- **Data & Tempo**: date-fns para manipulação de datas
- **Ícones**: Componentes React do Heroicons/Lucide

## 🏗️ Estrutura do Projeto

```
src/
├── app/                # Páginas e layouts (Next.js App Router)
│   ├── (dashboard)/    # Rotas autenticadas/dashboard
│   ├── (auth)/         # Rotas de autenticação 
│   └── ...             # Outras rotas
├── components/         # Componentes React reutilizáveis
│   ├── habit/          # Componentes relacionados a hábitos
│   ├── category/       # Componentes de categorias
│   ├── ui/             # Componentes de UI genéricos
│   └── ...             # Outros componentes agrupados por funcionalidade
├── hooks/              # Hooks React personalizados
├── providers/          # Providers de contexto React
├── store/              # Stores Zustand para gerenciamento de estado
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
└── assets/             # Assets estáticos e temas
```

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/life-tracker.git
   cd life-tracker
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) em seu navegador.

## 📱 Recursos Principais

- **Sistema de Hábitos**: Crie, monitore e desenvolva hábitos diários
- **Categorias Personalizáveis**: Organize hábitos em diferentes áreas da vida
- **Sequências (Streaks)**: Acompanhe sequências consecutivas para motivação
- **Estatísticas Detalhadas**: Visualize seu progresso com gráficos e métricas
- **Tema Escuro/Claro**: Interface adaptável às preferências do usuário
- **Design Responsivo**: Experiência otimizada para desktop e dispositivos móveis
- **Notificações**: Lembretes personalizáveis para seus hábitos

## 🧠 Filosofia de Design

O Life Tracker é construído sobre a premissa de que o desenvolvimento pessoal é um sistema integrado, onde progressos em uma área afetam positivamente as outras. O design visual reforça essa interconexão, utilizando:

- **Cores por categoria**: Codificação visual intuitiva
- **Elementos interativos**: Feedback visual imediato ao completar hábitos
- **Visualização holística**: Visão geral do progresso em todas as áreas
- **Gamificação sutil**: Recompensas e marcos para manter a motivação

## 🤝 Contribuindo

Contribuições são bem-vindas! Consulte o arquivo [CONTRIBUTING.md](./CONTRIBUTING.md) para mais informações.

## 📜 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).