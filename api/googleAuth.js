import { google } from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET_KEY,
  process.env.GOOGLE_REDIRECT_URL
)

export const getGoogleAuthURL = (userId) => {
  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/calendar.events'

  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: JSON.stringify({ userId: userId }),
    prompt: 'consent' // Force to get refresh token
  })
  console.log('Generated Google Auth URL:', url)
  return url
}
