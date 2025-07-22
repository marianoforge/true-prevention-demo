import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category = 'COGNITIVE', locales = 'en,es' } = req.query;
    
    // Crear query string para locales
    const localesArray = (locales as string).split(',');
    const localesQuery = localesArray
      .map((locale) => `locales%5B%5D=${locale}`)
      .join('&');

    const url = `https://api.cognifit.com/programs/tasks?client_id=${process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID}&category=${category}&${localesQuery}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error: data.errorMessage || 'Error obteniendo juegos'
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error obteniendo juegos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 