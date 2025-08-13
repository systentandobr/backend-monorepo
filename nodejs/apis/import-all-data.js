#!/usr/bin/env node

/**
 * Script principal para importar todos os dados do Life Tracker
 * Este script executa todos os processos de importação em sequência
 * 
 * Uso: node import-all-data.js
 */

const { importData } = require('./import-data');
const { createIntegratedPlan } = require('./create-integrated-plan');

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

// Função principal
async function importAllData() {
  log('🚀 INICIANDO IMPORTACAO COMPLETA DE DADOS', 'bright');
  log('===============================================', 'bright');
  log('', 'white');
  
  const startTime = Date.now();
  
  try {
    // Etapa 1: Importar dados básicos (hábitos, etc.)
    log('📋 ETAPA 1: Importando dados básicos', 'magenta');
    log('', 'white');
    
    await importData();
    
    log('', 'white');
    success('Etapa 1 concluída com sucesso!');
    log('', 'white');
    
    // Etapa 2: Criar plano integrado
    log('📋 ETAPA 2: Criando plano integrado', 'magenta');
    log('', 'white');
    
    await createIntegratedPlan();
    
    log('', 'white');
    success('Etapa 2 concluída com sucesso!');
    log('', 'white');
    
    // Calcular tempo total
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    log('🎉 IMPORTACAO COMPLETA FINALIZADA!', 'bright');
    log('===============================================', 'bright');
    log('', 'white');
    
    success(`Tempo total de execução: ${totalTime.toFixed(2)} segundos`);
    log('', 'white');
    
    info('Resumo do que foi importado:');
    log('   ✅ Hábitos por domínio', 'cyan');
    log('   ✅ Dados de gamificação', 'cyan');
    log('   ✅ Planos de refeições', 'cyan');
    log('   ✅ Dados de saúde', 'cyan');
    log('   ✅ Dados financeiros', 'cyan');
    log('   ✅ Dados de negócios', 'cyan');
    log('   ✅ Dados de produtividade', 'cyan');
    log('   ✅ Metas integradas', 'cyan');
    log('   ✅ Rotinas diárias', 'cyan');
    log('   ✅ Perfil do usuário', 'cyan');
    log('   ✅ Configurações de UI', 'cyan');
    log('', 'white');
    
    info('Próximos passos:');
    log('   1. Verificar se todos os dados foram salvos corretamente', 'cyan');
    log('   2. Testar as APIs para confirmar funcionamento', 'cyan');
    log('   3. Configurar dados adicionais se necessário', 'cyan');
    log('', 'white');
    
    info('Para testar as APIs:');
    log('   curl http://localhost:9090/routines/integrated-plan', 'cyan');
    log('   curl http://localhost:9090/routines/habits/healthness', 'cyan');
    log('   curl http://localhost:9090/routines/integrated-goals', 'cyan');
    log('', 'white');
    
  } catch (err) {
    error(`Erro durante a importação: ${err.message}`);
    log('', 'white');
    warning('Dicas para resolver problemas:');
    log('   1. Verifique se a API está rodando na porta 9090', 'cyan');
    log('   2. Verifique se o MongoDB está conectado', 'cyan');
    log('   3. Verifique se o arquivo JSON está no local correto', 'cyan');
    log('   4. Verifique os logs da aplicação para mais detalhes', 'cyan');
    process.exit(1);
  }
}

// Função para mostrar ajuda
function showHelp() {
  log('📖 AJUDA - Script de Importação de Dados', 'bright');
  log('', 'white');
  log('Uso:', 'cyan');
  log('   node import-all-data.js          # Executar importação completa', 'white');
  log('   node import-all-data.js --help   # Mostrar esta ajuda', 'white');
  log('', 'white');
  log('Scripts individuais:', 'cyan');
  log('   node import-data.js              # Importar dados básicos', 'white');
  log('   node create-integrated-plan.js   # Criar plano integrado', 'white');
  log('', 'white');
  log('Pré-requisitos:', 'cyan');
  log('   1. API rodando na porta 9090', 'white');
  log('   2. MongoDB conectado', 'white');
  log('   3. Arquivo plano_jogo_rotinas.json em assets/data/', 'white');
  log('   4. Dependências instaladas (axios)', 'white');
  log('', 'white');
  log('Instalar dependências:', 'cyan');
  log('   npm install axios', 'white');
  log('', 'white');
}

// Verificar argumentos de linha de comando
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Executar o script
if (require.main === module) {
  importAllData().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { importAllData }; 