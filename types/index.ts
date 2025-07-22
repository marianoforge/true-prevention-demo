import { SVGProps } from "react";

export type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Interfaces basadas en la API real de CogniFit
export interface CogniFitGameAssets {
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  images?: {
    icon?: string;
    scareIconZodiac?: string;
    whiteIcon?: string;
    transparentIcon?: string;
  };
}

export interface CogniFitGame {
  key: string; // ID del juego como viene de la API
  iphone: number; // 1 disponible, 0 no disponible
  ipad: number;
  android: number;
  skills: string[]; // Array de keys de habilidades cognitivas
  assets: CogniFitGameAssets;
  category?: GameCategory; // Agregado para UI local
}

export interface CogniFitSkill {
  key: string;
  assets: {
    titles: Record<string, string>;
    descriptions: Record<string, string>;
    images: {
      whiteIcon?: string;
      transparentIcon?: string;
    };
  };
}

export interface CogniFitCredentials {
  accessToken: string;
  expires: number;
  expiresIn: number;
}

export interface CogniFitUser {
  userToken: string;
  name?: string;
  email?: string;
}

// Enums para categorías de juegos según la API
export type GameCategory = 'COGNITIVE' | 'MATH' | 'LANG';

// Interfaces para UI local (para organización visual)
export interface CognitiveCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  apiCategory: GameCategory;
}

// Configuración del SDK de CogniFit
export interface CogniFitSDKConfig {
  version: string;
  clientId: string;
  accessToken: string;
  appType: 'web' | 'app';
}

// Parámetros para lanzar un juego
export interface GameLaunchParams {
  version: string;
  mode: 'gameMode' | 'trainingMode' | 'assessmentMode';
  key: string; // game key
  elementId: string; // ID del elemento DOM donde cargar
  config: CogniFitSDKConfig;
}

// Respuesta del SDK después de completar un juego
export interface GameCompletionResponse {
  status: 'completed' | 'aborted' | 'loginError';
  mode?: string;
  key: string;
  score?: number;
  timestamp?: number;
}

export interface CogniFitAPIError {
  error: string;
  errorMessage: string;
}
