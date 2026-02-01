import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import sendEmail from '../emailService.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { getRoleMessage } from '../utils/roleMessages.js'

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })

const assertSuperAdmin = async (req, res) => {
  const loggedInUserId = req.user?.userId
  if (!loggedInUserId) {
    res.status(401).json({ message: 'Unauthorized' })
    return false
  }

  const rows = await queryAsync('SELECT role FROM dmac_webapp_users WHERE id = ?', [loggedInUserId])

  const role = Array.isArray(rows) && rows.length > 0 ? rows[0]?.role : null
  if (role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden' })
    return false
  }

  return true
}

const assertPasswordForAdminAction = async (req, res, passwordPlain) => {
  const loggedInUserId = req.user?.userId
  if (!loggedInUserId) {
    res.status(401).json({ message: 'Unauthorized' })
    return false
  }

  const rows = await queryAsync('SELECT password FROM dmac_webapp_users WHERE id = ?', [loggedInUserId])
  const hashed = Array.isArray(rows) && rows.length > 0 ? rows[0]?.password : null

  if (!passwordPlain) {
    res.status(400).json({ message: 'Password is required.' })
    return false
  }

  if (!hashed) {
    res.status(401).json({ message: 'Unauthorized' })
    return false
  }

  const ok = bcrypt.compareSync(String(passwordPlain), String(hashed))
  if (!ok) {
    res.status(401).json({
      message: 'Incorrect password. You are not authorized to add more users.'
    })
    return false
  }

  return true
}

const generatePassword = (length = 8) => {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[crypto.randomInt(0, chars.length)]
  }
  return out
}

export const getPartnersList = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.mobile AS phone,
        u.address,
        u.country,
        u.province_title,
        u.province_id,
        u.time_zone,
        u.created_date,
        u.status,
        COALESCE(pu.allowed_users, 0) AS allowed_users,
        COALESCE(pu.active_users, 0) AS active_users,
        GREATEST(COALESCE(pu.allowed_users, 0) - COALESCE(pu.active_users, 0), 0) AS remaining_users
      FROM dmac_webapp_users u
      LEFT JOIN dmac_webapp_partner_users pu
        ON pu.partner_id = u.id
      WHERE u.role = 'PARTNER'
      ORDER BY u.id DESC
    `

    db.query(query, [], (err, data) => {
      if (err) {
        console.error('Error fetching partners:', err)
        return res.status(500).json({ message: 'Database error', error: err })
      }
      return res.status(200).json(data || [])
    })
  } catch (err) {
    console.error('Error fetching partners list:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const createPartner = async (req, res) => {

  try {
    const ok = await assertSuperAdmin(req, res)

    if (!ok) return

    const {
      name,
      email,
      mobile,
      address,
      country,
      provinceTitle,
      provinceValue,
      time_zone,
      zipcode,
      total_allowed_users,
      allowed_users
    } = req.body || {}

    if (
      !name ||
      !email ||
      !mobile ||
      !address ||
      !country ||
      !provinceTitle ||
      !provinceValue ||
      !zipcode ||
      (total_allowed_users == null && allowed_users == null)
    ) {
      return res
        .status(400)
        .json({ message: 'Missing required fields for partner creation.' })
    }

    const allowedUsersInt = Number(
      allowed_users != null ? allowed_users : total_allowed_users
    )
    if (!Number.isFinite(allowedUsersInt) || allowedUsersInt < 0) {
      return res
        .status(400)
        .json({ message: 'allowed_users must be a non-negative number.' })
    }

    const checkEmailQuery = 'SELECT id FROM dmac_webapp_users WHERE email = ?'
    const existing = await new Promise((resolve, reject) => {
      db.query(checkEmailQuery, [email], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    if (Array.isArray(existing) && existing.length > 0) {
      return res
        .status(409)
        .json('Email already exists. Please try with another email.')
    }

    const passwordPlain = generatePassword(8)
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(passwordPlain, salt)
    const verificationToken = uuidv4()

    const insertUserQuery = `
      INSERT INTO dmac_webapp_users
        (name, mobile, email, password, role, verified, verification_token, time_zone, country, address, province_title, province_id, status, zip_code)
      VALUES (?)
    `

    const userValues = [
      name,
      mobile,
      email,
      hashedPassword,
      'PARTNER',
      0,
      verificationToken,
      time_zone || null,
      country,
      address,
      provinceTitle,
      provinceValue,
      1,
      zipcode
    ]

    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertUserQuery, [userValues], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    const partnerUserId = insertResult?.insertId
    if (!partnerUserId) {
      return res.status(500).json({ message: 'Failed to create partner user.' })
    }

    const insertPartnerUsersQuery = `
      INSERT INTO dmac_webapp_partner_users
        (partner_id, allowed_users, active_users, remaining_users)
      VALUES (?, ?, ?, ?)
    `

    await new Promise((resolve, reject) => {
      db.query(
        insertPartnerUsersQuery,
        [partnerUserId, allowedUsersInt, 0, allowedUsersInt],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    const loginUrl = `${process.env.DOMAIN}login`
    const verifyLink = `${process.env.DOMAIN}verify-email/${verificationToken}`

    const subject = 'Welcome to RM360 as a Partner - Verify Your Email'

    const greetingHtml = `<p>Dear ${name},</p>`
    let bodyHtml = `<p>You have successfully registered with RM360 as a PARTNER.</p>`
    bodyHtml += `<p>Your login details are</p>`
    bodyHtml += `<p>Email: ${email}</p>`
    bodyHtml += `<p>Password: ${passwordPlain}</p>`
    bodyHtml += `<p>Login URL: <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">Click here</a></p>`
    bodyHtml += `<h4>Click the link below to verify your email before login</h4><a href="${verifyLink}">Verify Email</a>`

    const emailHtml = `<div>${greetingHtml}${bodyHtml}</div>`

    try {
      await sendEmail(email, subject, emailHtml, emailHtml)
      return res.status(200).json({
        status: 200,
        msg: getRoleMessage('PARTNER', 'created', true, true)
      })
    } catch (emailError) {
      console.error('Error sending partner email:', emailError)
      return res.status(200).json({
        status: 200,
        msg: getRoleMessage('PARTNER', 'created but failed to send email', true, false)
      })
    }
  } catch (err) {
    console.error('Error creating partner:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const changePartnerStatus = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const { id, status } = req.body || {}
    if (!id || (status !== 0 && status !== 1 && status !== '0' && status !== '1')) {
      return res.status(400).json({ message: 'Invalid id or status' })
    }

    const nextStatus = Number(status)

    const que = `UPDATE dmac_webapp_users SET status = ? WHERE id = ? AND role = 'PARTNER'`
    db.query(que, [nextStatus, id], (err, data) => {
      if (err) {
        return res.status(500).json(err)
      }
      return res.status(200).json({
        status: 200,
        msg: 'Partner status updated successfully',
        id,
        partner_status: nextStatus
      })
    })
  } catch (err) {
    console.error('Error updating partner status:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const changePartnerPassword = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const { id, password } = req.body || {}
    if (!id || !password) {
      return res.status(400).json({ message: 'Partner id and password required' })
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(String(password), salt)

    const que = `UPDATE dmac_webapp_users SET password = ? WHERE id = ? AND role = 'PARTNER'`
    db.query(que, [hashedPassword, id], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err })
      }
      return res.status(200).json({ status: 200, msg: 'Partner password updated successfully' })
    })
  } catch (err) {
    console.error('Error updating partner password:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const updatePartner = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const {
      id,
      name,
      email,
      mobile,
      address,
      country,
      provinceTitle,
      provinceValue,
      time_zone,
      zipcode,
      allowed_users
    } = req.body || {}

    if (!id || !name || !email || !mobile || !address || !country || !provinceTitle || !provinceValue) {
      return res.status(400).json({ message: 'Missing required fields for partner update.' })
    }

    const allowedUsersInt = allowed_users == null ? null : Number(allowed_users)
    if (allowedUsersInt != null && (!Number.isFinite(allowedUsersInt) || allowedUsersInt < 0)) {
      return res.status(400).json({ message: 'allowed_users must be a non-negative number.' })
    }

    // Ensure email is unique (excluding current partner)
    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM dmac_webapp_users WHERE email = ? AND id <> ?',
        [email, id],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json('Email already exists. Please try with another email.')
    }

    const updateUserQuery = `
      UPDATE dmac_webapp_users
      SET
        name = ?,
        mobile = ?,
        email = ?,
        address = ?,
        country = ?,
        province_title = ?,
        province_id = ?,
        time_zone = ?,
        zip_code = ?
      WHERE id = ? AND role = 'PARTNER'
    `

    await new Promise((resolve, reject) => {
      db.query(
        updateUserQuery,
        [
          name,
          mobile,
          email,
          address,
          country,
          provinceTitle,
          provinceValue,
          time_zone || null,
          zipcode || null,
          id
        ],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    if (allowedUsersInt != null) {
      // All license/counter activity is stored in dmac_webapp_partner_users
      // (do not rely on any mapping columns in dmac_webapp_users).
      const existingRows = await queryAsync(
        'SELECT active_users FROM dmac_webapp_partner_users WHERE partner_id = ?',
        [id]
      )
      const existingActive =
        Array.isArray(existingRows) && existingRows.length > 0
          ? Number(existingRows?.[0]?.active_users ?? 0)
          : 0

      const remainingUsers = Math.max(allowedUsersInt - existingActive, 0)

      await queryAsync(
        `INSERT INTO dmac_webapp_partner_users (partner_id, allowed_users, active_users, remaining_users)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           allowed_users = VALUES(allowed_users),
           active_users = active_users,
           remaining_users = VALUES(remaining_users)`,
        [id, allowedUsersInt, existingActive, remainingUsers]
      )
    }

    return res.status(200).json({ status: 200, msg: 'Partner updated successfully' })
  } catch (err) {
    console.error('Error updating partner:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const addMorePartnerUsers = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const { partner_id, added_users, password } = req.body || {}

    const partnerIdInt = Number(partner_id)
    const addedUsersInt = Number(added_users)

    if (!Number.isFinite(partnerIdInt) || partnerIdInt <= 0) {
      return res.status(400).json({ message: 'Invalid partner_id' })
    }

    if (!Number.isFinite(addedUsersInt) || !Number.isInteger(addedUsersInt) || addedUsersInt <= 0) {
      return res.status(400).json({ message: 'added_users must be a positive integer.' })
    }

    const passwordOk = await assertPasswordForAdminAction(req, res, password)
    if (!passwordOk) return

    const partnerRows = await queryAsync(
      "SELECT id FROM dmac_webapp_users WHERE id = ? AND role = 'PARTNER'",
      [partnerIdInt]
    )
    if (!Array.isArray(partnerRows) || partnerRows.length === 0) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const currentRows = await queryAsync(
      'SELECT allowed_users, active_users FROM dmac_webapp_partner_users WHERE partner_id = ?',
      [partnerIdInt]
    )

    const currentAllowed =
      Array.isArray(currentRows) && currentRows.length > 0
        ? Number(currentRows?.[0]?.allowed_users ?? 0)
        : 0
    const activeUsers =
      Array.isArray(currentRows) && currentRows.length > 0
        ? Number(currentRows?.[0]?.active_users ?? 0)
        : 0

    const nextAllowed = currentAllowed + addedUsersInt
    const remainingUsers = Math.max(nextAllowed - activeUsers, 0)

    await queryAsync(
      `INSERT INTO dmac_webapp_partner_users (partner_id, allowed_users, active_users, remaining_users)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         allowed_users = VALUES(allowed_users),
         active_users = active_users,
         remaining_users = VALUES(remaining_users)` ,
      [partnerIdInt, nextAllowed, activeUsers, remainingUsers]
    )

    const addedBy = req.user?.userId
    await queryAsync(
      `INSERT INTO dmac_webapp_partner_allowed_user_additions
        (partner_id, added_users, added_by)
       VALUES (?, ?, ?)` ,
      [partnerIdInt, addedUsersInt, addedBy]
    )

    return res.status(200).json({
      status: 200,
      msg: 'Allowed users updated successfully',
      data: {
        partner_id: partnerIdInt,
        allowed_users: nextAllowed,
        active_users: activeUsers,
        remaining_users: remainingUsers
      }
    })
  } catch (err) {
    console.error('Error adding more partner users:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const getPartnerAddedUsersHistory = async (req, res) => {
  try {
    const ok = await assertSuperAdmin(req, res)
    if (!ok) return

    const { partner_id } = req.body || {}
    const partnerIdInt = Number(partner_id)
    if (!Number.isFinite(partnerIdInt) || partnerIdInt <= 0) {
      return res.status(400).json({ message: 'Invalid partner_id' })
    }

    const rows = await queryAsync(
      `SELECT
        a.id,
        a.partner_id,
        a.added_users,
        a.added_date,
        a.added_by
      FROM dmac_webapp_partner_allowed_user_additions a
      WHERE a.partner_id = ?
      ORDER BY a.added_date DESC`,
      [partnerIdInt]
    )

    return res.status(200).json({ status: 200, data: rows || [] })
  } catch (err) {
    console.error('Error fetching partner added users history:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
