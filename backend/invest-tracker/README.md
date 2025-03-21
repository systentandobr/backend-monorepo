# Sistema Inteligente de Análise e Monitoramento de Investimentos

## Visão Geral
Sistema composto por microsserviços que capturam, analisam e monitoram dados financeiros de diferentes tipos de ativos (fundos imobiliários, ações e criptomoedas) para construir uma carteira de investimentos inteligente baseada em dados.

## Componentes Principais

1. **Serviço de Coleta de Dados (GoLang)**
2. **Serviço de Análise (Python)**
3. **Serviço de Simulação**
4. **Sistema de Notificações**
5. **Interface de Usuário**

## Arquitetura

O projeto segue os princípios de Clean Architecture e SOLID:

- **Domain Layer**: Entidades e regras de negócio
- **Application Layer**: Casos de uso da aplicação
- **Ports Layer**: Interfaces para comunicação entre camadas
- **Adapter Layer**: Implementações concretas dos ports

## Microsserviços

Cada componente principal é implementado como um microsserviço independente, facilitando:
- Escalabilidade horizontal
- Desenvolvimento em paralelo
- Implantação e manutenção simplificadas

## Como executar

```bash
# Construir os containers
make build

# Executar localmente
make run

# Executar testes
make test
```

## Licença
Este projeto está licenciado sob a MIT License
