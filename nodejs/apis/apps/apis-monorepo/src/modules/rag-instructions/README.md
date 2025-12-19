# Módulo de Instruções RAG

Este módulo permite gerenciar instruções RAG (Retrieval-Augmented Generation) para construção da base de conhecimento do chatbot por unidade (unitId).

## Funcionalidades

- ✅ Criar instruções a partir de texto direto
- ✅ Criar instruções a partir de URLs (web scraping)
- ✅ Criar instruções a partir de PDFs (upload)
- ✅ Gerenciar instruções por unitId do usuário autenticado
- ✅ Indexação automática no sistema RAG
- ✅ Reindexação de instruções existentes

## Endpoints

### 1. Criar Instrução a partir de Texto

```http
POST /rag-instructions/from-text
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "Você é um assistente virtual especializado em produtos infantis...",
  "title": "Instruções de Atendimento",
  "indexInRAG": true,
  "active": true
}
```

### 2. Criar Instrução a partir de URL

```http
POST /rag-instructions/from-url
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://example.com/manual-produtos.pdf",
  "title": "Manual de Produtos",
  "indexInRAG": true,
  "active": true
}
```

### 3. Criar Instrução a partir de PDF

```http
POST /rag-instructions/from-pdf
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [arquivo PDF]
title: "Manual de Produtos"
indexInRAG: true
active: true
```

### 4. Listar Instruções

```http
GET /rag-instructions
Authorization: Bearer {token}
```

### 5. Buscar Instrução por ID

```http
GET /rag-instructions/by-id/:id
Authorization: Bearer {token}
```

### 6. Buscar Instrução por UnitId

```http
GET /rag-instructions/:unitId
Authorization: Bearer {token}
```

### 7. Atualizar Instrução

```http
PUT /rag-instructions/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "instructions": ["Nova instrução 1", "Nova instrução 2"],
  "active": true
}
```

### 8. Reindexar Instrução

```http
POST /rag-instructions/:id/reindex
Authorization: Bearer {token}
```

### 9. Deletar Instrução

```http
DELETE /rag-instructions/:id
Authorization: Bearer {token}
```

## Estrutura de Dados

### Schema RagInstruction

```typescript
{
  unitId: string;              // ID da unidade (extraído do token)
  instructions: string[];       // Array de instruções processadas
  sourceType: 'text' | 'url' | 'pdf';
  sourceUrl?: string;           // URL de origem (se sourceType = 'url')
  sourceFileName?: string;      // Nome do arquivo (se sourceType = 'pdf')
  sourceFileId?: string;        // ID do arquivo armazenado
  rawContent?: string;          // Conteúdo bruto extraído
  context?: object;            // Contexto adicional
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    tags?: string[];
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    indexedInRAG?: boolean;
    ragIndexedAt?: Date;
  };
  active: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Fluxo de Processamento

1. **Criação**: Instrução é criada com status `processing`
2. **Extração**: Conteúdo é extraído (texto, URL ou PDF)
3. **Processamento**: Texto é dividido em chunks e processado
4. **Indexação**: Chunks são indexados no sistema RAG (se `indexInRAG = true`)
5. **Finalização**: Status atualizado para `completed` ou `failed`

## Integração com Python RAG

O módulo se integra com o serviço Python RAG através do endpoint:

```
POST http://localhost:8000/api/rag/ingest-instruction
```

O serviço Python processa o conteúdo, gera embeddings e armazena no MongoDB para busca vetorial.

## Segurança

- Todas as rotas requerem autenticação JWT
- `unitId` é extraído automaticamente do token do usuário
- Validação de escopo garante que usuários só acessem suas próprias instruções
- Upload de PDF limitado a 10MB

## Dependências Necessárias

Para processamento de URLs e PDFs, instale:

```bash
pnpm add cheerio @types/cheerio
```

## Exemplo de Uso no Frontend

```typescript
// Criar instrução a partir de texto
const response = await fetch('/api/rag-instructions/from-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Conteúdo das instruções...',
    title: 'Título das Instruções',
    indexInRAG: true
  })
});

// Criar instrução a partir de URL
const response = await fetch('/api/rag-instructions/from-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    url: 'https://example.com/manual.pdf',
    indexInRAG: true
  })
});

// Criar instrução a partir de PDF
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', 'Manual de Produtos');
formData.append('indexInRAG', 'true');

const response = await fetch('/api/rag-instructions/from-pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Variáveis de Ambiente

```env
# URL do serviço Python RAG
PYTHON_RAG_API_URL=http://localhost:8000

# URL da API Node.js (para o serviço Python)
APIS_MONOREPO_URL=http://localhost:3000/api
```
