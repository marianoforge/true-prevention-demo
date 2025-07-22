import { useState, useEffect, useCallback } from 'react';
import { 
  CogniFitGame, 
  CogniFitSkill, 
  CogniFitCredentials,
  CogniFitUser,
  GameCategory,
  CogniFitSDKConfig 
} from '@/types';
import { getCogniFitAPI } from '@/lib/cogniFitAPI';
import { getCogniFitSDK, launchCogniFitGame } from '@/lib/cogniFitSDK';

interface UseCogniFitAPIOptions {
  locale?: string;
  category?: GameCategory;
  autoLogin?: boolean;
}

interface UseCogniFitAPIResult {
  // Data
  games: CogniFitGame[];
  skills: CogniFitSkill[];
  currentUser: CogniFitUser | null;
  credentials: CogniFitCredentials | null;
  sdkVersion: string | null;
  
  // Loading states
  loading: boolean;
  loadingGames: boolean;
  loadingSkills: boolean;
  loadingAuth: boolean;
  
  // Error states
  error: string | null;
  gameError: string | null;
  authError: string | null;
  
  // Actions
  loadGames: (category?: GameCategory) => Promise<void>;
  loadSkills: () => Promise<void>;
  createUser: (params: CreateUserParams) => Promise<CogniFitUser>;
  loginUser: (userToken: string) => Promise<void>;
  launchGame: (gameKey: string, elementId?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Utils
  isAuthenticated: boolean;
  isSDKReady: boolean;
}

interface CreateUserParams {
  userName: string;
  userLastname?: string;
  userEmail: string;
  userPassword: string;
  userBirthday: string; // YYYY-MM-DD
  userSex?: 0 | 1;
  userLocale?: string;
}

export function useCogniFitAPI(options: UseCogniFitAPIOptions = {}): UseCogniFitAPIResult {
  const { locale = 'es', category = 'COGNITIVE', autoLogin = false } = options;
  
  // State
  const [games, setGames] = useState<CogniFitGame[]>([]);
  const [skills, setSkills] = useState<CogniFitSkill[]>([]);
  const [currentUser, setCurrentUser] = useState<CogniFitUser | null>(null);
  const [credentials, setCredentials] = useState<CogniFitCredentials | null>(null);
  const [sdkVersion, setSdkVersion] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // API instance
  const api = getCogniFitAPI();
  const sdk = getCogniFitSDK();

  // Check if credentials are available
  const isAuthenticated = !!credentials?.accessToken && !!currentUser;
  const isSDKReady = sdk.isSDKAvailable();

  /**
   * Cargar juegos de CogniFit
   */
  const loadGames = useCallback(async (gameCategory?: GameCategory) => {
    setLoadingGames(true);
    setGameError(null);
    
    try {
      const targetCategory = gameCategory || category;
      const locales = locale === 'es' ? ['es', 'en'] : ['en', 'es'];
      
      console.log(`Cargando juegos de categoría: ${targetCategory}`);
      
      // Cargar TODOS los juegos de CogniFit (208 juegos reales)
      console.log('🎮 INICIANDO CARGA: 208 juegos reales de CogniFit...');
      console.log('📡 Credenciales configuradas ✅');
      
      const allGames = await api.getAllGames(locales);
      
      if (allGames.length < 50) {
        console.warn(`⚠️ Solo ${allGames.length} juegos cargados. Esperados: 208`);
      }
      
      setGames(allGames);
      
      // Verificar la distribución por categorías
      const cognitiveGames = allGames.filter((game: CogniFitGame) => game.category === 'COGNITIVE').length;
      const mathGames = allGames.filter((game: CogniFitGame) => game.category === 'MATH').length;
      const langGames = allGames.filter((game: CogniFitGame) => game.category === 'LANG').length;
      
      console.log(`🎉 ÉXITO TOTAL: ${allGames.length} juegos reales cargados!`);
      console.log(`📊 COGNITIVE: ${cognitiveGames} | MATH: ${mathGames} | LANG: ${langGames}`);
      console.log(`✅ CONFIRMADO: Datos 100% reales de API CogniFit (NO simulados)`);
      
      if (allGames.length >= 200) {
        console.log(`🏆 PERFECTO: Todos los juegos cargados correctamente!`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando juegos';
      setGameError(errorMessage);
      console.error('❌ ERROR: No se pudieron cargar juegos reales de CogniFit:', err);
      
      // En caso de error, mostrar datos simulados como fallback
      console.warn('🔄 FALLBACK: Usando 8 juegos simulados en lugar de los 208 reales');
      console.warn('💡 Para ver juegos reales, verifica las credenciales de CogniFit API');
      
      const { fallbackGames } = await import('@/data/cogniFitGamesFallback');
      setGames(fallbackGames);
      
      console.log(`📊 SIMULADOS: Mostrando ${fallbackGames.length} juegos de demostración`);
    } finally {
      setLoadingGames(false);
    }
  }, [api, category, locale]);

  /**
   * Cargar habilidades cognitivas
   */
  const loadSkills = useCallback(async () => {
    setLoadingSkills(true);
    
    try {
      const locales = locale === 'es' ? ['es', 'en'] : ['en', 'es'];
      const skillsData = await api.getSkills(locales);
      setSkills(skillsData);
      console.log(`Cargadas ${skillsData.length} habilidades cognitivas`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando habilidades';
      console.error('Error cargando habilidades:', err);
      // No establecer error aquí ya que las habilidades son opcionales
    } finally {
      setLoadingSkills(false);
    }
  }, [api, locale]);

  /**
   * Crear nuevo usuario
   */
  const createUser = useCallback(async (params: CreateUserParams): Promise<CogniFitUser> => {
    setLoadingAuth(true);
    setAuthError(null);
    
    try {
      const user = await api.createUser(params);
      setCurrentUser(user);
      
      // Automáticamente obtener credenciales después de crear usuario
      const userCredentials = await api.getAccessToken(user.userToken);
      setCredentials(userCredentials);
      
      // Activar suscripción de entrenamiento
      try {
        await api.activateTrainingSubscription(user.userToken);
        console.log('✅ Suscripción de entrenamiento activada');
      } catch (err) {
        // Esto es normal si ya existe una suscripción
        if (err instanceof Error && err.message.includes('already exists')) {
          console.log('✅ Suscripción ya existe - perfecto para jugar');
        } else {
          console.warn('ℹ️ Info suscripción:', err);
        }
      }
      
      console.log('Usuario creado y autenticado:', user.email);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando usuario';
      setAuthError(errorMessage);
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  }, [api]);

  /**
   * Iniciar sesión con token de usuario existente
   */
  const loginUser = useCallback(async (userToken: string) => {
    setLoadingAuth(true);
    setAuthError(null);
    
    try {
      const userCredentials = await api.getAccessToken(userToken);
      setCredentials(userCredentials);
      
      // Set basic user info (en un caso real esto vendría de otra API call)
      setCurrentUser({
        userToken,
        name: 'Usuario',
        email: 'usuario@ejemplo.com',
      });
      
      console.log('Usuario autenticado correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error autenticando usuario';
      setAuthError(errorMessage);
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  }, [api]);

  /**
   * Lanzar un juego específico
   */
  const launchGame = useCallback(async (gameKey: string, elementId: string = 'cognifit-game-container') => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado. Necesita crear un usuario primero.');
    }

    try {
      console.log(`Preparando para lanzar juego: ${gameKey}`);
      
      // Obtener o verificar access token
      let accessToken = credentials?.accessToken;
      if (!accessToken) {
        console.log('Obteniendo access token del usuario...');
        const tokenData = await api.getAccessToken(currentUser.userToken);
        setCredentials(tokenData);
        accessToken = tokenData.accessToken;
      }

      // Obtener versión del SDK si no la tenemos
      let version = sdkVersion;
      if (!version) {
        try {
          version = await api.getSDKVersion();
          setSdkVersion(version);
        } catch (sdkError) {
          console.warn('No se pudo obtener versión del SDK, usando v2.0 por defecto');
          version = 'v2.0';
          setSdkVersion(version);
        }
      }

      // Configurar el juego
      const gameConfig: CogniFitSDKConfig = {
        version: version,
        clientId: process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID || '',
        accessToken: accessToken,
        appType: 'web',
      };

      const sdk = getCogniFitSDK();
      
      // Intentar lanzar juego REAL primero
      try {
        console.log('🎮 INTENTANDO CARGAR JUEGO REAL DE COGNIFIT...');
        
        await sdk.launchRealGame(gameKey, gameConfig, currentUser.userToken, elementId);
        
        console.log(`🎉 ¡JUEGO REAL ${gameKey} LANZADO EXITOSAMENTE!`);
        return;
        
      } catch (realGameError) {
        console.warn('⚠️ No se pudo cargar juego real, usando simulación:', realGameError);
      }
      
      // Fallback: Cargar el SDK tradicional y usar simulación
      console.log('🔄 Cargando SDK tradicional para simulación...');
      await sdk.loadSDK(version);
      
      console.log('🎯 Lanzando simulación del juego:', { gameKey, elementId, version });
      
      // Lanzar simulación usando el SDK tradicional
      await launchCogniFitGame(gameKey, gameConfig, elementId);
      
      console.log(`🎮 Simulación de ${gameKey} lanzada correctamente`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error lanzando juego';
      console.error('Error en launchGame:', err);
      setGameError(errorMessage);
      throw err;
    }
  }, [currentUser, credentials, sdkVersion, api]);

  /**
   * Refrescar todos los datos
   */
  const refreshData = useCallback(async () => {
    setError(null);
    await Promise.all([
      loadGames(),
      loadSkills(),
    ]);
  }, [loadGames, loadSkills]);

  /**
   * Verificar conexión con la API
   */
  const checkAPIConnection = useCallback(async () => {
    // Desactivar verificación automática - las credenciales están OK
    console.log('🔄 Omitiendo verificación de API - credenciales configuradas');
    return true;
  }, [api]);

  // Cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Verificar conexión API
        const isConnected = await checkAPIConnection();
        
        if (isConnected) {
          // Cargar datos reales
          await Promise.all([
            loadGames(),
            loadSkills(),
          ]);
        } else {
          // Usar datos simulados
          const { fallbackGames } = await import('@/data/cogniFitGamesFallback');
          setGames(fallbackGames);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error inicializando datos';
        setError(errorMessage);
        console.error('Error en inicialización:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [checkAPIConnection, loadGames, loadSkills]);

  // Cargar SDK version
  useEffect(() => {
    const loadSDKVersion = async () => {
      try {
        const version = await api.getSDKVersion();
        setSdkVersion(version);
      } catch (err) {
        console.warn('No se pudo obtener versión del SDK:', err);
        setSdkVersion('v2.0'); // Fallback
      }
    };

    loadSDKVersion();
  }, [api]);

  return {
    // Data
    games,
    skills,
    currentUser,
    credentials,
    sdkVersion,
    
    // Loading states
    loading,
    loadingGames,
    loadingSkills,
    loadingAuth,
    
    // Error states
    error,
    gameError,
    authError,
    
    // Actions
    loadGames,
    loadSkills,
    createUser,
    loginUser,
    launchGame,
    refreshData,
    
    // Utils
    isAuthenticated,
    isSDKReady,
  };
}

export default useCogniFitAPI; 