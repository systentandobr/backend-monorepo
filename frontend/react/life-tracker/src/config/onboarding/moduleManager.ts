import { QuestionConfig, QuestionDefinition } from './types';

/**
 * ModuleManager - Utilitário para gerenciar os módulos de questões
 * Permite adicionar, remover e combinar módulos dinâmicamente
 */
export class ModuleManager {
  private config: QuestionConfig = {};

  /**
   * Construtor que permite inicializar com módulos existentes
   */
  constructor(initialModules?: QuestionConfig[]) {
    if (initialModules) {
      initialModules.forEach(module => this.addModule(module));
    }
  }

  /**
   * Adiciona um módulo completo ao gerenciador
   */
  addModule(module: QuestionConfig): void {
    this.config = { ...this.config, ...module };
  }

  /**
   * Adiciona uma questão individual ao gerenciador
   */
  addQuestion(key: string, question: QuestionDefinition): void {
    this.config[key] = question;
  }

  /**
   * Remove um módulo do gerenciador baseado em suas chaves
   */
  removeModule(moduleKeys: string[]): void {
    moduleKeys.forEach(key => {
      if (this.config[key]) {
        delete this.config[key];
      }
    });
  }

  /**
   * Remove uma questão individual do gerenciador
   */
  removeQuestion(key: string): void {
    if (this.config[key]) {
      delete this.config[key];
    }
  }
  
  /**
   * Modifica uma questão existente
   */
  updateQuestion(key: string, updates: Partial<QuestionDefinition>): void {
    if (this.config[key]) {
      this.config[key] = { ...this.config[key], ...updates };
    }
  }

  /**
   * Retorna a lista de chaves de todas as questões cadastradas
   */
  getQuestionKeys(): string[] {
    return Object.keys(this.config);
  }
  
  /**
   * Verifica se uma questão existe
   */
  hasQuestion(key: string): boolean {
    return !!this.config[key];
  }

  /**
   * Obtém a configuração atual completa
   */
  getConfig(): QuestionConfig {
    return this.config;
  }
  
  /**
   * Obtém uma única questão pelo seu identificador
   */
  getQuestion(key: string): QuestionDefinition | undefined {
    return this.config[key];
  }
  
  /**
   * Cria um novo gerenciador contendo apenas as questões especificadas
   */
  createSubset(keys: string[]): ModuleManager {
    const subsetManager = new ModuleManager();
    
    keys.forEach(key => {
      if (this.config[key]) {
        subsetManager.addQuestion(key, this.config[key]);
      }
    });
    
    return subsetManager;
  }
}

/**
 * Cria um gerenciador de módulos com os módulos especificados
 */
export const createModuleManager = (modules: QuestionConfig[]): ModuleManager => {
  return new ModuleManager(modules);
};