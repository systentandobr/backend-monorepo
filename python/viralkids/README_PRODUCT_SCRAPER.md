# 🕷️ Product Scraper API - ViralKids

API Python para webscraping de produtos afiliados usando estrutura Agno.

## 🚀 Instalação

```bash
cd python/viralkids
pip install -r requirements.txt
```

## 📋 Dependências

- `fastapi` - Framework web
- `aiohttp` - Cliente HTTP assíncrono
- `beautifulsoup4` - Parser HTML
- `agno` - Framework de agentes AI
- `groq` - Modelo de linguagem (via Agno)

## 🔧 Configuração

Crie um arquivo `.env`:

```env
SCRAPER_PORT=8002
AGNO_MODEL_ID=groq/llama-3.1-8b-instant
GROQ_API_KEY=sua-chave-groq-aqui
```

## 🏃 Executar

```bash
python api_product_scraper.py
```

Ou usando uvicorn:

```bash
uvicorn api_product_scraper:app --host 0.0.0.0 --port 8002
```

## 📡 Endpoints

### POST `/scrape`

Faz scraping síncrono de um produto.

**Request:**
```json
{
  "url": "https://www.shopee.com.br/produto...",
  "platform": "shopee",
  "category_id": "cat-123",
  "user_id": "user-456",
  "unit_id": "unit-789"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "shopee",
  "url": "https://www.shopee.com.br/produto...",
  "scraped_at": "2024-01-15T10:30:00",
  "data": {
    "name": "Nome do Produto",
    "price": 99.90,
    "originalPrice": 149.90,
    "images": ["url1", "url2"],
    "description": "Descrição do produto",
    "rating": 4.5,
    "specifications": {},
    "tags": ["tag1", "tag2"],
    "features": ["feature1"]
  }
}
```

### POST `/scrape/async`

Faz scraping assíncrono (em background).

## 🎯 Plataformas Suportadas

- ✅ Shopee
- ✅ Amazon
- ✅ Magalu
- ✅ Mercado Livre
- ✅ Americanas
- ✅ Casas Bahia
- ✅ Outros (scraping genérico)

## 🔄 Fluxo de Processamento

1. Frontend cadastra produto afiliado → Node.js API
2. Node.js cria registro com status `pending`
3. Node.js chama Python Scraper API
4. Python faz webscraping e retorna dados
5. Node.js cria produto completo na collection
6. Status atualizado para `completed`

## 🐛 Tratamento de Erros

- Retry automático (até 3 tentativas)
- Logs detalhados de erros
- Status tracking (`pending`, `processing`, `completed`, `failed`, `retrying`)

## 📝 Notas

- O scraper usa BeautifulSoup para parsing HTML
- Agno é usado para enriquecer e estruturar dados extraídos
- Suporta detecção automática de plataforma
- Timeout de 30 segundos por requisição

