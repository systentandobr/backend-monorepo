/**
 * Definições de tipos para o sistema de tema
 */

// Cores de tema
export interface ThemeColors {
    // Cores principais
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    
    // Cores de destaque
    accent: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    
    // Cores de tema escuro
    dark: {
      background: string;
      card: string;
      border: string;
      text: string;
      subtext: string;
    };
    
    // Cores de tema claro
    light: {
      background: string;
      card: string;
      border: string;
      text: string;
      subtext: string;
    };
    
    // Cores de feedback
    feedback: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    
    // Cores de categorias
    categories: {
      health: string;
      sleep: string;
      personal: string;
      work: string;
      finance: string;
    };
    
    // Cores de hábitos
    habits: {
      water: string;
      exercise: string;
      meditation: string;
      reading: string;
      coffee: string;
      study: string;
      diet: string;
      [key: string]: string;
    };
    
    // Gradientes
    gradients: {
      primary: string;
      accent: string;
      health: string;
      sleep: string;
      [key: string]: string;
    };
  }
  
  // Opções de tema
  export type ThemeMode = 'light' | 'dark' | 'system';
  
  // Configurações de tema
  export interface ThemeSettings {
    mode: ThemeMode;
    useSystemPreference: boolean;
    colorScheme: 'default' | 'highContrast' | 'colorBlind';
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
  }
  
  // Espaçamento
  export interface ThemeSpacing {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  }
  
  // Bordas
  export interface ThemeRadius {
    sm: string;
    md: string;
    lg: string;
    full: string;
  }
  
  // Sombras
  export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  }
  
  // Tipografia
  export interface ThemeTypography {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  }
  
  // Tema completo
  export interface Theme {
    colors: ThemeColors;
    spacing: ThemeSpacing;
    radius: ThemeRadius;
    shadows: ThemeShadows;
    typography: ThemeTypography;
  }