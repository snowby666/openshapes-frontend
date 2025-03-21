import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'cookies-next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get authorization code from Discord
  const { code } = req.query
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    // Forward the code to our backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Check response
    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json(errorData)
    }

    // If the response includes a redirect, follow it
    if (response.redirected) {
      // Extract token from redirect URL
      const redirectUrl = new URL(response.url)
      const token = redirectUrl.searchParams.get('token')

      if (token) {
        // Set token in cookie for client-side access
        setCookie('access_token', token, { 
          req, 
          res, 
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
          httpOnly: false, // Needs to be accessible from JavaScript
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })

        // Redirect to dashboard
        return res.redirect('/dashboard')
      }
    }

    // Default fallback if something unexpected happens
    return res.redirect('/')
  } catch (error) {
    console.error('Error during OAuth callback:', error)
    return res.status(500).json({ error: 'Internal server error during authentication' })
  }
}