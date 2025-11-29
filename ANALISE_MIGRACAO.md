# Análise Detalhada - Migração Catálogo de Produtos

## Mapeamento de Endpoints

### Projeto Antigo (`catalog-products`)

#### Produtos (`/products` e `/api/v1.0/products`)
- `GET /products` - Listar produtos (legacy)
- `GET /products/:id` - Obter produto por ID (legacy)
- `POST /products` - Criar produto (legacy)
- `PUT /products/:id` - Atualizar produto (legacy)
- `DELETE /products/:id` - Remover produto (legacy)
- `GET /products/search/:query` - Buscar produtos (legacy)
- `GET /products/category/:category` - Produtos por categoria (legacy)
- `GET /products/brand/:brand` - Produtos por marca (legacy)
- `GET /products/importing/:query` - Importar produtos (legacy)
- `GET /api/v1.0/products` - Listar produtos com filtros avançados
- `GET /api/v1.0/products/search` - Buscar produtos com filtros
- `GET /api/v1.0/products/:id` - Obter detalhes do produto
- `GET /api/v1.0/products/:id/related` - Obter produtos relacionados

#### Catálogos (`/catalogs`)
- `GET /catalogs` - Listar catálogos
- `POST /catalogs` - Salvar catálogo

#### Navegação (`/api/v1.0/navigation`)
- `POST /api/v1.0/navigation/track/product` - Rastrear visita de produto
- `GET /api/v1.0/navigation/visited-products` - Obter produtos visitados
- `POST /api/v1.0/navigation/search` - Salvar busca
- `GET /api/v1.0/navigation/history` - Obter histórico de navegação

#### Fornecedores (`/suppliers`)
- Controller vazio (sem endpoints implementados)

#### Pagamentos (`/payments`)
- Controller vazio (sem endpoints implementados)

### Novo Projeto (`sys-produtos`)

#### Produtos (`/produtos`)
- `GET /produtos` - Listar produtos (com filtros, multi-tenancy)
- `POST /produtos` - Criar produto
- `GET /produtos/:id` - Obter produto por ID
- `PATCH /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Deletar produto
- `POST /produtos/:id/variants` - Adicionar variante
- `PATCH /produtos/:id/variants/:sku` - Atualizar variante
- `DELETE /produtos/:id/variants/:sku` - Remover variante
- `PATCH /produtos/:id/variants/:sku/stock` - Ajustar estoque (absoluto)
- `PATCH /produtos/:id/variants/:sku/stock/inc` - Incrementar/decrementar estoque
- `PATCH /produtos/:id/metadata` - Atualizar metadados
- `POST /produtos/:id/images` - Adicionar imagem
- `DELETE /produtos/:id/images` - Remover imagem
- `POST /produtos/:id/categories` - Adicionar categoria
- `DELETE /produtos/:id/categories` - Remover categoria

#### Produtos Afiliados (`/affiliate-products`)
- `POST /affiliate-products` - Criar produto afiliado
- `GET /affiliate-products` - Listar produtos afiliados
- `GET /affiliate-products/metrics` - Obter métricas
- `GET /affiliate-products/:id` - Obter produto afiliado por ID
- `PATCH /affiliate-products/:id` - Atualizar produto afiliado
- `DELETE /affiliate-products/:id` - Excluir produto afiliado
- `POST /affiliate-products/:id/retry` - Reprocessar produto afiliado

#### Categorias (`/categories`)
- `POST /categories` - Criar categoria
- `GET /categories` - Listar categorias
- `GET /categories/:id` - Buscar categoria por ID
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Excluir categoria

## Comparação de Schemas/Entidades

### Product Schema - Projeto Antigo
```typescript
- url: string
- name: string
- description: string
- brand: string
- model?: string
- color?: string
- category: string
- price: Price (complexo)
- images: string[]
- thumbnail: string
- dimensions?: { weight, height, width, length }
- rating?: number
- reviewCount?: number
- stock: number
- tags: string[]
- specifications?: ProductSpecification
- materials?: string[]
- careInstructions?: string[]
- warranty?: string
- variations?: ProductVariation[]
- franchiseLocationID: string
- ncm?: string
- ean13?: string
- unitOfMeasurement: 'UN' | 'KG' | 'M' | 'L'
- supplierID: string
- affiliateUrl?: string
- recommendedAge?: string
- taxInformation: {
    cest?: string
    exempt: boolean
    isTaxed: boolean
    fullTaxes: boolean
    originState?: string
    certifications?: string[]
    icmsByState: { [state: string]: { origin: 'Internal' | 'External'; taxRate: number } }
    icmsSt?: { baseCalculation: number; taxRate: number; mva: number }
  }
```

### Product Schema - Novo Projeto
```typescript
- unitId?: string
- name: string
- slug: string
- description?: string
- images: string[]
- categories: string[]
- tags: string[]
- attributesTemplate?: Record<string, any>
- variants: ProductVariant[] (com stockByUnit por unidade)
- featured: boolean
- active: boolean
```

### Campos Ausentes no Novo Projeto (CRÍTICOS)
1. **brand** - Marca do produto
2. **model** - Modelo do produto
3. **color** - Cor do produto
4. **dimensions** - Dimensões (peso, altura, largura, comprimento)
5. **rating** - Avaliação do produto
6. **reviewCount** - Quantidade de avaliações
7. **materials** - Materiais do produto
8. **careInstructions** - Instruções de cuidado
9. **warranty** - Garantia
10. **ncm** - NCM (Nomenclatura Comum do Mercosul) - CRÍTICO
11. **ean13** - Código de barras EAN-13 - CRÍTICO
12. **unitOfMeasurement** - Unidade de medida - CRÍTICO
13. **supplierID** - ID do fornecedor
14. **recommendedAge** - Idade recomendada
15. **thumbnail** - Imagem thumbnail
16. **specifications** - Especificações do produto
17. **taxInformation** - Informações fiscais completas - CRÍTICO PARA BRASIL
18. **url** - URL do produto
19. **franchiseLocationID** - ID da franquia (pode usar unitId)

### Price Structure - Comparação

#### Projeto Antigo (Price)
```typescript
{
  originalPrice: number
  priceOfSale?: number
  costPrice: number
  discount?: number
  event?: DiscountEvent
  type?: DiscountType
  currency: 'BRL'
  comissionPerTransaction?: number
  taxes?: number
}
```

#### Novo Projeto (ProductVariant)
```typescript
{
  sku: string
  price: number
  promotionalPrice?: number
  attributes?: Record<string, any>
  active: boolean
  stockByUnit: Record<string, StockByUnit>
}
```

**Diferenças críticas:**
- Novo projeto não tem costPrice (preço de custo)
- Novo projeto não tem comissionPerTransaction
- Novo projeto não tem taxes (impostos)
- Novo projeto não tem event/type de desconto
- Novo projeto não tem currency (assume BRL)

## Regras de Negócio Identificadas

### Projeto Antigo

1. **Validação de Produtos** (ProductValidators):
   - Validação de nome (3-100 caracteres)
   - Validação de preço (costPrice > 0)
   - Validação de categoria (obrigatória)
   - Validação de estoque (>= 0)
   - Validação de rating (0-5)
   - Validação de desconto (0-100%)
   - Métodos: validate(), isAvailable(), getFinalPrice(), hasDiscount(), updateStock(), addVariation()

2. **Cálculo de Preço**:
   - Cálculo de comissão: `precoVenda * comissaoPorTransacao`
   - Cálculo de tributos: `precoVenda * impostos`
   - Preço final: `precoCusto - desconto + comissao + tributos`

3. **Validação de URLs de Afiliado**:
   - URLs permitidas: amazon.com, shopee.com, mercadolivre.com.br

4. **Busca de Produtos**:
   - Busca por nome, descrição ou marca
   - Filtros: categoria, marca, preço (min/max), rating, estoque
   - Ordenação: preço (asc/desc), rating, mais recente, mais popular

5. **Produtos Relacionados**:
   - Baseado na mesma categoria

6. **Navegação**:
   - Rastreamento de visitas de produtos
   - Histórico de buscas
   - Sessões de navegação
   - Score de engajamento baseado em interações

7. **Tributação**:
   - Estratégias: TributacaoICMS, TributacaoICMSCSt
   - Cálculo baseado em estado e informações fiscais do produto

### Novo Projeto

1. **Multi-tenancy**:
   - Todos os produtos são isolados por unitId
   - Estoque é gerenciado por unidade dentro das variantes

2. **Variantes**:
   - Produtos podem ter múltiplas variantes (SKU)
   - Cada variante tem preço e estoque por unidade

3. **Slug**:
   - Geração automática de slug a partir do nome

4. **Autenticação**:
   - JWT obrigatório para todas as operações
   - unitId extraído do token JWT

## Dependências Entre Módulos

### Projeto Antigo
- Produtos → Fornecedores (supplierID)
- Produtos → Franqueados (franchiseLocationID)
- Produtos → Tributos (taxInformation)
- Navegação → Produtos (productId)
- Catálogos → Produtos (productIds[])

### Novo Projeto
- Produtos → Categories (categories[])
- Produtos → AffiliateProducts (productId após processamento)
- Produtos → UnitId (multi-tenancy)

## Funcionalidades a Migrar

### Prioridade ALTA (Críticas)
1. ✅ taxInformation completo (ICMS, ICMS-ST, CEST)
2. ✅ Campos fiscais (NCM, EAN13, unitOfMeasurement)
3. ✅ ProductValidators
4. ✅ GetRelatedProductsUseCase
5. ✅ Módulo de Tributos
6. ✅ Módulo de Navegação
7. ✅ Módulo de Catálogos

### Prioridade MÉDIA
1. ✅ Campos de produto (brand, model, color, dimensions, rating, reviewCount, materials, careInstructions, warranty, recommendedAge, thumbnail, specifications)
2. ✅ Adaptar estrutura de Price
3. ✅ Adaptar estrutura de Variations/Variants

### Prioridade BAIXA
1. ⚠️ Avaliar Fornecedores (módulo vazio no antigo)
2. ⚠️ Verificar SysPagamentosModule (já existe)
3. ⚠️ Verificar FranchisesModule (já existe)

## Próximos Passos

1. Expandir Product schema com campos ausentes
2. Migrar taxInformation completo
3. Migrar ProductValidators
4. Migrar GetRelatedProductsUseCase
5. Criar módulo de Tributos
6. Criar módulo de Navegação
7. Criar módulo de Catálogos
8. Adaptar tudo para multi-tenancy


