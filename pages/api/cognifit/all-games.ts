import { NextApiRequest, NextApiResponse } from 'next';
import { getCogniFitAPI } from '@/lib/cogniFitAPI';
import { CogniFitGame, GameCategory } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener locales de la query string
    const { locales } = req.query;
    const localesList = typeof locales === 'string' ? locales.split(',') : ['en', 'es'];
    
    console.log('🚀 Cargando todos los juegos de CogniFit...');
    
    // Obtener API instance
    const api = getCogniFitAPI();
    
    // Obtener todos los juegos usando la función existente
    const allGames = await api.getAllGames(localesList);
    
    console.log(`✅ Total de juegos obtenidos: ${allGames.length}`);
    
    // Devolver los juegos con headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).json(allGames);
    
  } catch (error) {
    console.error('❌ Error en /api/cognifit/all-games:', error);
    
    // En caso de error, devolver datos de fallback
    try {
      const { fallbackGames } = await import('@/data/cogniFitGamesFallback');
      console.log('🔄 Usando datos de fallback');
      return res.status(200).json(fallbackGames);
    } catch (fallbackError) {
      console.error('❌ Error cargando fallback:', fallbackError);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 