#!/usr/bin/env node

/**
 * Script simples para importar dados do arquivo plano_jogo_rotinas.json
 * Usa apenas módulos nativos do Node.js
 * 
 * Uso: node simple-import.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

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

// Função para fazer requisições HTTP simples
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (err) {
          resolve({ success: false, error: 'Resposta inválida' });
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Erro de conexão: ${err.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout da requisição'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função para verificar se a API está disponível
async function checkAPIHealth() {
  try {
    info('Verificando conectividade com a API...');
    const response = await makeRequest('GET', '/life-tracker/health');
    if (response.success !== false) {
      success('API está disponível');
      return true;
    } else {
      error('API retornou erro');
      return false;
    }
  } catch (err) {
    error(`API não está disponível: ${err.message}`);
    return false;
  }
}

// Função para ler e processar o arquivo JSON
function processDataFile() {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(DATA_FILE_PATH)) {
      error(`Arquivo não encontrado: ${DATA_FILE_PATH}`);
      return null;
    }
    
    // Ler o arquivo JSON
    info('Lendo arquivo de dados...');
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const data = JSON.parse(rawData);
    
    success('Arquivo lido com sucesso');
    return data;
  } catch (err) {
    error(`Erro ao ler arquivo: ${err.message}`);
    return null;
  }
}

// Função para mostrar resumo dos dados
function showDataSummary(data) {
  log('📋 RESUMO DOS DADOS', 'magenta');
  log('', 'white');
  
  // Informações básicas
  log(`   Versão do schema: ${data.schema_version}`, 'cyan');
  log(`   Gerado em: ${data.generated_at}`, 'cyan');
  log(`   Locale: ${data.locale}`, 'cyan');
  log('', 'white');
  
  // Perfil do usuário
  if (data.user_profile) {
    log('👤 Perfil do usuário:', 'magenta');
    log(`   Nome: ${data.user_profile.name}`, 'cyan');
    log(`   Idade: ${data.user_profile.age} anos`, 'cyan');
    log(`   Sexo: ${data.user_profile.sex}`, 'cyan');
    log(`   Observações: ${data.user_profile.notes.length}`, 'cyan');
    log('', 'white');
  }
  
  // Domínios
  if (data.domains) {
    log('📊 Domínios configurados:', 'magenta');
    for (const [domainName, domainData] of Object.entries(data.domains)) {
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
  }
  
  // Metas integradas
  if (data.integrated_goals) {
    log('🎯 Metas integradas:', 'magenta');
    for (const goal of data.integrated_goals) {
      log(`   ${goal.name} (${goal.domains.join(', ')})`, 'cyan');
      log(`     Progresso: ${goal.progress}%`, 'cyan');
      log(`     Data alvo: ${goal.target_date}`, 'cyan');
    }
    log('', 'white');
  }
  
  // Rotinas
  if (data.routines && data.routines.daily_schedule) {
    log('⏰ Rotina diária:', 'magenta');
    log(`   Atividades: ${data.routines.daily_schedule.length}`, 'cyan');
    for (const activity of data.routines.daily_schedule) {
      log(`     ${activity.time} - ${activity.activity}`, 'cyan');
    }
    log('', 'white');
  }
  
  // Configurações de UI
  if (data.ui_hints) {
    log('🎨 Configurações de UI:', 'magenta');
    log(`   Cores: ${Object.keys(data.ui_hints.colors).length} domínios`, 'cyan');
    log(`   Ícones: ${Object.keys(data.ui_hints.icons).length} domínios`, 'cyan');
    log('', 'white');
  }
}

// Função para salvar dados processados
function saveProcessedData(data) {
  try {
    const outputPath = path.join(__dirname, 'integrated-plan-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    success(`Dados salvos em: ${outputPath}`);
    return true;
  } catch (err) {
    error(`Erro ao salvar dados: ${err.message}`);
    return false;
  }
}

// Função principal
async function main() {
  log('🚀 SCRIPT DE IMPORTACAO SIMPLES', 'bright');
  log('================================', 'bright');
  log('', 'white');
  
  try {
    // Verificar API
    const apiAvailable = await checkAPIHealth();
    if (!apiAvailable) {
      log('', 'white');
      // Assuming warning is a custom function or will be added later
      // For now, we'll just log a message without the warning function
      console.warn('API não está disponível. Continuando apenas com processamento local...');
      log('', 'white');
    }
    
    // Processar arquivo
    const data = processDataFile();
    if (!data) {
      process.exit(1);
    }
    
    // Mostrar resumo
    showDataSummary(data);
    
    // Salvar dados processados
    saveProcessedData(data);
    
    log('', 'white');
    success('✅ Processamento concluído com sucesso!');
    log('', 'white');
    
    info('Próximos passos:');
    log('   1. Verificar o arquivo integrated-plan-output.json', 'cyan');
    log('   2. Usar os dados para criar registros no banco', 'cyan');
    log('   3. Testar as APIs após importação manual', 'cyan');
    log('', 'white');
    
    info('Para importar manualmente no MongoDB:');
    log('   mongoimport --db life_tracker --collection integrated_routines --file integrated-plan-output.json', 'cyan');
    log('', 'white');
    
  } catch (err) {
    error(`Erro durante o processamento: ${err.message}`);
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  main().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main }; 