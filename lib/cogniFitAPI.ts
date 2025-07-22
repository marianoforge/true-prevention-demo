import {
  CogniFitGame,
  CogniFitSkill,
  CogniFitCredentials,
  CogniFitUser,
  CogniFitAPIError,
  GameCategory
} from "@/types";

interface CogniFitAPIConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
}

interface CreateUserParams {
  userName: string;
  userLastname?: string;
  userEmail: string;
  userPassword: string;
  userBirthday: string; // YYYY-MM-DD
  userSex?: 0 | 1; // 0 Female / 1 Male
  userLocale?: string;
}

export class CogniFitAPI {
  private config: CogniFitAPIConfig;

  constructor(config: CogniFitAPIConfig) {
    this.config = config;
  }

  /**
   * Verificar credenciales y conexión con CogniFit
   */
  async healthCheck(callbackUrl?: string): Promise<any> {
    // Solo verificar CLIENT_ID desde el cliente (CLIENT_SECRET está en servidor)
    if (!this.config.clientId) {
      throw new Error('CogniFit API credentials not configured');
    }
    
    console.log('🔍 Verificando conexión con API CogniFit...');

    const response = await fetch('/api/cognifit/health-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(callbackUrl && { callback_url: callbackUrl }),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Error en health check');
    }

    return data;
  }

  /**
   * Crear nuevo usuario en CogniFit
   */
  async createUser(params: CreateUserParams): Promise<CogniFitUser> {
    const response = await fetch('/api/cognifit/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: params.userName,
        userLastname: params.userLastname,
        userEmail: params.userEmail,
        userPassword: params.userPassword,
        userBirthday: params.userBirthday,
        userSex: params.userSex,
        userLocale: params.userLocale || 'en',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Error creando usuario');
    }

    return {
      userToken: data.user_token,
      email: params.userEmail,
      name: params.userName,
    };
  }

  /**
   * Obtener access token para un usuario
   */
  async getAccessToken(userToken: string): Promise<CogniFitCredentials> {
    const response = await fetch('/api/cognifit/issue-access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Error obteniendo access token');
    }

    return {
      accessToken: data.access_token,
      expires: data.expires,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Obtener lista de habilidades cognitivas
   */
  async getSkills(locales: string[] = ['en']): Promise<CogniFitSkill[]> {
    // Usar URL absoluta en el servidor
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const url = `${baseUrl}/api/cognifit/skills?locales=${locales.join(',')}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Error obteniendo habilidades`);
    }

    return await response.json();
  }

  /**
   * Obtener lista de juegos por categoría
   */
  async getGames(
    category: GameCategory = 'COGNITIVE',
    locales: string[] = ['en', 'es']
  ): Promise<CogniFitGame[]> {
    const localesParam = locales.join(',');
    // Usar URL absoluta en el servidor
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const url = `${baseUrl}/api/cognifit/games?category=${category}&locales=${localesParam}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Error obteniendo juegos');
    }

    const games = await response.json();
    
    // Agregar categoría a cada juego para UI local
    return games.map((game: CogniFitGame) => ({
      ...game,
      category,
    }));
  }

  /**
   * Obtener todos los juegos de todas las categorías
   */
  async getAllGames(locales: string[] = ['en', 'es']): Promise<CogniFitGame[]> {
    const categories: GameCategory[] = ['COGNITIVE', 'MATH', 'LANG'];
    const allGames: CogniFitGame[] = [];
    
    try {
      console.log('🎮 Cargando TODOS los juegos de CogniFit...');
      
      for (const category of categories) {
        console.log(`📂 Cargando categoría: ${category}`);
        const categoryGames = await this.getGames(category, locales);
        console.log(`✅ ${category}: ${categoryGames.length} juegos cargados`);
        allGames.push(...categoryGames);
      }
      
      console.log(`🚀 TOTAL: ${allGames.length} juegos de CogniFit cargados`);
      return allGames;
    } catch (error) {
      console.error('❌ Error obteniendo todos los juegos:', error);
      // Si falla, intentar solo con juegos cognitivos
      console.log('🔄 Fallback: cargando solo juegos COGNITIVE');
      return await this.getGames('COGNITIVE', locales);
    }
  }

  /**
   * Obtener la versión del SDK de JavaScript
   */
  async getSDKVersion(): Promise<string> {
    const response = await fetch('https://api.cognifit.com/description/versions/sdkjs?v=2.0');
    
    if (!response.ok) {
      throw new Error('Error obteniendo versión del SDK');
    }

    const data = await response.text();
    return data.trim();
  }

  /**
   * Activar suscripción de entrenamiento para un usuario
   */
  async activateTrainingSubscription(userToken: string): Promise<boolean> {
    const response = await fetch('/api/cognifit/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userToken,
        subscriptionType: 'free',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Error activando suscripción');
    }

    return true;
  }

  /**
   * Obtener historial de juegos jugados
   */
  async getPlayedGamesHistory(
    userToken: string,
    initialValue: number = 0,
    totalPoints: number = 50
  ): Promise<any[]> {
    const response = await fetch(`${this.config.baseURL}/get-historical-played-games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        user_token: userToken,
        initial_value: initialValue.toString(),
        total_points: totalPoints.toString(),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.errorMessage || 'Error obteniendo historial');
    }

    return data.historicalScoreAndSkills || [];
  }
}

// Singleton para uso en la aplicación
let cogniFitAPIInstance: CogniFitAPI | null = null;

export function getCogniFitAPI(): CogniFitAPI {
  if (!cogniFitAPIInstance) {
    const config = {
      baseURL: process.env.NEXT_PUBLIC_COGNIFIT_API_URL || 'https://api.cognifit.com',
      clientId: process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID || '',
      clientSecret: process.env.COGNIFIT_CLIENT_SECRET || '',
    };

    // Solo verificar CLIENT_ID en el cliente (CLIENT_SECRET solo está en servidor por seguridad)
    if (typeof window !== 'undefined' && !config.clientId) {
      console.warn('CogniFit API credentials not configured, falling back to simulated data');
    } else if (typeof window !== 'undefined' && config.clientId) {
      console.log('✅ CogniFit API credenciales configuradas correctamente');
    }

    cogniFitAPIInstance = new CogniFitAPI(config);
  }

  return cogniFitAPIInstance;
}

export default CogniFitAPI; 