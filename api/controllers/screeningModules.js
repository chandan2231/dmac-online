import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

import { db } from '../connect.js'
import sendEmail from '../emailService.js'

import {
  getModules as getModulesBase,
  startSession as startSessionBase,
  submitSession as submitSessionBase,
  getAttemptStatus as getAttemptStatusBase,
  getUserReport as getUserReportBase,
  generateReportPdf as generateReportPdfBase
} from './modules.js'

const query = (sql, args) => {
  return new Promise((resolve, reject) => {
    db.query(sql, args, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

export const getModules = getModulesBase
export const startSession = startSessionBase
export const submitSession = submitSessionBase

// These base handlers read user id from req.user; for screening we accept it from body.
export const getAttemptStatus = (req, res) => {
  const userIdRaw =
    req.query?.user_id ??
    req.query?.userId ??
    req.body?.user_id ??
    req.body?.userId

  const userId = Number(userIdRaw)
  req.user = { userId: Number.isFinite(userId) ? userId : userIdRaw }
  return getAttemptStatusBase(req, res)
}

export const getUserReport = (req, res) => {
  const userIdRaw =
    req.query?.user_id ??
    req.query?.userId ??
    req.body?.user_id ??
    req.body?.userId
  const userId = Number(userIdRaw)
  req.user = { userId: Number.isFinite(userId) ? userId : userIdRaw }
  return getUserReportBase(req, res)
}

export const generateReportPdf = (req, res) => {
  const userIdRaw =
    req.query?.user_id ??
    req.query?.userId ??
    req.body?.user_id ??
    req.body?.userId
  const userId = Number(userIdRaw)
  req.user = { userId: Number.isFinite(userId) ? userId : userIdRaw }
  return generateReportPdfBase(req, res)
}

export const registerScreeningUser = async (req, res) => {
  try {
    const { name, email, dob } = req.body || {}

    if (!name || !email || !dob) {
      return res.status(400).json({ isSuccess: false, message: 'Missing required fields' })
    }

    const existing = await query('SELECT id FROM dmac_webapp_users WHERE email = ? LIMIT 1', [email])
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(200).json({ isSuccess: false, message: 'Email already exists. Please try with another email.' })
    }

    const verificationToken = uuidv4()

    // Generate a random password so the row is compatible with existing schema.
    const randomPassword = crypto.randomBytes(16).toString('hex')
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(randomPassword, salt)

    const encryptedPassword = encryptString(randomPassword)

    const patientMeta = JSON.stringify({ dob })

    const insertQuery = `
      INSERT INTO dmac_webapp_users (
        name,
        email,
        mobile,
        password,
        encrypted_password,
        language,
        verified,
        verification_token,
        role,
        time_zone,
        patient_meta
      )
      VALUES (?)
    `

    const values = [
      name,
      email,
      '',
      hashedPassword,
      encryptedPassword,
      'en',
      0,
      verificationToken,
      'USER',
      'UTC',
      patientMeta
    ]

    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })

    const verifyLink = `${process.env.DOMAIN}screening-questioners/verify/${verificationToken}`

    const subject = 'Verify Your Email for DMAC'
    const greetingHtml = `<p>Dear ${name},</p>`
    const bodyHtml = `<h2>You have successfully registered for screening.</h2>
                      <br>
                      <h4>Click the link below to verify your email</h4>
                      <a href="${verifyLink}">Verify Email</a>`
    const emailHtml = `<div>${greetingHtml}${bodyHtml}</div>`

    await sendEmail(email, subject, emailHtml, emailHtml)

    return res.status(200).json({
      isSuccess: true,
      message: 'Registration successful. Please verify your email to continue.',
      userId: insertResult?.insertId ?? null
    })
  } catch (err) {
    console.error('SCREENING REGISTER ERROR:', err)
    return res.status(500).json({ isSuccess: false, message: 'Internal server error.' })
  }
}

function encryptString(original) {
  const key = Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex')

  const cipher = crypto.createCipheriv(
    process.env.CRYPTO_ALGORITHM,
    key,
    Buffer.alloc(16, 0)
  )

  cipher.setAutoPadding(true)

  let encrypted = cipher.update(original, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  return encrypted
}

export const verifyScreeningEmail = async (req, res) => {
  try {
    const { token } = req.body || {}
    if (!token) {
      return res.status(400).json({ isSuccess: false, message: 'Token is required' })
    }

    const updateResult = await new Promise((resolve, reject) => {
      db.query(
        'UPDATE dmac_webapp_users SET verified = 1 WHERE verification_token = ?',
        [token],
        (err, result) => {
          if (err) return reject(err)
          resolve(result)
        }
      )
    })

    if (!updateResult || updateResult.affectedRows === 0) {
      return res.status(400).json({ isSuccess: false, message: 'Invalid or expired token' })
    }

    const users = await query(
      'SELECT id, name, email, patient_meta, verified FROM dmac_webapp_users WHERE verification_token = ? LIMIT 1',
      [token]
    )

    const user = Array.isArray(users) && users.length > 0 ? users[0] : null
    if (!user) {
      return res.status(400).json({ isSuccess: false, message: 'User not found' })
    }

    return res.status(200).json({
      isSuccess: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        patient_meta: user.patient_meta,
        verified: Boolean(user.verified)
      }
    })
  } catch (err) {
    console.error('SCREENING VERIFY ERROR:', err)
    return res.status(500).json({ isSuccess: false, message: 'Internal server error.' })
  }
}
