import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientSecret = process.env.COGNIFIT_CLIENT_SECRET;
    
    if (!clientSecret) {
      throw new Error('COGNIFIT_CLIENT_SECRET not configured on server');
    }
    
    console.log('🔐 Proporcionando CLIENT_SECRET para generar hash');
    
    // Devolver el CLIENT_SECRET de forma segura (solo desde servidor)
    return res.status(200).json({ 
      clientSecret: clientSecret 
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo CLIENT_SECRET:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 