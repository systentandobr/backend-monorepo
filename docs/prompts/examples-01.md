Iremos assumir o filesystem \\wsl$\\Ubuntu\\home\\marcelio\developing\systentando\viralkids; como o nosso codebase;

- Nele é possível encontrar e ler a pasta docs\ e entender sobre a estrutura, organização e o guia de desenvolvimento que adotamos e o que já está construído e implementado.
- A seguir Implemente todo código a ser desenvolvido no filesystem de forma gradual, prefira escrever arquivos menores e mais eficientes, considere usar uma Arquitetura limpa, casos de uso e adote os princípios do SOLID, e permanesça utilizando o mesmo padrão de arquitetura e organização de pastas e arquivos que adotamos.
- Para que seja possível utilizar o 'Zustand' + 'React Query' + axios de forma eficiente, vou precisar refatorar uma lista de arquivos que ainda utiliza o localStorage;
- Vamos assumir que o que já foi implementado precisa ser alterado toda a estrutura de armazenamento que hoje está setado no localStorage;
- abaixo lista de arquivos que precisa ser substituir o localStorage; >>
useAdminDashboard.ts
useAuth.ts
useChatbot.ts
helpers.ts
useGameification.ts
useFornecedores.ts
useMigration.ts
ProductCard.tsx
ProductDetailPage.tsx
httpCliente.ts
authService.ts
chatbotService.ts

- Faça uma conexão entre o arquivo substituído ao Service ou Hook mais adequado para o contexto da funcionalidade encontrada (pois já existem implementações que podem ser reutilizadas), dentro de services/ hooks/ ou stores/ providers/

- Implementação de nossas próximas features: Que estão documentadas no arquivo NEXT-STEPS.md >>
- Prefira utilizar o conhecimento e padrões utilizados no nosso docs/DEVELPMENT_GUIDE.md
- O refinamento da nossa arquitetura acontece a qualquer momento, criando um ambiente de desenvolvimento flexível e evolutivo.
- A análise do código implementado é essencial para otimizar o desempenho e a qualidade do sistema.
 


Documente claramente a separação de responsabilidades
-  A combinação Zustand + React Query é a mais equilibrada para o ViralKids, oferecendo performance, simplicidade e escalabilidade sem a complexidade desnecessária de três bibliotecas.
- Mantenha Zustand para estado de UI e lógica de negócio
- Adicione React Query para cache de dados do servidor
- Nesse modelo: a camada de services/ seria que hoje está utilizando o httpCliente com axios, seria inteligente passar a mesclar com o react-query para trabalhar em conjunto com o Zustand e axios da melhor forma possível e conseguir gerenciar o estado do servidor e do cliente;

// 🎯 Zustand: Estado que pertence ao cliente
- Carrinho de compras
- Filtros de produtos
- Preferências do usuário
- Estado de UI (sidebar, modals, etc.)
- Configurações de tema

// 🎯 React Query: Estado que vem do servidor
- Lista de produtos
- Dados do usuário
- Histórico de pedidos
- Informações de estoque
- Dados de analytics