# Integración con CogniFit API v2

Esta documentación explica cómo integrar tu aplicación con la API real de CogniFit para obtener los juegos de entrenamiento cognitivo.

## Configuración Inicial

### 1. Registro y Obtención de Credenciales

Para empezar con CogniFit API, necesitas:

1. **Crear una cuenta de desarrollador** en [CogniFit Developer Portal](https://www.cognifit.com/developers)
2. **Obtener tus credenciales de API**:
   - API Key
   - Client ID
   - Client Secret
3. **Seleccionar el tipo de cuenta** según tu uso:
   - Personal
   - Profesional (Healthcare)
   - Educacional 
   - Investigación

### 2. Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```bash
COGNIFIT_API_KEY=tu_api_key_aqui
COGNIFIT_CLIENT_ID=tu_client_id_aqui
COGNIFIT_CLIENT_SECRET=tu_client_secret_aqui
COGNIFIT_BASE_URL=https://api.cognifit.com/v2
```

## Autenticación

### Método de Autenticación OAuth 2.0

```typescript
// lib/cognifit-api.ts
interface CogniFitCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class CogniFitAPI {
  private baseURL = process.env.COGNIFIT_BASE_URL;
  private clientId = process.env.COGNIFIT_CLIENT_ID;
  private clientSecret = process.env.COGNIFIT_CLIENT_SECRET;

  async authenticate(): Promise<CogniFitCredentials> {
    const response = await fetch(`${this.baseURL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Error en autenticación con CogniFit API');
    }

    return await response.json();
  }
}
```

## Endpoints Principales

### 1. Obtener Lista de Categorías Cognitivas

```typescript
interface CognitiveCategory {
  id: string;
  name: string;
  description: string;
  cognitive_domains: string[];
}

async getCategories(accessToken: string): Promise<CognitiveCategory[]> {
  const response = await fetch(`${this.baseURL}/categories`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener categorías');
  }

  const data = await response.json();
  return data.categories;
}
```

### 2. Obtener Lista de Juegos por Categoría

```typescript
interface CogniFitGame {
  id: string;
  name: string;
  description: string;
  category_id: string;
  cognitive_skills: string[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_duration: number; // en minutos
  thumbnail_url?: string;
  play_url: string;
}

async getGamesByCategory(
  accessToken: string, 
  categoryId: string
): Promise<CogniFitGame[]> {
  const response = await fetch(
    `${this.baseURL}/categories/${categoryId}/games`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error al obtener juegos para categoría ${categoryId}`);
  }

  const data = await response.json();
  return data.games;
}
```

### 3. Obtener Todos los Juegos

```typescript
async getAllGames(accessToken: string): Promise<CogniFitGame[]> {
  const response = await fetch(`${this.baseURL}/games`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener todos los juegos');
  }

  const data = await response.json();
  return data.games;
}
```

### 4. Iniciar Sesión de Juego

```typescript
interface GameSession {
  session_id: string;
  game_id: string;
  user_id: string;
  play_url: string;
  expires_at: string;
}

async startGameSession(
  accessToken: string,
  gameId: string,
  userId: string
): Promise<GameSession> {
  const response = await fetch(`${this.baseURL}/games/${gameId}/play`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al iniciar sesión de juego ${gameId}`);
  }

  return await response.json();
}
```

## Implementación en el Componente

### Hook personalizado para CogniFit API

```typescript
// hooks/useCogniFitAPI.ts
import { useState, useEffect } from 'react';
import { CogniFitAPI } from '@/lib/cognifit-api';

interface UseCogniFitAPIResult {
  games: CogniFitGame[];
  categories: CognitiveCategory[];
  loading: boolean;
  error: string | null;
  startGame: (gameId: string, userId: string) => Promise<GameSession>;
}

export function useCogniFitAPI(): UseCogniFitAPIResult {
  const [games, setGames] = useState<CogniFitGame[]>([]);
  const [categories, setCategories] = useState<CognitiveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');

  const api = new CogniFitAPI();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Autenticar
        const credentials = await api.authenticate();
        setAccessToken(credentials.accessToken);
        
        // Obtener categorías y juegos
        const [categoriesData, gamesData] = await Promise.all([
          api.getCategories(credentials.accessToken),
          api.getAllGames(credentials.accessToken),
        ]);
        
        setCategories(categoriesData);
        setGames(gamesData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const startGame = async (gameId: string, userId: string): Promise<GameSession> => {
    return await api.startGameSession(accessToken, gameId, userId);
  };

  return {
    games,
    categories,
    loading,
    error,
    startGame,
  };
}
```

### Actualización del Componente Principal

```typescript
// pages/cognifit-games/index.tsx
import { useCogniFitAPI } from '@/hooks/useCogniFitAPI';

const CogniFitGamesPage: NextPage = () => {
  const { games, categories, loading, error, startGame } = useCogniFitAPI();

  const handlePlayGame = async (gameId: string) => {
    try {
      // En producción, deberías obtener el userId del usuario autenticado
      const userId = 'user-123'; 
      const session = await startGame(gameId, userId);
      
      // Redirigir al juego
      window.open(session.play_url, '_blank');
      
    } catch (err) {
      console.error('Error al iniciar juego:', err);
      alert('Error al iniciar el juego');
    }
  };

  if (loading) return <div>Cargando juegos...</div>;
  if (error) return <div>Error: {error}</div>;

  // Organizar juegos por categorías
  const categoriesWithGames = categories.map(category => ({
    ...category,
    games: games.filter(game => game.category_id === category.id),
  }));

  return (
    <DefaultLayout>
      {/* Tu JSX existente */}
      <div className="mt-8 w-full max-w-6xl mx-auto px-4">
        {categoriesWithGames.map((categoryData) => (
          <CategorySection
            key={categoryData.id}
            category={categoryData}
            games={categoryData.games}
            onPlayGame={handlePlayGame}
          />
        ))}
      </div>
    </DefaultLayout>
  );
};
```

## Manejo de Errores

### Tipos de Errores Comunes

1. **401 Unauthorized**: Credenciales inválidas o token expirado
2. **403 Forbidden**: Permisos insuficientes
3. **404 Not Found**: Recurso no encontrado
4. **429 Too Many Requests**: Límite de rate limiting excedido
5. **500 Internal Server Error**: Error del servidor

### Implementación de Retry Logic

```typescript
async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## Consideraciones de Seguridad

1. **Nunca exponer las credenciales** en el cliente
2. **Implementar autenticación de usuario** antes de permitir acceso
3. **Validar permisos** según el tipo de cuenta
4. **Implementar rate limiting** en tu backend
5. **Usar HTTPS** en todas las comunicaciones

## Rate Limiting

CogniFit API tiene límites de velocidad:
- **Autenticación**: 100 requests/hora
- **Juegos**: 1000 requests/hora
- **Categorías**: 500 requests/hora

## Próximos Pasos

1. **Configurar las variables de entorno**
2. **Obtener credenciales de CogniFit**
3. **Implementar la autenticación de usuarios**
4. **Reemplazar los datos simulados** con llamadas a la API real
5. **Implementar caché** para mejorar rendimiento
6. **Añadir métricas y monitoreo**

## Soporte

Para soporte técnico o dudas sobre la API:
- **Documentación oficial**: https://api.cognifit.com/docs
- **Portal de desarrolladores**: https://developers.cognifit.com
- **Email de soporte**: api-support@cognifit.com 