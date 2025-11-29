# Formulário de Criação de Franquias - Documentação

## Visão Geral

Este documento descreve a implementação do formulário de criação de franquias no frontend, seguindo o padrão React Hook Form + Zod para validação e integração com a API do backend.

## Arquivos Criados

### 1. Schemas de Validação
- **`src/schemas/franchise.schema.ts`**
  - Schema Zod para validação do formulário
  - Inclui validações para LocationDto e TerritoryDto
  - Tipos TypeScript inferidos do schema

### 2. Tipos TypeScript
- **`src/types/franchise.types.ts`**
  - Tipos TypeScript para o módulo de franquias
  - Interfaces para CreateFranchiseDto, FranchiseResponse, etc.

### 3. Serviço de API
- **`src/services/api/franchises.service.ts`**
  - Funções para interagir com a API de franquias
  - Interceptors para autenticação e tratamento de erros
  - Métodos: createFranchise, getFranchises, getFranchiseById, updateFranchise, deleteFranchise

### 4. Componentes
- **`src/components/franchises/CreateFranchiseForm.tsx`**
  - Componente principal do formulário
  - Usa React Hook Form com zodResolver
  - Organizado em seções: Informações Básicas, Proprietário, Localização, Território

- **`src/components/franchises/BrazilianStatesSelect.tsx`**
  - Componente reutilizável para seleção de estados brasileiros

- **`src/components/franchises/CoordinatesInput.tsx`**
  - Componente para entrada de coordenadas geográficas

- **`src/components/franchises/index.ts`**
  - Barrel export para facilitar imports

### 5. Utilitários
- **`src/utils/formatters.ts`**
  - Funções de formatação (CEP, telefone)
  - Funções de validação (coordenadas, CEP, telefone)

### 6. Exemplo de Integração
- **`src/pages/Admin/Franchisees/FranchisesManagement.example.tsx`**
  - Exemplo completo de como integrar o formulário na página
  - Inclui modal, lista de franquias e handlers

## Como Usar

### 1. Instalação de Dependências

Certifique-se de ter as seguintes dependências instaladas:

```bash
npm install react-hook-form @hookform/resolvers zod axios
# ou
yarn add react-hook-form @hookform/resolvers zod axios
```

### 2. Configuração da API

Configure a variável de ambiente `NEXT_PUBLIC_API_URL` no seu `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:9090
```

### 3. Autenticação

O serviço de API espera que o token JWT esteja armazenado em:
- `localStorage.getItem('auth_token')` ou
- `sessionStorage.getItem('auth_token')`

Ajuste o interceptor em `franchises.service.ts` conforme sua implementação de autenticação.

### 4. Uso Básico do Formulário

```tsx
import { CreateFranchiseForm } from '@/components/franchises/CreateFranchiseForm';
import { FranchiseResponse } from '@/types/franchise.types';

function MyPage() {
  const handleSuccess = (franchise: FranchiseResponse) => {
    console.log('Franquia criada:', franchise);
    // Recarregar lista, fechar modal, etc.
  };

  return (
    <CreateFranchiseForm
      onSuccess={handleSuccess}
      onCancel={() => console.log('Cancelado')}
    />
  );
}
```

### 5. Integração com Modal/Drawer

Veja o exemplo completo em `FranchisesManagement.example.tsx` para integração com modal.

## Estrutura do Formulário

O formulário está organizado em seções:

1. **Informações Básicas**
   - Unit ID (obrigatório)
   - Nome da Franquia (obrigatório)
   - Status (opcional, padrão: pending)
   - Tipo (opcional, padrão: standard)

2. **Informações do Proprietário**
   - ID do Proprietário (obrigatório)
   - Nome do Proprietário (obrigatório)
   - Email (obrigatório, validado)
   - Telefone (opcional, formatado)

3. **Localização**
   - Endereço (obrigatório)
   - Cidade (obrigatório)
   - Estado (obrigatório, select)
   - CEP (obrigatório, formatado)
   - Tipo de Localização (physical/digital)
   - Latitude e Longitude (obrigatórios se tipo = physical)

4. **Território** (opcional)
   - Cidade
   - Estado
   - Raio (km)
   - Território Exclusivo (checkbox)

## Validações

Todas as validações são feitas usando Zod:

- **Email**: Formato de email válido
- **CEP**: Formato brasileiro (00000-000)
- **Telefone**: Formato brasileiro com máscara
- **Coordenadas**: Latitude (-90 a 90) e Longitude (-180 a 180)
- **Estados**: Lista de estados brasileiros válidos
- **Campos obrigatórios**: Validados conforme o DTO do backend

## Tratamento de Erros

O serviço de API inclui tratamento de erros:

- **401 Unauthorized**: Remove token e pode redirecionar para login
- **Erros de rede**: Mensagem amigável
- **Erros da API**: Mensagem retornada pelo backend

## Próximos Passos

1. **Integração com API de CEP**: Buscar automaticamente cidade/estado a partir do CEP
2. **Integração com Mapas**: Selecionar coordenadas visualmente
3. **Preview**: Mostrar preview dos dados antes de submeter
4. **Edição**: Criar formulário de edição usando UpdateFranchiseDto
5. **Upload de Imagens**: Adicionar campo para logo/fotos da franquia

## Notas Importantes

- O endpoint `/franchises` requer autenticação JWT
- Apenas usuários com role de admin podem criar franquias (validação no backend)
- O `unitId` deve ser único (backend retornará erro se duplicado)
- Campos de localização são obrigatórios, mas coordenadas só são obrigatórias para localizações físicas

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do React Hook Form: https://react-hook-form.com
- Documentação do Zod: https://zod.dev
- Documentação da API: Ver endpoints em `/franchises` no backend

