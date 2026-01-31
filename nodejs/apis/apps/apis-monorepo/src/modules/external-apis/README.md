# Módulo External APIs

Este módulo fornece endpoints proxy para APIs externas (Google Maps e Groq), protegendo as chaves de API no backend.

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no backend:

```bash
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Groq API Key
GROQ_API_KEY=your_groq_api_key_here
```

## Endpoints Disponíveis

### Google Maps

- `GET /api/external-apis/google-maps/script-url` - Retorna URL do script do Google Maps com API key protegida
- `POST /api/external-apis/google-maps/geocode` - Geocodifica um endereço
- `POST /api/external-apis/google-maps/places-autocomplete` - Autocomplete de lugares

### Groq API

- `POST /api/external-apis/groq/chat/completions` - Chat completion genérico
- `POST /api/external-apis/groq/product-description` - Gera descrição de produto
- `POST /api/external-apis/groq/short-description` - Gera descrição curta
- `POST /api/external-apis/groq/suggest-tags` - Sugere tags para produto
- `POST /api/external-apis/groq/suggest-features` - Sugere features para produto
- `POST /api/external-apis/groq/suggest-product-name` - Sugere nome de produto
- `POST /api/external-apis/groq/dish-description` - Gera descrição de prato
- `POST /api/external-apis/groq/exercise-suggestions` - Sugere exercícios para plano de treino
- `POST /api/external-apis/groq/solar-project-insights` - Gera insights de projeto solar

## Segurança

- Todas as API keys são armazenadas apenas no backend
- O frontend nunca tem acesso direto às chaves de API
- Rate limiting implementado no backend para proteger as APIs externas
- Validação de entrada em todos os endpoints

## Migração do Frontend

O frontend foi migrado para usar estes endpoints ao invés de chamar as APIs diretamente:

- `useGoogleMaps` hook agora chama `/api/external-apis/google-maps/script-url`
- `groqService` agora chama os endpoints proxy do backend

## Notas Importantes

- As variáveis de ambiente `VITE_GOOGLE_MAPS_API_KEY` e `VITE_GROQ_API_KEY` não são mais necessárias no frontend
- O frontend deve ter acesso ao backend através de `VITE_API_BASE_URL` ou `VITE_BACKEND_BASE_URL`
