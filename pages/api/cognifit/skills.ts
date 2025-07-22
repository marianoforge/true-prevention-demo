import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener locales de la query string
    const { locales } = req.query;
    const localesList = typeof locales === 'string' ? locales.split(',') : ['en', 'es'];
    
    console.log('🧠 Cargando habilidades cognitivas de CogniFit...');
    
    const clientId = process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('CogniFit Client ID not configured');
    }
    
    // Construir URL para habilidades cognitivas
    const localeParams = localesList.map(locale => `locales%5B%5D=${locale}`).join('&');
    const url = `https://api.cognifit.com/skills?client_id=${clientId}&${localeParams}`;
    
    console.log('📡 Consultando:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.errorMessage || `HTTP ${response.status}`);
    }

    const skills = await response.json();
    console.log(`✅ ${skills.length} habilidades cognitivas cargadas`);
    
    // Devolver las habilidades con headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).json(skills);
    
  } catch (error) {
    console.error('❌ Error cargando habilidades:', error);
    
    // Devolver array vacío en caso de error (las habilidades no son críticas)
    console.log('🔄 Usando habilidades vacías como fallback');
    return res.status(200).json([]);
  }
} 