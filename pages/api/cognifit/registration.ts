import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userName,
      userLastname,
      userEmail,
      userPassword,
      userBirthday,
      userSex,
      userLocale
    } = req.body;
    
    const response = await fetch('https://api.cognifit.com/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_COGNIFIT_CLIENT_ID,
        client_secret: process.env.COGNIFIT_CLIENT_SECRET,
        user_name: userName,
        user_lastname: userLastname || '',
        user_email: userEmail,
        user_password: userPassword,
        user_birthday: userBirthday,
        user_sex: userSex || 0,
        user_locale: userLocale || 'en',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({
        error: data.errorMessage || 'Error creando usuario'
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 