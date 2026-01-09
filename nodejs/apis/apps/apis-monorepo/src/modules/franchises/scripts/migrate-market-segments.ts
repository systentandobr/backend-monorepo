/**
 * Script de migração para adicionar campo marketSegments em franchises existentes
 * 
 * Uso:
 * 1. Via NestJS CLI: npx ts-node src/modules/franchises/scripts/migrate-market-segments.ts
 * 2. Ou importar e executar em um script de migração do NestJS
 */

import { connect, connection, model, Schema } from 'mongoose';

// Schema temporário para a migração
const FranchiseSchema = new Schema({
  unitId: String,
  name: String,
  location: {
    type: {
      type: String,
    },
  },
  marketSegments: {
    type: [String],
    default: [],
  },
}, { collection: 'franchises', strict: false });

const FranchiseModel = model('Franchise', FranchiseSchema);

async function migrateMarketSegments() {
  try {
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/systentando';
    console.log('🔌 Conectando ao MongoDB...');
    await connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todas as franchises sem marketSegments ou com marketSegments undefined/null
    const franchises = await FranchiseModel.find({
      $or: [
        { marketSegments: { $exists: false } },
        { marketSegments: null },
        { marketSegments: [] },
      ],
    }).exec();

    console.log(`📊 Encontradas ${franchises.length} franchises para migrar`);

    let migrated = 0;
    let skipped = 0;

    for (const franchise of franchises) {
      // Heurística: determinar segmentação baseada em dados existentes
      const segments: string[] = [];

      // Se location.type === 'physical', adicionar 'retail' por padrão
      if (franchise.location?.type === 'physical') {
        segments.push('retail');
      }

      // Se location.type === 'digital', adicionar 'ecommerce' por padrão
      if (franchise.location?.type === 'digital') {
        segments.push('ecommerce');
      }

      // Se não tiver nenhuma segmentação determinada, adicionar 'retail' como padrão
      if (segments.length === 0) {
        segments.push('retail');
      }

      // Atualizar franchise
      await FranchiseModel.updateOne(
        { _id: franchise._id },
        { $set: { marketSegments: segments } }
      ).exec();

      migrated++;
      console.log(`✅ Migrada: ${franchise.name || franchise.unitId} -> [${segments.join(', ')}]`);
    }

    console.log('\n📈 Resumo da migração:');
    console.log(`   ✅ Migradas: ${migrated}`);
    console.log(`   ⏭️  Ignoradas: ${skipped}`);
    console.log(`   📊 Total processadas: ${franchises.length}`);

    // Fechar conexão
    await connection.close();
    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    await connection.close();
    process.exit(1);
  }
}

// Executar migração se o script for executado diretamente
if (require.main === module) {
  migrateMarketSegments();
}

export { migrateMarketSegments };
