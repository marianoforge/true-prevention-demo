import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { callback_url } = req.body;
    
    const response = await fetch('https://api.cognifit.com/health-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID,
        client_secret: process.env.COGNIFIT_CLIENT_SECRET,
        ...(callback_url && { callback_url }),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error: data.errorMessage || 'Error en health check'
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 