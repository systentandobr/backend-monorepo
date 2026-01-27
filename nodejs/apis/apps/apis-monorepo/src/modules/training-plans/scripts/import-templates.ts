/**
 * Script para importar templates ABC do arquivo JSON para o MongoDB
 * 
 * Uso:
 * npx ts-node -r tsconfig-paths/register src/modules/training-plans/scripts/import-templates.ts
 * 
 * Ou via NestJS CLI:
 * nest start --entryFile import-templates
 */

import { connect, connection, model, Schema, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente do arquivo .env
// Usar require para compatibilidade com ts-node
const loadEnv = () => {
  try {
    const dotenv = require('dotenv');
    // Tentar encontrar o arquivo .env na raiz do projeto (backend-monorepo/nodejs/apis)
    const envPath = path.resolve(__dirname, '../../../../../../.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(`✅ Arquivo .env carregado de: ${envPath}`);
      return;
    }
    
    // Tentar caminho alternativo (raiz do projeto atual)
    const altEnvPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(altEnvPath)) {
      dotenv.config({ path: altEnvPath });
      console.log(`✅ Arquivo .env carregado de: ${altEnvPath}`);
      return;
    }
    
    // Tentar carregar sem especificar caminho (procura automaticamente)
    dotenv.config();
    console.log('✅ Tentando carregar .env do diretório atual');
  } catch (error: any) {
    // Se dotenv não estiver instalado, usar variáveis de ambiente do sistema
    console.warn('⚠️ dotenv não encontrado ou erro ao carregar, usando variáveis de ambiente do sistema');
    if (error?.message) {
      console.warn(`   Erro: ${error.message}`);
    }
  }
};

loadEnv();

// Schema temporário para Exercise
const ExerciseSchema = new Schema(
  {
    unitId: String,
    name: String,
    description: String,
    muscleGroups: [String],
    equipment: [String],
    defaultSets: Number,
    defaultReps: String,
    defaultRestTime: Number,
    difficulty: String,
    targetGender: String,
    isActive: Boolean,
    metadata: Schema.Types.Mixed,
  },
  { collection: 'exercises', strict: false, timestamps: true },
);

const ExerciseModel = model('Exercise', ExerciseSchema);

// Schema temporário para a importação
const TrainingPlanSchema = new Schema(
  {
    unitId: String,
    studentId: String,
    name: String,
    description: String,
    objectives: [String],
    weeklySchedule: [
      {
        dayOfWeek: Number,
        timeSlots: [
          {
            startTime: String,
            endTime: String,
            activity: String,
          },
        ],
        exercises: [
          {
            exerciseId: Schema.Types.ObjectId, // Referência ao Exercise
            name: String,
            sets: Number,
            reps: String,
            weight: Number,
            restTime: Number,
            notes: String,
          },
        ],
      },
    ],
    exercises: [
      {
        exerciseId: Schema.Types.ObjectId, // Referência ao Exercise
        name: String,
        sets: Number,
        reps: String,
        weight: Number,
        restTime: Number,
        notes: String,
      },
    ],
    startDate: Date,
    endDate: Date,
    status: String,
    progress: {
      completedObjectives: [String],
      lastUpdate: Date,
      notes: String,
    },
    isTemplate: Boolean,
    targetGender: String,
    templateId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed,
  },
  { collection: 'training_plans', strict: false, timestamps: true },
);

const TrainingPlanModel = model('TrainingPlan', TrainingPlanSchema);

interface TemplateData {
  name: string;
  description: string;
  targetGender: 'male' | 'female' | 'other';
  objectives: string[];
  weeklySchedule: {
    dayOfWeek: number;
    timeSlots: {
      startTime: string;
      endTime: string;
      activity: string;
    }[];
    exercises: {
      name: string;
      sets: number;
      reps: string;
      restTime: number;
      notes?: string;
    }[];
  }[];
}

interface TemplatesFile {
  templates: TemplateData[];
}

/**
 * Infere grupos musculares baseado no nome do exercício
 */
function inferMuscleGroups(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const groups: string[] = [];

  // Mapeamento de palavras-chave para grupos musculares
  const mappings: { [key: string]: string[] } = {
    'supino': ['peito', 'tríceps'],
    'peito': ['peito'],
    'tríceps': ['tríceps'],
    'ombro': ['ombro'],
    'desenvolvimento': ['ombro'],
    'elevação lateral': ['ombro'],
    'costas': ['costas'],
    'remada': ['costas'],
    'puxada': ['costas'],
    'bíceps': ['bíceps'],
    'rosca': ['bíceps'],
    'perna': ['pernas'],
    'agachamento': ['pernas', 'glúteos'],
    'leg press': ['pernas'],
    'extensão': ['pernas'],
    'flexão': ['pernas'],
    'panturrilha': ['panturrilha'],
    'glúteo': ['glúteos'],
    'abdução': ['glúteos'],
    'elevação pélvica': ['glúteos'],
    'trapézio': ['trapézio'],
    'encolhimento': ['trapézio'],
  };

  for (const [keyword, muscleGroups] of Object.entries(mappings)) {
    if (name.includes(keyword)) {
      muscleGroups.forEach((group) => {
        if (!groups.includes(group)) {
          groups.push(group);
        }
      });
    }
  }

  return groups.length > 0 ? groups : ['geral'];
}

async function importTemplates() {
  try {
    // Conectar ao MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/backend-monorepo';
    
    console.log('🔌 Conectando ao MongoDB...');
    console.log(`📍 URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Ocultar credenciais
    
    await connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Carregar arquivo JSON
    const possiblePaths = [
      path.join(__dirname, '..', 'templates', 'abc-beginner-templates.json'),
      path.join(process.cwd(), 'src', 'modules', 'training-plans', 'templates', 'abc-beginner-templates.json'),
      path.join(process.cwd(), 'dist', 'apps', 'apis-monorepo', 'modules', 'training-plans', 'templates', 'abc-beginner-templates.json'),
    ];

    let templatesPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        templatesPath = possiblePath;
        break;
      }
    }

    if (!templatesPath) {
      throw new Error(
        `Arquivo de templates não encontrado. Tentados: ${possiblePaths.join(', ')}`,
      );
    }

    console.log(`📂 Carregando templates de: ${templatesPath}`);
    const fileContent = fs.readFileSync(templatesPath, 'utf-8');
    const data: TemplatesFile = JSON.parse(fileContent);

    if (!data.templates || data.templates.length === 0) {
      throw new Error('Nenhum template encontrado no arquivo JSON');
    }

    console.log(`📋 Encontrados ${data.templates.length} templates para importar`);

    // unitId padrão para templates e exercícios
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#ALL#SYSTEM#0001';

    // PASSO 1: Extrair todos os exercícios únicos dos templates
    console.log('\n📦 PASSO 1: Extraindo exercícios dos templates...');
    const exerciseMap = new Map<string, {
      name: string;
      sets: number;
      reps: string;
      restTime: number;
      notes?: string;
      muscleGroups?: string[];
    }>();

    for (const template of data.templates) {
      for (const day of template.weeklySchedule) {
        for (const exercise of day.exercises) {
          const key = exercise.name.toLowerCase().trim();
          if (!exerciseMap.has(key)) {
            // Tentar inferir grupo muscular do nome do exercício
            const muscleGroups = inferMuscleGroups(exercise.name);
            exerciseMap.set(key, {
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              restTime: exercise.restTime,
              notes: exercise.notes,
              muscleGroups,
            });
          }
        }
      }
    }

    console.log(`   ✅ Encontrados ${exerciseMap.size} exercícios únicos`);

    // PASSO 2: Criar/atualizar exercícios no catálogo
    console.log('\n💪 PASSO 2: Criando/atualizando exercícios no catálogo...');
    const exerciseIdMap = new Map<string, Types.ObjectId>();
    let exercisesCreated = 0;
    let exercisesUpdated = 0;

    for (const [key, exerciseData] of exerciseMap.entries()) {
      try {
        // Verificar se exercício já existe
        const existing = await ExerciseModel.findOne({
          unitId: defaultUnitId,
          name: { $regex: new RegExp(`^${exerciseData.name}$`, 'i') },
        }).exec();

        const exerciseDoc = {
          unitId: defaultUnitId,
          name: exerciseData.name,
          description: exerciseData.notes || `Exercício: ${exerciseData.name}`,
          muscleGroups: exerciseData.muscleGroups || [],
          equipment: [], // Pode ser preenchido depois
          defaultSets: exerciseData.sets,
          defaultReps: exerciseData.reps,
          defaultRestTime: exerciseData.restTime,
          difficulty: 'beginner' as const,
          targetGender: undefined, // Pode ser ajustado depois
          isActive: true,
        };

        let exerciseId: Types.ObjectId;
        if (existing && existing._id) {
          // Atualizar exercício existente
          await ExerciseModel.updateOne(
            { _id: existing._id },
            { $set: exerciseDoc },
          ).exec();
          exerciseId = existing._id as Types.ObjectId;
          exercisesUpdated++;
        } else {
          // Criar novo exercício
          const created = await ExerciseModel.create(exerciseDoc);
          exerciseId = created._id as Types.ObjectId;
          exercisesCreated++;
        }

        exerciseIdMap.set(key, exerciseId);
        console.log(`   ${existing ? '🔄' : '✅'} ${exerciseData.name} -> ${exerciseId}`);
      } catch (error: any) {
        console.error(`   ❌ Erro ao processar exercício ${exerciseData.name}:`, error.message);
      }
    }

    console.log(`\n   📊 Exercícios: ${exercisesCreated} criados, ${exercisesUpdated} atualizados`);

    // PASSO 3: Criar templates com referências aos exercícios
    console.log('\n📋 PASSO 3: Criando templates com referências aos exercícios...');
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const template of data.templates) {
      try {
        // Verificar se já existe um template com mesmo nome e gênero
        const existing = await TrainingPlanModel.findOne({
          isTemplate: true,
          targetGender: template.targetGender,
          name: template.name,
          unitId: defaultUnitId,
        }).exec();

        // Mapear exercícios do template para usar exerciseId
        const weeklyScheduleWithExerciseIds = template.weeklySchedule.map((day) => ({
          ...day,
          exercises: day.exercises.map((ex) => {
            const exerciseKey = ex.name.toLowerCase().trim();
            const exerciseId = exerciseIdMap.get(exerciseKey);
            
            return {
              exerciseId: exerciseId || undefined, // Usar ObjectId se encontrado
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              restTime: ex.restTime,
              notes: ex.notes,
            };
          }),
        }));

        const templateData = {
          unitId: defaultUnitId,
          studentId: 'TEMPLATE', // Placeholder para templates
          name: template.name,
          description: template.description,
          objectives: template.objectives,
          weeklySchedule: weeklyScheduleWithExerciseIds,
          exercises: [],
          startDate: new Date(),
          status: 'active',
          isTemplate: true,
          targetGender: template.targetGender,
          progress: {
            completedObjectives: [],
            lastUpdate: new Date(),
          },
        };

        if (existing) {
          // Atualizar template existente
          await TrainingPlanModel.updateOne(
            { _id: existing._id },
            { $set: templateData },
          ).exec();
          console.log(`🔄 Template atualizado: ${template.name} (${template.targetGender})`);
          updated++;
        } else {
          // Criar novo template
          await TrainingPlanModel.create(templateData);
          console.log(`✅ Template importado: ${template.name} (${template.targetGender})`);
          imported++;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao importar template ${template.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumo da importação:');
    console.log(`   💪 Exercícios: ${exercisesCreated} criados, ${exercisesUpdated} atualizados`);
    console.log(`   📋 Templates: ${imported} importados, ${updated} atualizados`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📋 Total de templates processados: ${data.templates.length}`);

    // Fechar conexão
    await connection.close();
    console.log('\n✅ Importação concluída!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro na importação:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    await connection.close();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  importTemplates();
}

export { importTemplates };
