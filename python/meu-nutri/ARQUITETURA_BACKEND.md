# Arquitetura Backend do Projeto Systentando

## Visão Geral da Arquitetura

O projeto Systentando utiliza uma arquitetura de monorepo separada entre backend e frontend, seguindo as melhores práticas de desenvolvimento de software com base nos princípios SOLID, Clean Code e Clean Architecture.

### Estrutura do Monorepo Backend

O monorepo de backend está organizado da seguinte forma:

```
backend-monorepo/
├── _prompts/         # Prompts utilizados para IA e documentação
├── docs/             # Documentação geral do backend
├── golang/           # Serviços implementados em Go
├── nodejs/           # Serviços implementados em Node.js
└── python/           # Serviços implementados em Python
    └── meu-nutri/    # Microsserviço de nutrição
```

## Princípios da Arquitetura

### 1. Microsserviços Políglotas

A arquitetura permite o uso de diferentes linguagens de programação (Python, Go, Node.js) para diferentes serviços, escolhendo a mais adequada para cada caso de uso:

- **Python**: Para serviços que dependem de processamento de linguagem natural, IA e ML
- **Go**: Para serviços que exigem alta performance e concorrência
- **Node.js**: Para serviços orientados a eventos e integrações com frontend

### 2. API Gateway

Utilizamos um API Gateway que:

- Centraliza a autenticação e autorização
- Gerencia o roteamento para os microsserviços
- Implementa cache e rate limiting
- Monitora o tráfego e coleta métricas

### 3. DevPack e Toolkits Reutilizáveis

Desenvolvemos componentes reutilizáveis em cada linguagem:

- **DevPack**: Conjunto de bibliotecas, configurações e ferramentas comuns
- **Toolkits**: Componentes específicos por domínio que podem ser reutilizados em diferentes projetos

## Arquitetura do Serviço Meu Nutri (Python)

O serviço Meu Nutri implementa:

1. **Arquitetura Limpa (Clean Architecture)**:
   - Separação em camadas: Entidades, Casos de Uso, Adaptadores e Frameworks
   - Inversão de dependência para facilitar testes e manutenção

2. **Padrão Model-Context-Protocol (MCP)**:
   - Persistência de contexto de IA em banco de dados PostgreSQL
   - Aprendizado contínuo baseado em interações do usuário
   - Interoperabilidade entre diferentes modelos de IA

3. **Agente Híbrido**:
   - Combinação de orquestração LangChain com persistência MCP
   - Ferramentas especializadas para recomendações nutricionais e circadianas
   - Motor circadiano para personalização baseada no ritmo biológico do usuário

### Estrutura de Diretórios do Meu Nutri

```
meu-nutri/
├── app/
│   ├── agent/            # Implementação do agente híbrido
│   │   ├── tools/        # Ferramentas especializadas para o agente
│   │   └── hybrid_agent.py
│   ├── api/              # Endpoints REST da aplicação
│   ├── circadian/        # Motor de recomendação circadiana
│   ├── db/               # Camada de acesso ao banco de dados
│   ├── models/           # Modelos de domínio
│   ├── services/         # Serviços de domínio 
│   └── vision/           # Análise de imagens para feedback nutricional
├── tests/                # Testes automatizados
├── Makefile              # Comandos para build, teste e execução
└── requirements.txt      # Dependências do projeto
```

## Padrões de Desenvolvimento

1. **Domain-Driven Design (DDD)**:
   - Modelagem baseada no domínio do problema
   - Linguagem ubíqua compartilhada entre desenvolvedores e especialistas
   - Contextos delimitados para separar diferentes áreas do sistema

2. **Test-Driven Development (TDD)**:
   - Escrita de testes antes da implementação
   - Cobertura mínima de testes para funcionalidades críticas
   - Testes automatizados como parte do pipeline CI/CD

3. **SOLID**:
   - **S**ingle Responsibility: Cada classe tem uma única responsabilidade
   - **O**pen/Closed: Entidades abertas para extensão, fechadas para modificação
   - **L**iskov Substitution: Subtipos devem ser substituíveis por seus tipos base
   - **I**nterface Segregation: Interfaces específicas são melhores que uma interface geral
   - **D**ependency Inversion: Dependências de abstrações, não de implementações

## Escalabilidade e Deployment

1. **Containerização com Docker**:
   - Cada serviço possui seu próprio Dockerfile
   - Docker Compose para desenvolvimento local
   - Kubernetes para orquestração em produção

2. **CI/CD Pipeline**:
   - Testes automatizados em cada commit
   - Build e deploy automatizados
   - Monitoramento contínuo

3. **Estratégia de Banco de Dados**:
   - Banco de dados dedicado por serviço (Padrão Database-per-Service)
   - Migrações versionadas
   - Backup e recuperação automatizados

## Segurança

1. **Autenticação e Autorização**:
   - JWT para autenticação entre serviços
   - OAuth2 para autenticação de usuários
   - RBAC (Role-Based Access Control)

2. **Proteção de Dados**:
   - Criptografia em trânsito (TLS)
   - Criptografia em repouso para dados sensíveis
   - Sanitização de entradas e validação de dados

3. **Auditoria**:
   - Logging centralizado
   - Trilha de auditoria para operações críticas
   - Monitoramento de atividades suspeitas

## Monitoramento

1. **Logging**:
   - Formato padronizado de logs
   - Níveis de severidade consistentes
   - Agregação centralizada

2. **Métricas**:
   - Tempo de resposta
   - Taxa de erros
   - Utilização de recursos

3. **Alertas**:
   - Baseados em thresholds de performance
   - Notificações para incidentes
   - Escalação automática

## Recomendações para Evolução da Arquitetura

1. **Implementação de Event Sourcing**:
   - Armazenamento de todas as mudanças de estado como eventos
   - Reconstrução do estado a partir do histórico de eventos
   - Melhor auditoria e capacidade de replay

2. **CQRS (Command Query Responsibility Segregation)**:
   - Separação de modelos de leitura e escrita
   - Otimização para diferentes tipos de operações
   - Escalabilidade independente para leitura e escrita

3. **Cache Distribuído**:
   - Redis para armazenamento de dados em memória
   - Estratégias de invalidação de cache
   - Cache de resultados de consultas frequentes

4. **API Gateway Avançado**:
   - Versionamento de API
   - Throttling por cliente
   - Transformação de dados

5. **Observabilidade Aprimorada**:
   - Tracing distribuído com OpenTelemetry
   - Visualização de dependências entre serviços
   - Análise de causa raiz automatizada

## Lições Aprendidas da Correção do CircadianTool

A correção recente do problema com a classe `CircadianTool` reforça algumas práticas importantes:

1. **Compreensão dos frameworks utilizados**:
   - O erro ocorreu devido às particularidades do Pydantic e LangChain
   - É importante entender como os frameworks tratam a definição de atributos

2. **Documentação clara de requisitos**:
   - A necessidade de declarar campos explicitamente deve estar documentada
   - Exemplos de implementação correta ajudam a evitar erros semelhantes

3. **Testes unitários isolados**:
   - Implementar testes unitários para cada componente antes da integração
   - Testar especificamente a inicialização dos objetos e suas dependências

4. **Extensão consciente de bibliotecas de terceiros**:
   - Ao estender classes de bibliotecas externas, é preciso entender seu comportamento interno
   - Considerar criar adaptadores ou wrappers para isolar peculiaridades das bibliotecas
