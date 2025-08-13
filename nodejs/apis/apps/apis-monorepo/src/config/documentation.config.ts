export interface DocumentationConfig {
  title: string;
  description: string;
  version: string;
  logo?: string;
  favicon?: string;
  theme?: 'light' | 'dark';
  layout?: 'sidebar' | 'stacked';
  hideInternal?: boolean;
  hideTryIt?: boolean;
  hideExport?: boolean;
  corsProxy?: string;
}

export const defaultDocumentationConfig: DocumentationConfig = {
  title: 'API Documentation',
  description: 'Documentação interativa da API',
  version: '1.0.0',
  theme: 'light',
  layout: 'sidebar',
  hideInternal: false,
  hideTryIt: false,
  hideExport: false,
};
