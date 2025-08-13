import { DocumentationConfig } from '../config/documentation.config';

export class StoplightGenerator {
  static generateHTML(config: DocumentationConfig): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${config.title}</title>
    <meta name="description" content="${config.description}">
    
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
    
    ${config.favicon ? `<link rel="icon" type="image/x-icon" href="${config.favicon}">` : ''}
    ${config.logo ? `<link rel="shortcut icon" href="${config.logo}">` : ''}
    
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        elements-api { height: 100vh; display: block; }
        ${config.theme === 'dark' ? `
        body { background-color: #1a1a1a; color: #ffffff; }
        elements-api { --sl-color-canvas-100: #1a1a1a; }
        ` : ''}
    </style>
</head>
<body>
    <elements-api 
        apiDescriptionUrl="/api-json"
        router="hash"
        layout="${config.layout}"
        hideInternal="${config.hideInternal}"
        hideTryIt="${config.hideTryIt}"
        hideExport="${config.hideExport}"
        ${config.logo ? `logo="${config.logo}"` : ''}
        ${config.corsProxy ? `tryItCorsProxy="${config.corsProxy}"` : ''}
    />
</body>
</html>
    `;
  }
}
