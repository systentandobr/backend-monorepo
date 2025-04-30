# Meu Nutri - Agente Inteligente com IA

![Versão](https://img.shields.io/badge/versão-0.1.0-blue)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Um agente inteligente em Python que utiliza visão computacional e procesamento de linguagem natural para fornecer orientação nutricional personalizada baseada no ritmo circadiano, com integração com Alexa.

## Visão Geral

O Meu Nutri é um sistema que combina tecnologias de ponta para criar um assistente nutricional personalizado:

1. **Agente Híbrido MCP+LangChain**: Combina as vantagens da orquestração de ferramentas do LangChain com a persistência otimizada do Model Context Protocol.

2. **Visão Computacional**: Analisa imagens corporais para avaliar aspectos físicos e posturais.

3. **Engine Circadiano**: Fornece recomendações adaptadas ao ritmo biológico individual.

4. **Integração com Alexa**: Permite interação por voz através de dispositivos Alexa.

## Início Rápido

O projeto utiliza um Makefile para facilitar a configuração e execução. Certifique-se de ter instalado:
- Python 3.9+
- Docker e Docker Compose
- Make

### Como usar o arquivo .env.example

Copie o arquivo para criar seu próprio arquivo .env:
```bash
cp .env.example .env
```

### Configuração Inicial

```bash
# Configura todo o ambiente (PostgreSQL no Docker, ambiente virtual, dependências)
make setup
```

### Executar a API

```bash
# Inicia a API na porta 8000
make api
```

### Executar Testes

```bash
# Executa interativamente (escolha qual teste executar)
make test

# Ou execute um teste específico diretamente
make test-agent    # Testa o agente híbrido
make test-vision   # Testa o módulo de visão
make test-circadian # Testa o engine circadiano
make test-alexa    # Testa a integração Alexa
```

### Outros Comandos Úteis

```bash
# Ver todos os comandos disponíveis
make help

# Limpar todo o ambiente (remove containers, volumes e ambiente virtual)
make clean
```

## Arquitetura

O sistema implementa uma arquitetura modular com componentes independentes que podem ser escalonados separadamente:

```
+----------------+     +---------------------+     +----------------+
| Interface (API) | --> | Agente Híbrido MCP | --> | Ferramentas    |
+----------------+     +---------------------+     +----------------+
       |                        |                   |        |
       v                        v                   v        v
+----------------+     +---------------------+   +------+ +------+
| Integração Alexa| --> | PostgreSQL Context | -->|Visão | |Circ. |
+----------------+     +---------------------+   +------+ +------+
```

Para uma descrição detalhada da arquitetura, consulte [ARQUITETURA.md](./ARQUITETURA.md).

## Testando e Validando

O sistema inclui testes abrangentes para cada componente. Para orientações detalhadas sobre como testar e validar o sistema, consulte [COMO_TESTAR.md](./COMO_TESTAR.md).

Para testar a integração com Alexa, consulte [INTEGRACAO_ALEXA.md](./INTEGRACAO_ALEXA.md).

## Estrutura do Projeto

```
meu-nutri/
├── app/                    # Aplicação principal
│   ├── agent/              # Agente conversacional híbrido
│   ├── vision/             # Módulo de visão computacional
│   ├── circadian/          # Engine de recomendação circadiana
│   ├── alexa/              # Integração com Alexa
│   ├── api/                # Endpoints da API REST
│   ├── db/                 # Acesso ao banco de dados
│   └── utils/              # Utilidades diversas
├── tests/                  # Testes automatizados
├── docker-compose.yml      # Configuração Docker Compose
├── Makefile                # Comandos para gestão do projeto
├── requirements.txt        # Dependências Python
└── README.md               # Esta documentação
```

## Configuração do Ambiente

O sistema utiliza variáveis de ambiente para configuração, que podem ser definidas em um arquivo `.env`:

- `OPENAI_API_KEY`: Chave da API OpenAI para o agente LLM
- `ANTHROPIC_API_KEY`: Chave da API Anthropic (opcional)
- `POSTGRES_CONNECTION_STRING`: String de conexão para o PostgreSQL
- `VISUALIZATIONS_DIR`: Diretório para salvar visualizações
- `MEUNUTRI_API_ENDPOINT`: URL da API para integração Alexa

O Makefile criará automaticamente um arquivo `.env` modelo durante a configuração.

## Documentação Adicional

- [Arquitetura do Sistema](./ARQUITETURA.md)
- [Guia de Testes](./COMO_TESTAR.md)
- [Integração com Alexa](./INTEGRACAO_ALEXA.md)

## Requisitos

- Python 3.9 ou superior
- Docker e Docker Compose
- PostgreSQL 14
- Bibliotecas Python conforme `requirements.txt`

## Licença

MIT
