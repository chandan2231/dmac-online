import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import sendEmail from '../emailService.js'
import { getUserInfo, getUserInfoByProtocolId } from '../userData.js'
import { v4 as uuidv4 } from 'uuid'
import { getRoleMessage } from '../utils/roleMessages.js'
import crypto from 'crypto'

export const changeProductStatus = (req, res) => {
  const que = 'UPDATE dmac_webapp_products SET status=? WHERE id=?'
  db.query(que, [req.body.status, req.body.id], (err, data) => {
    if (err) {
      return res.status(500).json(err)
    } else {
      let result = {}
      result.status = 200
      result.msg = 'Product status updated successfully'
      result.id = req.body.id
      result.status = req.body.status
      return res.json(result)
    }
  })
}

export const updateProductDetails = async (req, res) => {
  try {
    const { id, product_name, product_description, product_amount, status } =
      req.body

    if (
      !id ||
      !product_name ||
      !product_description ||
      product_amount == null
    ) {
      return res
        .status(400)
        .json({ status: 400, msg: 'Missing required fields' })
    }

    const query = `
      UPDATE dmac_webapp_products 
      SET product_name = ?, product_description = ?, product_amount = ? 
      WHERE id = ?
    `

    const values = [product_name, product_description, product_amount, id]

    db.query(query, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ status: 500, msg: 'Database error', error: err })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 404, msg: 'Product not found' })
      }

      return res.json({
        status: 200,
        msg: 'Product details updated successfully',
        id,
        product_status: status ?? null
      })
    })
  } catch (error) {
    return res.status(500).json({ status: 500, msg: 'Server error', error })
  }
}

export const createProduct = (req, res) => {
  const { product_name, product_description, product_amount } = req.body

  if (!product_name || !product_description || product_amount == null) {
    return res.status(400).json({ status: 400, msg: 'Missing required fields' })
  }

  const query = `
    INSERT INTO dmac_webapp_products
      (product_name, product_description, subscription_list, feature, product_amount, upgrade_priority, status, created_date, updated_date)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `

  const values = [
    product_name,
    product_description,
    String(product_name),
    '[]',
    product_amount,
    null,
    1
  ]

  db.query(query, values, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: 500, msg: 'Database error', error: err })
    }

    return res.json({
      status: 200,
      msg: 'Product created successfully',
      id: result?.insertId
    })
  })
}

export const getProductList = (req, res) => {
  const que = 'SELECT * FROM dmac_webapp_products'
  db.query(que, [], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const createUsersByRole = async (req, res) => {
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
    // Insert new user
    const insertQuery = `
      INSERT INTO dmac_webapp_users (name, mobile, email, password, role, verified, verification_token, time_zone, country, address, speciality, license_number, license_expiration, contracted_rate_per_consult, province_title, province_id, finance_manager_id, language) 
      VALUES (?)`
    const values = [
      req.body.name,
      req.body.mobile,
      req.body.email,
      hashedPassword,
      req.body.role,
      0,
      verificationToken,
      req.body.time_zone,
      req.body.country,
      req.body.address,
      req.body.speciality,
      req.body.license_number,
      req.body.license_expiration,
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
    let bodyHtml = `<p>You have successfully registered with DMAC as a ${req.body.role}.</p>`
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
        msg: getRoleMessage(req.body.role, 'created', true, true)
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return res.status(500).json({
        status: 500,
        msg: getRoleMessage(
          req.body.role,
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

export const getAllUsersByRole = (req, res) => {
  const { role } = req.body
  const loggedInUserId = req.user.userId

  const userQuery = 'SELECT role, country FROM dmac_webapp_users WHERE id = ?'

  db.query(userQuery, [loggedInUserId], (err, userData) => {
    if (err) {
      console.error('Error fetching logged in user:', err)
      return res
        .status(500)
        .json({ status: 500, msg: 'Database error', error: err })
    }

    if (userData.length === 0) {
      return res
        .status(404)
        .json({ status: 404, msg: 'Logged in user not found' })
    }

    const loggedInUser = userData[0]
    let query
    let values = [role]

    // If the role is USER (single language)
    if (role === 'USER') {
      query = `
      SELECT 
        u.*,
        u.patient_meta,
        l.language AS language_name
      FROM dmac_webapp_users u
      LEFT JOIN dmac_webapp_language l 
        ON u.language = l.id
      WHERE u.role = ?
    `
    }
    // For therapist or other roles (multiple languages possible)
    else {
      query = `
      SELECT 
        u.*,
        u.patient_meta,
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_name
      FROM dmac_webapp_users u
      LEFT JOIN dmac_webapp_language lang
        ON FIND_IN_SET(lang.id, u.language)
      WHERE u.role = ?
    `
    }

    if (loggedInUser.role === 'COUNTRY_ADMIN') {
      query += ' AND u.country = ?'
      values.push(loggedInUser.country)
    }

    if (role !== 'USER') {
      query += ' GROUP BY u.id'
    }

    db.query(query, values, (err, data) => {
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
          msg: `No ${role} records found.`
        })
      }

      return res.status(200).json(data)
    })
  })
}

export const updateUsersDetails = async (req, res) => {
  try {
    const {
      id,
      name,
      mobile,
      time_zone,
      country,
      address,
      speciality,
      license_number,
      license_expiration,
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

    const updateQuery = `
      UPDATE dmac_webapp_users 
      SET 
        name = ?, 
        mobile = ?,
        time_zone = ?, 
        country = ?, 
        address = ?, 
        speciality = ?, 
        license_number = ?, 
        license_expiration = ?, 
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
      license_number,
      license_expiration,
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
      return res.status(404).json({ status: 404, msg: 'Consultant not found.' })
    }

    return res.json({
      status: 200,
      msg: 'Consultant details updated successfully',
      id
    })
  } catch (err) {
    console.error('Error updating user:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const changeUserStatus = (req, res) => {
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

export const changeUserPassword = (req, res) => {
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

export const getUsersTransactionList = (req, res) => {
  const loggedInUserId = req.user.userId
  const userQuery = 'SELECT role, country FROM dmac_webapp_users WHERE id = ?'

  db.query(userQuery, [loggedInUserId], (err, userData) => {
    if (err) {
      console.error('Error fetching logged in user:', err)
      return res.status(500).json(err)
    }

    if (userData.length === 0) {
      return res.status(404).json({ message: 'Logged in user not found' })
    }

    const loggedInUser = userData[0]

    let que = `SELECT trans.*, users.name AS name, users.email, product.product_name AS product_name, product.product_description as product_description 
       FROM dmac_webapp_users_transaction as trans 
       JOIN dmac_webapp_users AS users ON trans.user_id = users.id 
       JOIN dmac_webapp_products AS product ON trans.product_id = product.id`

    const params = []

    if (loggedInUser.role === 'COUNTRY_ADMIN') {
      que += ' WHERE users.country = ?'
      params.push(loggedInUser.country)
    }

    que += ' ORDER BY trans.id DESC'

    db.query(que, params, (err, data) => {
      if (err) return res.status(500).json(err)
      if (data.length > 0) {
        return res.status(200).json(data)
      } else {
        return res.status(404).json({ message: 'No transactions found.' })
      }
    })
  })
}

export const getConsultationList = (req, res) => {
  const { consultant_id, consultant_role } = req.body
  const loggedInUserId = req.user.userId
  const userQuery = 'SELECT role, country FROM dmac_webapp_users WHERE id = ?'

  db.query(userQuery, [loggedInUserId], (err, userData) => {
    if (err) {
      console.error('Error fetching logged in user:', err)
      return res.status(500).json(err)
    }

    if (userData.length === 0) {
      return res.status(404).json({ message: 'Logged in user not found' })
    }

    const loggedInUser = userData[0]

    const tableName =
      consultant_role === 'THERAPIST'
        ? 'dmac_webapp_therapist_consultations'
        : 'dmac_webapp_consultations'

    let que = `
    SELECT 
      cons.*, 
      u.name AS user_name, 
      u.email AS user_email, 
      c.name AS consultant_name,
      c.email AS consultant_email,
      c.country AS consultation_country,
      p.product_name, 
      p.product_description
    FROM ${tableName} AS cons
    JOIN dmac_webapp_users AS u 
      ON cons.user_id = u.id
    JOIN dmac_webapp_users AS c
      ON cons.consultant_id = c.id
    JOIN dmac_webapp_products AS p 
      ON cons.product_id = p.id
  `

    const params = []
    const conditions = []

    if (consultant_id) {
      conditions.push(`cons.consultant_id = ?`)
      params.push(consultant_id)
    }

    if (consultant_role) {
      conditions.push(`c.role = ?`)
      params.push(consultant_role)
    }

    if (loggedInUser.role === 'COUNTRY_ADMIN') {
      if (!consultant_id) {
        conditions.push(`c.country = ?`)
        params.push(loggedInUser.country)
      }
    }

    if (conditions.length > 0) {
      que += ` WHERE ` + conditions.join(' AND ')
    }

    que += ` ORDER BY cons.id DESC`

    db.query(que, params, (err, data) => {
      if (err) {
        return res.status(500).json(err)
      }
      return res.status(200).json(data || [])
    })
  })
}

function encryptString(original) {
  const cipher = crypto.createCipheriv(
    process.env.CRYPTO_ALGORITHM,
    Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex'),
    Buffer.alloc(16, 0)
  )
  let encrypted = cipher.update(original, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

function decryptString(encoded) {
  const decipher = crypto.createDecipheriv(
    process.env.CRYPTO_ALGORITHM,
    Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex'),
    Buffer.alloc(16, 0)
  )
  let decrypted = decipher.update(encoded, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export const getPatientDocuments = async (req, res) => {
  const { patient_id } = req.body

  if (!patient_id) {
    return res.status(400).json({ message: 'Patient ID is required' })
  }

  try {
    const query =
      'SELECT * FROM dmac_webapp_patient_documents WHERE user_id = ? ORDER BY created_at DESC'
    const documents = await new Promise((resolve, reject) => {
      db.query(query, [patient_id], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
    res.status(200).json({ status: 200, data: documents })
  } catch (error) {
    console.error('Error fetching patient documents:', error)
    res.status(500).json({ message: 'Error fetching documents' })
  }
}

export const getPatientAssessmentStatus = async (req, res) => {
  const { patient_id } = req.body

  if (!patient_id) {
    return res.status(400).json({ message: 'Patient ID is required' })
  }

  try {
    const tables = [
      'dmac_webapp_assessment_cat',
      'dmac_webapp_assessment_sat',
      'dmac_webapp_assessment_dat',
      'dmac_webapp_assessment_adt',
      'dmac_webapp_assessment_disclaimer',
      'dmac_webapp_assessment_research_consent'
    ]
    const results = {}
    const keyMap = {
      dmac_webapp_assessment_cat: 'cat',
      dmac_webapp_assessment_sat: 'sat',
      dmac_webapp_assessment_dat: 'dat',
      dmac_webapp_assessment_adt: 'adt',
      dmac_webapp_assessment_disclaimer: 'disclaimer',
      dmac_webapp_assessment_research_consent: 'consent'
    }

    for (const table of tables) {
      const query = `SELECT data FROM ${table} WHERE user_id = ? ORDER BY id DESC LIMIT 1`
      const result = await new Promise((resolve, reject) => {
        db.query(query, [patient_id], (err, data) => {
          if (err) reject(err)
          resolve(data)
        })
      })
      results[keyMap[table]] = result.length > 0 ? result[0].data : null
    }

    res.status(200).json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching assessment status' })
  }
}

export const getPatientMedicalHistory = async (req, res) => {
  const { patient_id } = req.body

  if (!patient_id) {
    return res.status(400).json({ message: 'Patient ID is required' })
  }

  try {
    const query =
      'SELECT id, user_id, data, created_at FROM dmac_webapp_medical_history WHERE user_id = ? ORDER BY id DESC LIMIT 1'

    const rows = await new Promise((resolve, reject) => {
      db.query(query, [patient_id], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    const latest = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    return res.status(200).json({ status: 200, data: latest })
  } catch (error) {
    console.error('Error fetching patient medical history:', error)
    return res.status(500).json({ message: 'Error fetching medical history' })
  }
}
