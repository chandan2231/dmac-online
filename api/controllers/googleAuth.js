import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmail from '../emailService.js'
import { v4 as uuidv4 } from 'uuid'
import { oauth2Client, getGoogleAuthURL } from '../googleAuth.js'

export const googleAuthUrl = (req, res) => {
  res.json({ url: getGoogleAuthURL() });
}

export const googleCallbackUrl = async (req, res) => {
  const { code, consultant_id } = req.query;

  // Step 1 — Validate
  if (!code || !consultant_id) {
    return res.status(400).json({
      status: 400,
      message: "Authorization code and consultant ID are required"
    });
  }

  try {
    // Step 2 — Exchange Code for Tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    // Step 3 — Update DB
    const updateQuery = `
      UPDATE dmac_webapp_users
      SET google_access_token = ?, google_refresh_token = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [access_token, refresh_token, consultant_id], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          status: 500,
          message: "Database error while updating tokens"
        });
      }

      // Step 4 — If consultant not found
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 404,
          message: "Consultant not found"
        });
      }

      // Step 5 — Success
      return res.status(200).json({
        status: 200,
        auth: true,
        message: "Google Calendar connected successfully"
      });
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to authenticate with Google"
    });
  }
};







