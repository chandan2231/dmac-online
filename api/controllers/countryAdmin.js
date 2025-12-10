import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import sendEmail from '../emailService.js'
import { v4 as uuidv4 } from 'uuid'
import { getRoleMessage } from '../utils/roleMessages.js'
import crypto from 'crypto'

function encryptString(original) {
  if (!process.env.CRYPTO_SECRET_KEY || !process.env.CRYPTO_ALGORITHM) {
    console.error('Missing CRYPTO_SECRET_KEY or CRYPTO_ALGORITHM in env')
    throw new Error('Encryption configuration missing')
  }
  const cipher = crypto.createCipheriv(
    process.env.CRYPTO_ALGORITHM,
    Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex'),
    Buffer.alloc(16, 0)
  )
  let encrypted = cipher.update(original, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

export const createCountryAdmin = async (req, res) => {
  try {
    // Check if the email already exists
    const checkEmailQuery = 'SELECT * FROM dmac_webapp_users WHERE email = ?'
    const existingUserData = await new Promise((resolve, reject) => {
      db.query(checkEmailQuery, [req.body.email], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
    const existingUser = Array.isArray(existingUserData)
      ? existingUserData
      : [existingUserData]

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json('Email already exists. Please try with another email.')
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)
    const verificationToken = uuidv4()
    const encryptedPasswordString = encryptString(req.body.password)

    // Insert new user - Removed license_number and license_expiration
    const insertQuery = `
      INSERT INTO dmac_webapp_users (name, mobile, email, password, role, verified, verification_token, time_zone, country, address, speciality, contracted_rate_per_consult, province_title, province_id, finance_manager_id, language) 
      VALUES (?)`
    const values = [
      req.body.name,
      req.body.mobile,
      req.body.email,
      hashedPassword,
      'COUNTRY_ADMIN',
      0,
      verificationToken,
      req.body.time_zone,
      req.body.country,
      req.body.address,
      req.body.speciality,
      req.body.contracted_rate_per_consult,
      req.body.provinceTitle,
      req.body.provinceValue,
      req.body.finance_manager_id,
      req.body.languages
    ]

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    // Email setup
    const loginUrl = `${process.env.DOMAIN}signin`
    const verifyLink = `${process.env.DOMAIN}verify-email/${verificationToken}`
    const to = req.body.email
    const subject = 'Welcome to DMAC'

    const greetingHtml = `<p>Dear ${req.body.name},</p>`
    let bodyHtml = `<p>You have successfully registered with DMAC as a COUNTRY_ADMIN.</p>`
    bodyHtml += `<p>Your login details are</p>`
    bodyHtml += `<p>Email: ${req.body.email}</p>`
    bodyHtml += `<p>Password: ${req.body.password}</p>`
    bodyHtml += `<p>Login URL: <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">Click here</a></p>`
    bodyHtml += `<h4>Click the link below to verify your email before login</h4><a href="${verifyLink}">Verify Email</a>`

    const emailHtml = `<div>${greetingHtml}${bodyHtml}</div>`

    // Send email
    try {
      await sendEmail(to, subject, emailHtml, emailHtml)
      return res.status(200).json({
        status: 200,
        msg: getRoleMessage('COUNTRY_ADMIN', 'created', true, true)
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return res.status(500).json({
        status: 500,
        msg: getRoleMessage(
          'COUNTRY_ADMIN',
          'created but failed to send email',
          false
        )
      })
    }
  } catch (err) {
    console.error('Error during registration:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const getCountryAdmins = (req, res) => {
  const query = `
      SELECT 
        u.*,
        u.patient_meta,
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_name
      FROM dmac_webapp_users u
      LEFT JOIN dmac_webapp_language lang
        ON FIND_IN_SET(lang.id, u.language)
      WHERE u.role = 'COUNTRY_ADMIN'
      GROUP BY u.id
    `

  db.query(query, [], (err, data) => {
    if (err) {
      console.error('Error fetching users:', err)
      return res.status(500).json({
        status: 500,
        msg: 'Database error',
        error: err
      })
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: 200,
        msg: `No COUNTRY_ADMIN records found.`
      })
    }

    return res.status(200).json(data)
  })
}

export const updateCountryAdmin = async (req, res) => {
  try {
    const {
      id,
      name,
      mobile,
      time_zone,
      country,
      address,
      speciality,
      contracted_rate_per_consult,
      finance_manager_id,
      languages,
      provinceTitle,
      provinceValue
    } = req.body

    if (!id) {
      return res
        .status(400)
        .json({ status: 400, msg: 'User ID is required for update.' })
    }

    // Removed license_number and license_expiration
    const updateQuery = `
      UPDATE dmac_webapp_users 
      SET 
        name = ?, 
        mobile = ?,
        time_zone = ?, 
        country = ?, 
        address = ?, 
        speciality = ?, 
        contracted_rate_per_consult = ?,
        finance_manager_id = ?,
        language = ?,
        province_title = ?,
        province_id = ?
      WHERE id = ?
    `

    const values = [
      name,
      mobile,
      time_zone,
      country,
      address,
      speciality,
      contracted_rate_per_consult,
      finance_manager_id,
      languages,
      provinceTitle,
      provinceValue,
      id
    ]

    const updateResult = await new Promise((resolve, reject) => {
      db.query(updateQuery, values, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: 404, msg: 'Country Admin not found.' })
    }

    return res.json({
      status: 200,
      msg: 'Country Admin details updated successfully',
      id
    })
  } catch (err) {
    console.error('Error updating user:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const changeCountryAdminStatus = (req, res) => {
  const que = 'UPDATE dmac_webapp_users SET status=? WHERE id=?'
  db.query(que, [req.body.status, req.body.id], (err, data) => {
    if (err) {
      return res.status(500).json(err)
    } else {
      let result = {}
      result.status = 200
      result.msg = 'User status updated successfully'
      result.id = req.body.id
      result.status = req.body.status
      return res.json(result)
    }
  })
}

export const changeCountryAdminPassword = (req, res) => {
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(req.body.password, salt)
  const que = 'UPDATE dmac_webapp_users SET password=? WHERE id=?'
  db.query(que, [hashedPassword, req.body.id], (err, data) => {
    if (err) {
      return res.status(500).json(err)
    } else {
      return res.status(200).json('User Password Reset Successfully')
    }
  })
}
