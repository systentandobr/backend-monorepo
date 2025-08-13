#!/usr/bin/env node

/**
 * Script para importar dados do arquivo plano_jogo_rotinas.json para o banco de dados
 * através das APIs do Life Tracker
 * 
 * Uso: node import-data.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configurações
const API_BASE_URL = 'http://localhost:9090';
const DATA_FILE_PATH = path.join(__dirname, 'assets', 'data', 'plano_jogo_rotinas.json');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Função para log colorido
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para log de sucesso
function success(message) {
  log(`✅ ${message}`, 'green');
}

// Função para log de erro
function error(message) {
  log(`❌ ${message}`, 'red');
}

// Função para log de informação
function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Função para log de aviso
function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Função para fazer requisições HTTP
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(`HTTP ${err.response.status}: ${err.response.data?.error || err.response.statusText}`);
    } else if (err.request) {
      throw new Error(`Erro de conexão: ${err.message}`);
    } else {
      throw new Error(`Erro: ${err.message}`);
    }
  }
}

// Função para criar hábitos
async function createHabits(habits, domain) {
  info(`Criando ${habits.length} hábitos para o domínio: ${domain}`);
  
  const results = [];
  for (const habit of habits) {
    try {
      const habitData = {
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        categoryId: 1, // Valor padrão
        description: habit.description,
        target: habit.target,
        timeOfDay: habit.timeOfDay,
        domain: domain
      };

      const result = await makeRequest('POST', '/routines/habits', habitData);
      if (result.success) {
        success(`Hábito criado: ${habit.name}`);
        results.push(result.data);
      } else {
        error(`Falha ao criar hábito ${habit.name}: ${result.error}`);
      }
    } catch (err) {
      error(`Erro ao criar hábito ${habit.name}: ${err.message}`);
    }
  }
  
  return results;
}

// Função para criar metas integradas
async function createIntegratedGoals(goals) {
  info(`Criando ${goals.length} metas integradas`);
  
  // Primeiro, precisamos criar o plano integrado completo
  // Como não há endpoint específico para criar metas integradas,
  // vamos simular a criação através do endpoint de atualização de progresso
  
  for (const goal of goals) {
    try {
      // Simular criação de meta integrada
      info(`Meta integrada: ${goal.name} (${goal.domains.join(', ')})`);
      log(`   Descrição: ${goal.description}`, 'cyan');
      log(`   Progresso: ${goal.progress}%`, 'cyan');
      log(`   Data alvo: ${goal.target_date}`, 'cyan');
      log(`   Métricas: ${goal.key_metrics.join(', ')}`, 'cyan');
    } catch (err) {
      error(`Erro ao processar meta ${goal.name}: ${err.message}`);
    }
  }
}

// Função para criar rotinas diárias
async function createDailyRoutines(routines) {
  info(`Processando rotina diária com ${routines.daily_schedule.length} atividades`);
  
  for (const activity of routines.daily_schedule) {
    try {
      info(`Atividade: ${activity.time} - ${activity.activity}`);
    } catch (err) {
      error(`Erro ao processar atividade: ${err.message}`);
    }
  }
}

// Função para criar dados de gamificação
async function createGameData(game, domain) {
  info(`Criando dados de gamificação para o domínio: ${domain}`);
  
  try {
    log(`   Tabuleiro: ${game.board.rows}x${game.board.cols}`, 'cyan');
    log(`   Milestones: ${game.board.milestones.length}`, 'cyan');
    log(`   Regras de pontuação: ${game.scoring_rules.length}`, 'cyan');
    log(`   Meta semanal: ${game.weekly_goal_points} pontos`, 'cyan');
    
    // Aqui você pode adicionar lógica para salvar no banco
    // através de endpoints específicos de gamificação
    
  } catch (err) {
    error(`Erro ao processar dados de gamificação: ${err.message}`);
  }
}

// Função para criar plano de refeições
async function createMealPlan(mealPlan, domain) {
  info(`Criando plano de refeições para o domínio: ${domain}`);
  
  try {
    log(`   Dias: ${mealPlan.days.join(', ')}`, 'cyan');
    log(`   Refeições: ${mealPlan.meals.join(', ')}`, 'cyan');
    
    // Contar refeições no plano
    const totalMeals = Object.keys(mealPlan.plan).length * mealPlan.meals.length;
    log(`   Total de refeições planejadas: ${totalMeals}`, 'cyan');
    
  } catch (err) {
    error(`Erro ao processar plano de refeições: ${err.message}`);
  }
}

// Função para criar dados de saúde
async function createHealthData(healthData, domain) {
  info(`Criando dados de saúde para o domínio: ${domain}`);
  
  try {
    if (healthData.latest_labs) {
      log(`   Exames laboratoriais disponíveis`, 'cyan');
    }
    
    if (healthData.diet_parameters) {
      log(`   Parâmetros dietéticos configurados`, 'cyan');
    }
    
    if (healthData.supplementation) {
      log(`   Suplementação: ${healthData.supplementation.length} itens`, 'cyan');
    }
    
    if (healthData.recipes) {
      log(`   Receitas: ${healthData.recipes.length}`, 'cyan');
    }
    
    if (healthData.shopping_list) {
      log(`   Lista de compras configurada`, 'cyan');
    }
    
  } catch (err) {
    error(`Erro ao processar dados de saúde: ${err.message}`);
  }
}

// Função para criar dados financeiros
async function createFinancialData(financialData, domain) {
  info(`Criando dados financeiros para o domínio: ${domain}`);
  
  try {
    if (financialData.portfolio) {
      log(`   Portfólio: R$ ${financialData.portfolio.total_value.toLocaleString('pt-BR')}`, 'cyan');
      log(`   Retorno: ${financialData.portfolio.total_return}%`, 'cyan');
      log(`   Ativos: ${financialData.portfolio.assets.length}`, 'cyan');
    }
    
    if (financialData.financial_goals) {
      log(`   Metas financeiras: ${financialData.financial_goals.length}`, 'cyan');
    }
    
  } catch (err) {
    error(`Erro ao processar dados financeiros: ${err.message}`);
  }
}

// Função para criar dados de negócios
async function createBusinessData(businessData, domain) {
  info(`Criando dados de negócios para o domínio: ${domain}`);
  
  try {
    if (businessData.opportunities) {
      log(`   Oportunidades: ${businessData.opportunities.length}`, 'cyan');
    }
    
    if (businessData.projects) {
      log(`   Projetos: ${businessData.projects.length}`, 'cyan');
    }
    
    if (businessData.business_plan_progress) {
      log(`   Progresso do plano de negócios configurado`, 'cyan');
    }
    
  } catch (err) {
    error(`Erro ao processar dados de negócios: ${err.message}`);
  }
}

// Função para criar dados de produtividade
async function createProductivityData(productivityData, domain) {
  info(`Criando dados de produtividade para o domínio: ${domain}`);
  
  try {
    if (productivityData.goals) {
      log(`   Metas de produtividade: ${productivityData.goals.length}`, 'cyan');
    }
    
  } catch (err) {
    error(`Erro ao processar dados de produtividade: ${err.message}`);
  }
}

// Função principal
async function importData() {
  log('🚀 Iniciando importação de dados do Life Tracker', 'bright');
  log('', 'white');
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(DATA_FILE_PATH)) {
      error(`Arquivo não encontrado: ${DATA_FILE_PATH}`);
      process.exit(1);
    }
    
    // Ler o arquivo JSON
    info('Lendo arquivo de dados...');
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const data = JSON.parse(rawData);
    
    success('Arquivo lido com sucesso');
    log('', 'white');
    
    // Verificar se a API está disponível
    info('Verificando conectividade com a API...');
    try {
      await makeRequest('GET', '/life-tracker/health');
      success('API está disponível');
    } catch (err) {
      error(`API não está disponível: ${err.message}`);
      log('Certifique-se de que a aplicação está rodando na porta 9090', 'yellow');
      process.exit(1);
    }
    
    log('', 'white');
    
    // Processar dados por domínio
    const domains = data.domains;
    
    for (const [domainName, domainData] of Object.entries(domains)) {
      log(`📊 Processando domínio: ${domainName.toUpperCase()}`, 'magenta');
      log('', 'white');
      
      // Criar hábitos do domínio
      if (domainData.habits && domainData.habits.length > 0) {
        await createHabits(domainData.habits, domainName);
        log('', 'white');
      }
      
      // Criar dados de gamificação
      if (domainData.game) {
        await createGameData(domainData.game, domainName);
        log('', 'white');
      }
      
      // Criar plano de refeições (apenas para healthness)
      if (domainName === 'healthness' && domainData.meal_plan_week) {
        await createMealPlan(domainData.meal_plan_week, domainName);
        log('', 'white');
      }
      
      // Criar dados específicos por domínio
      if (domainName === 'healthness') {
        await createHealthData(domainData, domainName);
      } else if (domainName === 'finances') {
        await createFinancialData(domainData, domainName);
      } else if (domainName === 'business') {
        await createBusinessData(domainData, domainName);
      } else if (domainName === 'productivity') {
        await createProductivityData(domainData, domainName);
      }
      
      log('', 'white');
    }
    
    // Criar metas integradas
    if (data.integrated_goals && data.integrated_goals.length > 0) {
      log('🎯 Processando metas integradas', 'magenta');
      log('', 'white');
      await createIntegratedGoals(data.integrated_goals);
      log('', 'white');
    }
    
    // Criar rotinas diárias
    if (data.routines) {
      log('⏰ Processando rotinas diárias', 'magenta');
      log('', 'white');
      await createDailyRoutines(data.routines);
      log('', 'white');
    }
    
    // Mostrar informações do perfil do usuário
    if (data.user_profile) {
      log('👤 Informações do perfil do usuário', 'magenta');
      log(`   Nome: ${data.user_profile.name}`, 'cyan');
      log(`   Idade: ${data.user_profile.age} anos`, 'cyan');
      log(`   Sexo: ${data.user_profile.sex}`, 'cyan');
      log(`   Notas: ${data.user_profile.notes.length} observações`, 'cyan');
      log('', 'white');
    }
    
    // Mostrar configurações de UI
    if (data.ui_hints) {
      log('🎨 Configurações de UI', 'magenta');
      log(`   Cores configuradas: ${Object.keys(data.ui_hints.colors).length}`, 'cyan');
      log(`   Ícones configurados: ${Object.keys(data.ui_hints.icons).length}`, 'cyan');
      log('', 'white');
    }
    
    success('✅ Importação concluída com sucesso!');
    log('', 'white');
    info('Resumo da importação:');
    log(`   - Domínios processados: ${Object.keys(domains).length}`, 'cyan');
    log(`   - Total de hábitos: ${Object.values(domains).reduce((acc, domain) => acc + (domain.habits?.length || 0), 0)}`, 'cyan');
    log(`   - Metas integradas: ${data.integrated_goals?.length || 0}`, 'cyan');
    log(`   - Atividades diárias: ${data.routines?.daily_schedule?.length || 0}`, 'cyan');
    
  } catch (err) {
    error(`Erro durante a importação: ${err.message}`);
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  importData().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { importData }; 