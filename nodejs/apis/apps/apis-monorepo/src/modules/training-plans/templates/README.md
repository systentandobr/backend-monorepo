# Templates de Planos de Treino ABC

Este diretório contém os templates de planos de treino ABC para iniciantes.

## Importação dos Templates

Os templates são armazenados no MongoDB. Para importar os templates do arquivo JSON para o banco de dados, execute:

```bash
# A partir da raiz do projeto (backend-monorepo/nodejs/apis)
npx ts-node -r tsconfig-paths/register apps/apis-monorepo/src/modules/training-plans/scripts/import-templates.ts
```

Ou se estiver dentro do diretório `apps/apis-monorepo`:

```bash
npx ts-node -r tsconfig-paths/register src/modules/training-plans/scripts/import-templates.ts
```

### Variáveis de Ambiente

O script usa as seguintes variáveis de ambiente (ou valores padrão):

- `MONGODB_URI` ou `DATABASE_URL`: URI de conexão do MongoDB (padrão: `mongodb://localhost:27017/viralkids`)
- `DEFAULT_UNIT_ID`: ID da unidade para os templates (padrão: `TEMPLATE_GLOBAL`)

### O que o script faz:

1. Conecta ao MongoDB
2. Carrega o arquivo `abc-beginner-templates.json`
3. Para cada template:
   - Verifica se já existe um template com o mesmo nome e gênero
   - Se existir, atualiza o template existente
   - Se não existir, cria um novo template
4. Exibe um resumo da importação

### Estrutura dos Templates

Cada template contém:
- `name`: Nome do template
- `description`: Descrição do plano
- `targetGender`: Gênero alvo ('male', 'female', 'other')
- `objectives`: Array de objetivos
- `weeklySchedule`: Cronograma semanal com exercícios por dia

## Uso Automático

Quando um novo estudante é criado, o sistema automaticamente:
1. Busca um template baseado no gênero do estudante
2. Cria um plano de treino usando o template
3. Associa o plano ao estudante recém-criado

## Manutenção

Para atualizar os templates:
1. Edite o arquivo `abc-beginner-templates.json`
2. Execute o script de importação novamente
3. Os templates existentes serão atualizados
