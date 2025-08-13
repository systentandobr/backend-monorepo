#!/usr/bin/env node

/**
 * Script para criar o plano integrado completo no banco de dados
 * Este script cria um documento IntegratedRoutine no MongoDB
 * 
 * Uso: node create-integrated-plan.js
 */

const fs = require('fs');
const path = require('path');

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

// Função para fazer requisições HTTP
async function makeRequest(method, endpoint, data = null) {
  try {
    // Importar axios dinamicamente
    const axios = (await import('axios')).default;
    
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

// Função para criar o plano integrado
async function createIntegratedPlan() {
  log('🚀 Criando plano integrado no banco de dados', 'bright');
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
    
    // Preparar dados para criação do plano integrado
    const integratedPlanData = {
      schema_version: data.schema_version,
      generated_at: data.generated_at,
      locale: data.locale,
      user_profile: data.user_profile,
      domains: data.domains,
      integrated_goals: data.integrated_goals,
      routines: data.routines,
      ui_hints: data.ui_hints
    };
    
    info('Criando plano integrado...');
    
    // Como não há endpoint específico para criar o plano integrado,
    // vamos simular a criação e mostrar os dados que seriam salvos
    
    log('📋 Dados do plano integrado:', 'magenta');
    log(`   Versão do schema: ${integratedPlanData.schema_version}`, 'cyan');
    log(`   Gerado em: ${integratedPlanData.generated_at}`, 'cyan');
    log(`   Locale: ${integratedPlanData.locale}`, 'cyan');
    log('', 'white');
    
    // Mostrar informações do perfil
    log('👤 Perfil do usuário:', 'magenta');
    log(`   Nome: ${integratedPlanData.user_profile.name}`, 'cyan');
    log(`   Idade: ${integratedPlanData.user_profile.age} anos`, 'cyan');
    log(`   Sexo: ${integratedPlanData.user_profile.sex}`, 'cyan');
    log(`   Observações: ${integratedPlanData.user_profile.notes.length}`, 'cyan');
    log('', 'white');
    
    // Mostrar domínios
    log('📊 Domínios configurados:', 'magenta');
    for (const [domainName, domainData] of Object.entries(integratedPlanData.domains)) {
      log(`   ${domainName.toUpperCase()}:`, 'cyan');
      if (domainData.goals) {
        log(`     - Metas: ${domainData.goals.length}`, 'cyan');
      }
      if (domainData.habits) {
        log(`     - Hábitos: ${domainData.habits.length}`, 'cyan');
      }
      if (domainData.game) {
        log(`     - Gamificação: configurada`, 'cyan');
      }
      if (domainData.meal_plan_week) {
        log(`     - Plano de refeições: configurado`, 'cyan');
      }
      if (domainData.latest_labs) {
        log(`     - Exames laboratoriais: disponíveis`, 'cyan');
      }
      if (domainData.diet_parameters) {
        log(`     - Parâmetros dietéticos: configurados`, 'cyan');
      }
      if (domainData.portfolio) {
        log(`     - Portfólio: R$ ${domainData.portfolio.total_value.toLocaleString('pt-BR')}`, 'cyan');
      }
      if (domainData.opportunities) {
        log(`     - Oportunidades: ${domainData.opportunities.length}`, 'cyan');
      }
      if (domainData.projects) {
        log(`     - Projetos: ${domainData.projects.length}`, 'cyan');
      }
    }
    log('', 'white');
    
    // Mostrar metas integradas
    log('🎯 Metas integradas:', 'magenta');
    for (const goal of integratedPlanData.integrated_goals) {
      log(`   ${goal.name} (${goal.domains.join(', ')})`, 'cyan');
      log(`     Progresso: ${goal.progress}%`, 'cyan');
      log(`     Data alvo: ${goal.target_date}`, 'cyan');
    }
    log('', 'white');
    
    // Mostrar rotinas
    log('⏰ Rotina diária:', 'magenta');
    log(`   Atividades: ${integratedPlanData.routines.daily_schedule.length}`, 'cyan');
    for (const activity of integratedPlanData.routines.daily_schedule) {
      log(`     ${activity.time} - ${activity.activity}`, 'cyan');
    }
    log('', 'white');
    
    // Mostrar configurações de UI
    log('🎨 Configurações de UI:', 'magenta');
    log(`   Cores: ${Object.keys(integratedPlanData.ui_hints.colors).length} domínios`, 'cyan');
    log(`   Ícones: ${Object.keys(integratedPlanData.ui_hints.icons).length} domínios`, 'cyan');
    log('', 'white');
    
    // Simular salvamento no banco
    info('Simulando salvamento no banco de dados...');
    
    // Aqui você pode adicionar a lógica real para salvar no MongoDB
    // Por exemplo, usando o Mongoose diretamente ou criando um endpoint específico
    
    success('✅ Plano integrado processado com sucesso!');
    log('', 'white');
    
    info('Para salvar no banco de dados, você pode:');
    log('   1. Criar um endpoint POST /integrated-plan na API', 'cyan');
    log('   2. Usar o Mongoose diretamente para inserir no MongoDB', 'cyan');
    log('   3. Usar o MongoDB Compass ou mongo shell', 'cyan');
    log('', 'white');
    
    info('Estrutura do documento para MongoDB:');
    log('   Collection: integrated_routines', 'cyan');
    log('   Document: IntegratedRoutine', 'cyan');
    log('', 'white');
    
    // Salvar dados em arquivo para referência
    const outputPath = path.join(__dirname, 'integrated-plan-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(integratedPlanData, null, 2));
    success(`Dados salvos em: ${outputPath}`);
    
  } catch (err) {
    error(`Erro durante a criação do plano integrado: ${err.message}`);
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  createIntegratedPlan().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { createIntegratedPlan }; 