import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userHash, userPassword } = req.body;
    
    const response = await fetch('https://api.cognifit.com/access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID,
        client_secret: process.env.COGNIFIT_CLIENT_SECRET,
        user_hash: userHash,
        user_password: userPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error: data.errorMessage || 'Error obteniendo access token'
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error obteniendo access token:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 