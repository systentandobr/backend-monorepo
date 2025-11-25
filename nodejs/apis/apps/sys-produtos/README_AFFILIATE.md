# 📦 Produtos Afiliados - API

API NestJS para gerenciamento de produtos afiliados com processamento automático via webscraping.

## 🎯 Endpoints

### POST `/affiliate-products`

Cria um novo produto afiliado e inicia processamento.

**Request:**
```json
{
  "categoryId": "cat-123",
  "affiliateUrl": "https://www.shopee.com.br/produto...",
  "platform": "shopee"
}
```

### GET `/affiliate-products`

Lista produtos afiliados com filtros.

**Query Params:**
- `status`: `pending` | `processing` | `completed` | `failed` | `retrying`
- `platform`: `shopee` | `amazon` | `magalu` | `mercadolivre` | `americanas` | `casasbahia` | `other`
- `categoryId`: string
- `page`: number (default: 1)
- `limit`: number (default: 20)

### GET `/affiliate-products/metrics`

Retorna métricas de processamento.

**Response:**
```json
{
  "total": 100,
  "pending": 10,
  "processing": 5,
  "completed": 80,
  "failed": 3,
  "retrying": 2
}
```

### GET `/affiliate-products/:id`

Busca produto afiliado por ID.

### PATCH `/affiliate-products/:id`

Atualiza produto afiliado.

### DELETE `/affiliate-products/:id`

Remove produto afiliado.

### POST `/affiliate-products/:id/retry`

Reprocessa produto que falhou.

## 🔧 Configuração

Variáveis de ambiente:

```env
SCRAPER_API_URL=http://localhost:8002
MONGO_URI=mongodb://127.0.0.1:27017/sys_produtos
```

## 🔄 Fluxo de Processamento

1. **Criação**: Produto criado com status `pending`
2. **Processamento**: Status muda para `processing`, chama Python Scraper
3. **Scraping**: Python extrai dados do link
4. **Criação de Produto**: Node.js cria produto completo usando dados extraídos
5. **Conclusão**: Status atualizado para `completed` com `productId` vinculado

## 📊 Schema

```typescript
{
  categoryId: string;
  categoryName: string;
  affiliateUrl: string;
  platform: AffiliatePlatform;
  userId: string;
  unitId: string;
  processingStatus: ProcessingStatus;
  productId?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  scrapedData?: {
    name?: string;
    price?: number;
    images?: string[];
    description?: string;
    rating?: number;
    // ...
  };
  processedAt?: Date;
}
```

