const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/life-tracker';

const defaultAchievements = [
  {
    achievementId: 'first_habit',
    name: 'Primeiro Hábito',
    description: 'Complete seu primeiro hábito',
    icon: 'star',
    criteria: { type: 'HABIT_COUNT', value: 1 },
  },
  {
    achievementId: 'streak_7',
    name: 'Série de 7 Dias',
    description: 'Complete um hábito por 7 dias seguidos',
    icon: 'flame',
    criteria: { type: 'STREAK', value: 7 },
  },
  {
    achievementId: 'points_1000',
    name: 'Mil Pontos',
    description: 'Acumule 1000 pontos',
    icon: 'trophy',
    criteria: { type: 'POINTS', value: 1000 },
  },
  {
    achievementId: 'routine_master',
    name: 'Mestre das Rotinas',
    description: 'Complete 10 rotinas',
    icon: 'check-circle',
    criteria: { type: 'ROUTINE_COUNT', value: 10 },
  },
  {
    achievementId: 'habit_master',
    name: 'Mestre dos Hábitos',
    description: 'Complete 50 hábitos',
    icon: 'target',
    criteria: { type: 'HABIT_COUNT', value: 50 },
  },
  {
    achievementId: 'streak_30',
    name: 'Mestre da Consistência',
    description: 'Complete um hábito por 30 dias seguidos',
    icon: 'award',
    criteria: { type: 'STREAK', value: 30 },
  },
  {
    achievementId: 'points_5000',
    name: 'Lenda dos Pontos',
    description: 'Acumule 5000 pontos',
    icon: 'crown',
    criteria: { type: 'POINTS', value: 5000 },
  },
];

async function initializeGamification() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db();
    const achievementsCollection = db.collection('achievements');
    
    // Verificar se já existem conquistas
    const existingAchievements = await achievementsCollection.countDocuments();
    
    if (existingAchievements > 0) {
      console.log(`Já existem ${existingAchievements} conquistas no banco. Pulando inicialização.`);
      return;
    }
    
    // Inserir conquistas padrão
    const result = await achievementsCollection.insertMany(defaultAchievements);
    console.log(`${result.insertedCount} conquistas padrão inseridas com sucesso!`);
    
    // Listar conquistas inseridas
    const insertedAchievements = await achievementsCollection.find().toArray();
    console.log('\nConquistas inseridas:');
    insertedAchievements.forEach(achievement => {
      console.log(`- ${achievement.name}: ${achievement.description}`);
    });
    
  } catch (error) {
    console.error('Erro ao inicializar gamificação:', error);
  } finally {
    await client.close();
    console.log('\nConexão com MongoDB fechada.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeGamification()
    .then(() => {
      console.log('\nInicialização da gamificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na inicialização:', error);
      process.exit(1);
    });
}

module.exports = { initializeGamification, defaultAchievements };
