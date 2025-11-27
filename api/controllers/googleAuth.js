import { db } from '../connect.js'
import { oauth2Client, getGoogleAuthURL } from '../googleAuth.js'

export const googleAuthUrl = (req, res) => {
  const userId = req.user.userId
  res.json({ url: getGoogleAuthURL(userId) })
}

export const googleCallbackUrl = async (req, res) => {
  const { code, state } = req.query
  const { userId } = JSON.parse(state)

  // Step 1 — Validate
  if (!code || !userId) {
    return res.status(400).json({
      status: 400,
      message: 'Authorization code and consultant ID are required'
    })
  }

  try {
    // Step 2 — Exchange Code for Tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    const { access_token, refresh_token } = tokens

    // Step 3 — Update DB
    const updateQuery = `
      UPDATE dmac_webapp_users
      SET google_access_token = ?, google_refresh_token = ?
      WHERE id = ?
    `

    db.query(
      updateQuery,
      [access_token, refresh_token, userId],
      (err, result) => {
        if (err) {
          console.error('DB Error:', err)
          return res.status(500).json({
            status: 500,
            message: 'Database error while updating tokens'
          })
        }

        // Step 4 — If consultant not found
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: 404,
            message: 'Consultant not found'
          })
        }

        // Step 5 — Success
        const path =
          process.env.NODE_ENV === 'localhost'
            ? process.env.FRONTEND_URL
            : process.env.FRONTEND_URL_PROD

        return res.redirect(`${path}`)
      }
    )
  } catch (error) {
    console.error('OAuth Error:', error)
    return res.status(500).json({
      status: 500,
      message: 'Failed to authenticate with Google'
    })
  }
}
