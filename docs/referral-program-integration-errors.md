# Mapeamento de Erros - Integração do Referral Program

## 📋 Resumo Executivo

Este documento mapeia os erros e inconsistências encontrados na implementação do sistema de indicações (Member Get Member) comparando com a especificação técnica documentada em `/viralkids/docs/referral-program/technical-spec.md`.

---

## 🔴 Erros Críticos

### 1. Inconsistência de Nomenclatura de Campos

**Localização**: 
- `referral.schema.ts` (linha 11, 87-94, 100-107)
- `referral-campaign.schema.ts` (linha 11, 74-79, 85-90)
- `referrals.service.ts` (linhas 141-143, 148-152, 406, 415)
- `referral-campaigns.service.ts` (linhas 70, 79, 279, 291, 403, 410)

**Problema**: 
- Schemas MongoDB usam `rewardType` 
- DTOs de resposta usam `type`
- Código precisa fazer conversão manual: `(referral.referrerReward as any).rewardType || (referral.referrerReward as any).type`

**Impacto**: 
- Alto risco de bugs em produção
- Código frágil e difícil de manter
- Possível perda de dados em conversões

**Solução Recomendada**:
```typescript
// Padronizar para usar 'type' em todos os lugares
// Atualizar schemas MongoDB para usar 'type' ao invés de 'rewardType'
```

---

### 2. Processamento de Recompensas Não Disparado Automaticamente

**Localização**: 
- `referrals.service.ts` (linha 296)
- `orders.service.ts` (linhas 154-172)

**Problema**: 
- No método `completeReferral()`, há um TODO comentado: `// TODO: Disparar processamento de recompensas`
- O processamento só acontece em `orders.service.ts` quando o pedido é marcado como 'entregue'
- Se a indicação for completada por outro fluxo, as recompensas não são processadas

**Impacto**: 
- Recompensas podem não ser geradas
- Usuários não recebem recompensas devidas
- Perda de confiança no sistema

**Solução Recomendada**:
```typescript
// Em referrals.service.ts, após completar indicação:
await this.rewardsService.processReward({
  referralId: saved._id.toString(),
  userId: saved.refereeId.toString(),
});
```

---

### 3. Falta de Validação de Valor Mínimo de Compra

**Localização**: 
- `orders.service.ts` (linhas 154-172)
- `referrals.service.ts` (linha 263-299)

**Problema**: 
- A documentação especifica que campanhas podem ter `rules.minPurchaseValue`
- Nenhuma validação é feita antes de completar a indicação
- Indicações são completadas mesmo se o valor do pedido for menor que o mínimo

**Impacto**: 
- Violação de regras de negócio
- Recompensas pagas indevidamente
- Perda financeira

**Solução Recomendada**:
```typescript
// Em completeReferral(), validar antes de completar:
const campaign = await this.campaignsService.findOne(referral.campaignId.toString());
const order = await this.orderModel.findOne({ _id: orderId }).exec();

if (campaign.rules?.minPurchaseValue && order.total < campaign.rules.minPurchaseValue) {
  throw new BadRequestException(
    `Valor mínimo de compra não atingido. Mínimo: R$ ${campaign.rules.minPurchaseValue}`
  );
}
```

---

### 4. Status 'registered' Nunca é Atualizado

**Localização**: 
- `referrals.service.ts` - Não há método para atualizar status para 'registered'
- `referral.schema.ts` - Status 'registered' existe no enum mas nunca é usado

**Problema**: 
- Segundo a documentação, quando o referee se cadastra usando o código, o status deve mudar para 'registered'
- Atualmente, o status pula direto de 'pending' para 'completed'
- Perde-se rastreabilidade do fluxo

**Impacto**: 
- Métricas incorretas
- Impossível saber quantos se cadastraram mas não compraram
- Dashboard mostra dados incorretos

**Solução Recomendada**:
```typescript
// Criar método registerReferral():
async registerReferral(referralCode: string, refereeId: string): Promise<ReferralResponseDto> {
  const referral = await this.referralModel.findOne({ referralCode }).exec();
  
  if (!referral) {
    throw new NotFoundException('Código de indicação não encontrado');
  }
  
  if (referral.status !== 'pending') {
    throw new BadRequestException('Indicação já foi processada');
  }
  
  referral.refereeId = new Types.ObjectId(refereeId);
  referral.status = 'registered';
  referral.tracking = {
    ...referral.tracking,
    registeredAt: new Date(),
  };
  
  return this.toResponseDto(await referral.save());
}
```

---

### 5. Cancelamento de Recompensas Não Implementado

**Localização**: 
- `orders.service.ts` (linhas 176-183)
- `rewards.service.ts` - Não há método para cancelar recompensas por pedido

**Problema**: 
- Quando um pedido é cancelado, há um TODO mas nenhuma implementação
- Recompensas já processadas não são canceladas
- Pode haver pagamento indevido de recompensas

**Impacto**: 
- Perda financeira
- Recompensas pagas para pedidos cancelados
- Inconsistência de dados

**Solução Recomendada**:
```typescript
// Em orders.service.ts:
if (updateDto.status === 'cancelado' && order.referralId) {
  try {
    const referral = await this.referralsService.findOne(order.referralId.toString());
    
    // Buscar recompensas relacionadas
    const rewards = await this.rewardModel.find({ 
      referralId: order.referralId 
    }).exec();
    
    // Cancelar recompensas pendentes/processando
    for (const reward of rewards) {
      if (['pending', 'processing'].includes(reward.status)) {
        await this.rewardsService.cancel(
          reward._id.toString(),
          'system',
          'Pedido cancelado',
        );
      }
    }
    
    // Cancelar indicação
    await this.referralsService.cancelReferral(
      order.referralId.toString(),
      referral.referrerId,
    );
  } catch (error) {
    this.logger.error(`Erro ao cancelar recompensas do pedido ${id}:`, error.message);
  }
}
```

---

## 🟡 Problemas de Média Prioridade

### 6. Validação de Produtos Permitidos/Excluídos Não Implementada

**Localização**: 
- `referral-campaign.schema.ts` (linhas 24-25) - Campos existem
- `orders.service.ts` - Não há validação

**Problema**: 
- Campanhas podem ter `rules.allowedProducts` e `rules.excludedProducts`
- Nenhuma validação é feita ao completar indicação
- Recompensas são pagas mesmo para produtos não permitidos

**Impacto**: 
- Violação de regras de campanha
- Recompensas pagas indevidamente

**Solução Recomendada**:
```typescript
// Validar produtos antes de completar indicação
const order = await this.orderModel.findOne({ _id: orderId }).exec();
const campaign = await this.campaignsService.findOne(referral.campaignId.toString());

if (campaign.rules?.allowedProducts && campaign.rules.allowedProducts.length > 0) {
  const orderProductIds = order.items.map(item => item.productId);
  const hasAllowedProduct = orderProductIds.some(id => 
    campaign.rules.allowedProducts.some(allowedId => allowedId.toString() === id)
  );
  
  if (!hasAllowedProduct) {
    throw new BadRequestException('Pedido não contém produtos permitidos pela campanha');
  }
}

if (campaign.rules?.excludedProducts && campaign.rules.excludedProducts.length > 0) {
  const orderProductIds = order.items.map(item => item.productId);
  const hasExcludedProduct = orderProductIds.some(id => 
    campaign.rules.excludedProducts.some(excludedId => excludedId.toString() === id)
  );
  
  if (hasExcludedProduct) {
    throw new BadRequestException('Pedido contém produtos excluídos pela campanha');
  }
}
```

---

### 7. Status de Recompensa Não Atualizado na Indicação

**Localização**: 
- `rewards.service.ts` (linhas 238-252)
- `referrals.service.ts` - Não atualiza status após processamento

**Problema**: 
- Quando recompensa é marcada como paga, há TODOs mas não atualiza o status na indicação
- Indicação mantém `referrerReward.status = 'pending'` mesmo após pagamento
- Dados inconsistentes entre collections

**Impacto**: 
- Dashboard mostra status incorreto
- Usuário vê recompensa como pendente mesmo após receber

**Solução Recomendada**:
```typescript
// Em rewards.service.ts, método markAsPaid():
// Atualizar status na indicação
const referral = await this.referralsService.findOne(reward.referralId.toString());

if (referral.referrerId === reward.userId.toString()) {
  await this.referralModel.updateOne(
    { _id: reward.referralId },
    {
      'referrerReward.status': 'paid',
      'referrerReward.paidAt': new Date(),
      'referrerReward.rewardId': reward._id,
    }
  );
}

if (referral.refereeId === reward.userId.toString() && referral.refereeReward) {
  await this.referralModel.updateOne(
    { _id: reward.referralId },
    {
      'refereeReward.status': 'paid',
      'refereeReward.paidAt': new Date(),
      'refereeReward.rewardId': reward._id,
    }
  );
}
```

---

### 8. Validação de Elegibilidade do Referee Não Implementada

**Localização**: 
- `referrals.service.ts` - Método `validateCode()` não valida se referee já estava cadastrado

**Problema**: 
- Documentação especifica: "Não pode indicar usuários já cadastrados"
- Nenhuma validação é feita ao validar código
- Usuários existentes podem usar códigos de indicação

**Impacto**: 
- Violação de regras de negócio
- Fraude potencial
- Recompensas pagas indevidamente

**Solução Recomendada**:
```typescript
// Em validateCode(), adicionar validação:
async validateCode(code: string, refereeEmail?: string): Promise<ReferralResponseDto> {
  const referral = await this.referralModel.findOne({ referralCode: code }).exec();
  
  // ... validações existentes ...
  
  // Validar se referee já estava cadastrado
  if (refereeEmail) {
    const existingUser = await this.userModel.findOne({ email: refereeEmail }).exec();
    if (existingUser) {
      // Verificar se usuário foi criado antes da indicação
      if (existingUser.createdAt < referral.createdAt) {
        throw new BadRequestException('Usuário já estava cadastrado antes da indicação');
      }
    }
  }
  
  return this.toResponseDto(referral);
}
```

---

### 9. Métricas de Campanha Não São Atualizadas

**Localização**: 
- `referrals.service.ts` (linhas 386-392)
- `referral-campaigns.service.ts` - Métricas não são atualizadas

**Problema**: 
- Método `updateCampaignMetrics()` apenas loga, não atualiza
- Métricas da campanha ficam desatualizadas
- Dashboard mostra dados incorretos

**Impacto**: 
- Métricas incorretas
- Impossível acompanhar performance real das campanhas

**Solução Recomendada**:
```typescript
// Implementar atualização real:
private async updateCampaignMetrics(campaignId: string): Promise<void> {
  const stats = await this.getCampaignStats(campaignId);
  
  await this.campaignsService.updateMetrics(campaignId, {
    totalReferrals: stats.totalReferrals,
    completedReferrals: stats.completedReferrals,
    totalRewardsValue: stats.totalRewardsValue,
    conversionRate: stats.conversionRate,
  });
}
```

---

### 10. Falta de Validação de Auto-Referência

**Localização**: 
- `referrals.service.ts` - Método `create()` não valida

**Problema**: 
- Documentação especifica: "Não pode indicar a si mesmo"
- Nenhuma validação impede isso
- Usuário pode criar código e usar em si mesmo

**Impacto**: 
- Fraude potencial
- Recompensas pagas indevidamente

**Solução Recomendada**:
```typescript
// Em completeReferral(), adicionar validação:
if (referral.referrerId.toString() === refereeId) {
  throw new BadRequestException('Não é possível usar seu próprio código de indicação');
}
```

---

## 🟢 Melhorias Recomendadas

### 11. Processamento de Recompensas por Tipo Não Implementado

**Localização**: 
- `rewards.service.ts` (linhas 180-184)

**Problema**: 
- Há TODOs para processar cada tipo de recompensa (cashback, desconto, pontos, prêmio)
- Apenas cria o registro, não processa efetivamente

**Impacto**: 
- Recompensas ficam pendentes indefinidamente
- Usuários não recebem recompensas

**Solução Recomendada**:
```typescript
// Implementar processamento por tipo:
private async processRewardByType(reward: RewardDocument): Promise<void> {
  switch (reward.type) {
    case 'cashback':
      await this.processCashbackReward(reward);
      break;
    case 'discount':
      await this.processDiscountReward(reward);
      break;
    case 'points':
      await this.processPointsReward(reward);
      break;
    case 'physical':
      await this.processPhysicalReward(reward);
      break;
  }
}
```

---

### 12. Falta de Validação de Limites de Recompensas

**Localização**: 
- `rewards.service.ts` - Não valida limites diários/mensais

**Problema**: 
- Documentação especifica limites por período (diário/mensal)
- Nenhuma validação é feita antes de processar recompensa

**Impacto**: 
- Limites podem ser excedidos
- Perda financeira

---

### 13. Antifraude Não Implementado

**Localização**: 
- `referral.schema.ts` - Schema existe mas não é usado
- Nenhuma validação de IP, device fingerprint, etc.

**Problema**: 
- Documentação especifica sistema antifraude completo
- Nenhuma implementação existe

**Impacto**: 
- Sistema vulnerável a fraudes
- Perda financeira significativa

---

## 📊 Resumo de Impacto

| Prioridade | Quantidade | Impacto Financeiro | Impacto Funcional |
|------------|------------|-------------------|-------------------|
| 🔴 Crítica  | 5          | Alto              | Alto              |
| 🟡 Média     | 5          | Médio             | Médio             |
| 🟢 Baixa     | 3          | Baixo             | Baixo             |
| **Total**   | **13**     | -                 | -                 |

---

## 🎯 Próximos Passos Recomendados

1. **Fase 1 - Correções Críticas** (1-2 semanas):
   - Corrigir inconsistência de nomenclatura
   - Implementar processamento automático de recompensas
   - Adicionar validação de valor mínimo
   - Implementar status 'registered'
   - Implementar cancelamento de recompensas

2. **Fase 2 - Validações** (1 semana):
   - Validação de produtos permitidos/excluídos
   - Validação de elegibilidade do referee
   - Validação de auto-referência
   - Atualização de métricas

3. **Fase 3 - Melhorias** (2-3 semanas):
   - Processamento por tipo de recompensa
   - Validação de limites
   - Sistema antifraude básico

---

**Documento criado em**: {{DATA_ATUAL}}
**Versão**: 1.0
**Autor**: Análise Automatizada
