import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import sendEmail from '../emailService.js'
import { client } from '../paypalConfig.js'
import paypal from '@paypal/checkout-server-sdk'

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })

const assertPartner = async (req, res) => {
  const partnerId = req.user?.userId
  if (!partnerId) {
    res.status(401).json({ message: 'Unauthorized' })
    return null
  }

  const rows = await queryAsync(
    'SELECT id, role, status FROM dmac_webapp_users WHERE id = ? LIMIT 1',
    [partnerId]
  )
  const row = Array.isArray(rows) && rows.length ? rows[0] : null

  if (!row || row.status !== 1) {
    res.status(401).json({ message: 'Unauthorized' })
    return null
  }

  if (row.role !== 'PARTNER') {
    res.status(403).json({ message: 'Forbidden' })
    return null
  }

  return Number(row.id)
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

const USER_SLOT_UNIT_PRICE_USD = 19.99

const validateUsersToAdd = (raw) => {
  const n = Number(raw)
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, message: 'Users to add must be a whole number.' }
  }
  if (n <= 0) {
    return { ok: false, message: 'Users to add must be a positive number.' }
  }
  if (n > 100) {
    return { ok: false, message: 'Maximum users you can add is 100.' }
  }
  if (n % 10 !== 0) {
    return {
      ok: false,
      message: 'You can add users only in multiples of 10.'
    }
  }
  return { ok: true, value: n }
}

const sendPartnerPurchaseEmail = async ({
  partnerId,
  status,
  addedUsers,
  unitPrice,
  amount,
  orderId,
  paymentId,
  failureReason
}) => {
  try {
    const rows = await queryAsync(
      'SELECT name, email FROM dmac_webapp_users WHERE id = ? LIMIT 1',
      [partnerId]
    )
    const partner = Array.isArray(rows) && rows.length ? rows[0] : null
    if (!partner?.email) return

    const subject =
      status === 'COMPLETED'
        ? 'User Slots Purchase Successful'
        : 'User Slots Purchase Failed'

    const greetingHtml = `<p>Dear ${partner?.name ?? 'Partner'},</p>`

    const baseDetails = `
      <p><b>Purchase Details</b></p>
      <p>Users added: ${addedUsers}</p>
      <p>Unit price: $${Number(unitPrice).toFixed(2)}</p>
      <p>Total amount: $${Number(amount).toFixed(2)}</p>
      <p>Order ID: ${orderId || 'N/A'}</p>
      <p>Payment ID: ${paymentId || 'N/A'}</p>
    `

    const statusHtml =
      status === 'COMPLETED'
        ? `<p style="color: #15803d;"><b>Status: SUCCESS</b></p>`
        : `<p style="color: #b91c1c;"><b>Status: FAILED</b></p>
           <p>Reason: ${failureReason || 'Payment failed or was cancelled.'}</p>`

    const emailHtml = `<div>${greetingHtml}${statusHtml}${baseDetails}</div>`

    await sendEmail(partner.email, subject, emailHtml, emailHtml)
  } catch (e) {
    console.error('sendPartnerPurchaseEmail error:', e)
  }
}

export const getPartnerConsentSignatures = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const rows = await queryAsync(
      'SELECT form1_signature, form2_signature, form3_signature FROM dmac_webapp_partner_consents WHERE partner_id = ?',
      [partnerId]
    )

    const row = Array.isArray(rows) && rows.length ? rows[0] : null
    if (!row) {
      return res.json({ signatures: ['', '', ''] })
    }

    return res.json({
      signatures: [
        row.form1_signature || '',
        row.form2_signature || '',
        row.form3_signature || ''
      ]
    })
  } catch (err) {
    console.error('getPartnerConsentSignatures error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const savePartnerConsentSignatures = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const { signatures } = req.body || {}
    if (!Array.isArray(signatures) || signatures.length !== 3) {
      return res.status(400).json({ error: 'Invalid input' })
    }

    await queryAsync(
      `INSERT INTO dmac_webapp_partner_consents (partner_id, form1_signature, form2_signature, form3_signature)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         form1_signature = VALUES(form1_signature),
         form2_signature = VALUES(form2_signature),
         form3_signature = VALUES(form3_signature),
         updated_at = CURRENT_TIMESTAMP`,
      [partnerId, signatures[0], signatures[1], signatures[2]]
    )

    return res.json({ success: true })
  } catch (err) {
    console.error('savePartnerConsentSignatures error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export const getPartnerUsersSummary = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const rows = await queryAsync(
      `SELECT allowed_users, active_users, remaining_users, price_per_user
       FROM dmac_webapp_partner_users
       WHERE partner_id = ?
       LIMIT 1`,
      [partnerId]
    )

    const row = Array.isArray(rows) && rows.length ? rows[0] : null

    return res.status(200).json({
      allowed_users: Number(row?.allowed_users ?? 0),
      active_users: Number(row?.active_users ?? 0),
      remaining_users: Number(row?.remaining_users ?? 0),
      price_per_user: Number(row?.price_per_user ?? USER_SLOT_UNIT_PRICE_USD)
    })
  } catch (err) {
    console.error('getPartnerUsersSummary error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const listPartnerUsers = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const rows = await queryAsync(
      `SELECT
         u.*, 
         l.language AS language_name
       FROM dmac_webapp_users u
       LEFT JOIN dmac_webapp_language l
         ON l.id = u.language
       WHERE u.role = 'USER'
         AND u.partner_id = ?
       ORDER BY u.id DESC`,
      [partnerId]
    )

    return res.status(200).json(rows || [])
  } catch (err) {
    console.error('listPartnerUsers error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createPartnerUser = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const {
      name,
      email,
      mobile,
      age,
      otherInfo
    } = req.body || {}

    if (!name || !email || !mobile || age === undefined || age === null) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    const ageNumber = Number(age)
    if (!Number.isFinite(ageNumber) || !Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 100) {
      return res.status(400).json({ message: 'Invalid age. Must be an integer between 1 and 100.' })
    }

    const plainPassword = generatePassword(8)

    const counters = await queryAsync(
      `SELECT allowed_users, active_users, remaining_users
       FROM dmac_webapp_partner_users
       WHERE partner_id = ?
       LIMIT 1`,
      [partnerId]
    )

    const counterRow = Array.isArray(counters) && counters.length ? counters[0] : null
    const remaining = Number(counterRow?.remaining_users ?? 0)
    if (remaining <= 0) {
      return res.status(400).json({ message: 'No remaining user slots available.' })
    }

    const existing = await queryAsync(
      'SELECT id FROM dmac_webapp_users WHERE email = ? LIMIT 1',
      [email]
    )

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists. Please try with another email.' })
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(plainPassword, salt)
    const verificationToken = uuidv4()
    const otherInfoJson = JSON.stringify(otherInfo ?? {})

    const insertQuery = `
      INSERT INTO dmac_webapp_users
      (name, age, email, mobile, password, verified, verification_token, role, patient_meta, partner_id, status, language)
      VALUES (?)`

    const values = [
      name,
      ageNumber,
      email,
      mobile,
      hashedPassword,
      0,
      verificationToken,
      'USER',
      otherInfoJson,
      partnerId,
      1,
      1
    ]

    const insertResult = await queryAsync(insertQuery, [values])
    const userId = insertResult?.insertId

    await queryAsync(
      `UPDATE dmac_webapp_partner_users
       SET active_users = COALESCE(active_users, 0) + 1,
           remaining_users = GREATEST(COALESCE(remaining_users, 0) - 1, 0)
       WHERE partner_id = ?`,
      [partnerId]
    )

    const loginUrl = `${process.env.DOMAIN}patient/login`
    const verifyLink = `${process.env.DOMAIN}patient/email/verify/${verificationToken}`

    const subject = 'RM360 – Cognitive Screening Repository Program Access'

    const emailHtml = `
      <div>
        <h2>RM360 – Cognitive Screening Repository Program Access</h2>
        <p>Dear ${name},</p>
        <p>You have been registered to participate in the RM360 – Cognitive Screening Repository Program (C-SARP).</p>
        <p>You will be able to complete your baseline cognitive screening using the secure link provided below.</p>

        <h4>Parental Consent for Minors</h4>
        <p>For athletes under 18 years of age, a parent or legal guardian must review and electronically sign a Parental Consent and Permission Form before the C-SARP screening can proceed.</p>

        <h4>Login Instructions</h4>
        <p>Please click the URL below to access the login page:</p>
        <p>Portal URL: <a href="${verifyLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Click Here</a></p>
        <p>Login ID: ${email}</p>
        <p>Temporary Password: ${plainPassword}</p>
        <p>(You will be prompted to change your password after your first login.)</p>

        <p>If you have any questions or need assistance, please contact our support team:</p>
        <p>Email: help@regainmemory360.com</p>

        <p>Thank you for participating in RM360 and supporting proactive brain health.</p>
      </div>
    `

    try {
      await sendEmail(email, subject, emailHtml, emailHtml)
    } catch (emailError) {
      console.error('Error sending partner user email:', emailError)
      // user is created; do not fail the request
    }

    return res.status(200).json({
      success: true,
      message: 'User created successfully. Verification email sent.',
      id: userId
    })
  } catch (err) {
    console.error('createPartnerUser error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updatePartnerUser = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const {
      id,
      name,
      mobile,
      age,
    } = req.body || {}

    if (!id) {
      return res.status(400).json({ message: 'Missing user id.' })
    }

    const rows = await queryAsync(
      'SELECT id FROM dmac_webapp_users WHERE id = ? AND partner_id = ? AND role = \'USER\' LIMIT 1',
      [Number(id), partnerId]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const ageNumber = age === undefined || age === null ? null : Number(age)
    if (ageNumber !== null && (!Number.isFinite(ageNumber) || !Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 100)) {
      return res.status(400).json({ message: 'Invalid age. Must be an integer between 1 and 100.' })
    }

    await queryAsync(
      `UPDATE dmac_webapp_users
       SET name = ?,
           mobile = ?,
           age = ?
       WHERE id = ?
         AND partner_id = ?
         AND role = 'USER'`,
      [
        name ?? null,
        mobile ?? null,
        ageNumber,
        Number(id),
        partnerId
      ]
    )

    return res.status(200).json({ success: true, message: 'User updated successfully.' })
  } catch (err) {
    console.error('updatePartnerUser error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createPartnerUserSlotsPayment = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const { usersToAdd } = req.body || {}
    const validated = validateUsersToAdd(usersToAdd)
    if (!validated.ok) {
      return res.status(400).json({ message: validated.message })
    }

    const priceRows = await queryAsync(
      `SELECT price_per_user
       FROM dmac_webapp_partner_users
       WHERE partner_id = ?
       LIMIT 1`,
      [partnerId]
    )
    const priceRow = Array.isArray(priceRows) && priceRows.length ? priceRows[0] : null
    const unitPrice = Number(priceRow?.price_per_user ?? USER_SLOT_UNIT_PRICE_USD)
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return res.status(500).json({ message: 'Invalid price configuration for partner.' })
    }

    const addedUsers = validated.value
    const amountToPay = Number((addedUsers * unitPrice).toFixed(2))

    const createOrderRequest = new paypal.orders.OrdersCreateRequest()
    createOrderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: String(amountToPay)
          }
        }
      ]
    })

    const order = await client().execute(createOrderRequest)
    const orderId = order?.result?.id
    if (!orderId) {
      return res.status(500).json({ message: 'Error creating PayPal order' })
    }

    await queryAsync(
      `INSERT INTO dmac_webapp_partner_users_transactions
        (partner_id, order_id, added_users, unit_price, amount_expected, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        partnerId,
        String(orderId),
        addedUsers,
        unitPrice,
        amountToPay,
        'USD',
        'CREATED'
      ]
    )

    return res.json({
      success: true,
      orderId,
      amountToPay,
      unitPrice,
      addedUsers
    })
  } catch (err) {
    console.error('createPartnerUserSlotsPayment error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const capturePartnerUserSlotsPayment = async (req, res) => {
  let partnerId = null
  let txRow = null

  try {
    partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const { orderId, payerId, currencyCode } = req.body || {}
    if (!orderId || !payerId) {
      return res.status(400).json({ message: 'orderId and payerId are required' })
    }

    const rows = await queryAsync(
      `SELECT *
       FROM dmac_webapp_partner_users_transactions
       WHERE order_id = ? AND partner_id = ?
       LIMIT 1`,
      [String(orderId), partnerId]
    )
    txRow = Array.isArray(rows) && rows.length ? rows[0] : null

    if (!txRow) {
      return res.status(404).json({ message: 'Transaction not found.' })
    }

    if (String(txRow.status) === 'COMPLETED') {
      return res.json({ success: true, message: 'Already completed.' })
    }

    const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(String(orderId))
    captureOrderRequest.requestBody({ payer_id: String(payerId) })

    const captureResult = await client().execute(captureOrderRequest)
    const paymentStatus = captureResult?.result?.status
    const paymentId = captureResult?.result?.id

    const capturedAmountValue =
      captureResult?.result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
        ?.value ?? null
    const capturedAmount =
      capturedAmountValue !== null ? Number(capturedAmountValue) : null

    const expected = Number(Number(txRow.amount_expected).toFixed(2))
    const expectedCurrency = String(txRow.currency || 'USD')
    const incomingCurrency = String(currencyCode || expectedCurrency)

    if (capturedAmount === null || !Number.isFinite(capturedAmount)) {
      throw new Error('CAPTURE_AMOUNT_MISSING')
    }

    if (Number(capturedAmount.toFixed(2)) !== expected) {
      throw new Error('AMOUNT_MISMATCH')
    }

    if (incomingCurrency && incomingCurrency !== expectedCurrency) {
      throw new Error('CURRENCY_MISMATCH')
    }

    if (paymentStatus !== 'COMPLETED') {
      await queryAsync(
        `UPDATE dmac_webapp_partner_users_transactions
         SET status = ?, payment_id = ?, payer_id = ?, amount_captured = ?, failure_reason = ?, completed_at = NOW()
         WHERE id = ?`,
        [
          'FAILED',
          paymentId || null,
          String(payerId),
          Number(capturedAmount.toFixed(2)),
          `PAYMENT_NOT_COMPLETED:${String(paymentStatus)}`,
          txRow.id
        ]
      )

      await sendPartnerPurchaseEmail({
        partnerId,
        status: 'FAILED',
        addedUsers: Number(txRow.added_users),
        unitPrice: Number(txRow.unit_price),
        amount: expected,
        orderId: String(orderId),
        paymentId: paymentId || null,
        failureReason: `Payment status: ${String(paymentStatus)}`
      })

      return res.status(400).json({ message: 'Payment not completed.' })
    }

    await queryAsync('START TRANSACTION')

    try {
      await queryAsync(
        `UPDATE dmac_webapp_partner_users_transactions
         SET status = ?, payment_id = ?, payer_id = ?, amount_captured = ?, currency = ?, failure_reason = NULL, completed_at = NOW()
         WHERE id = ?`,
        [
          'COMPLETED',
          paymentId || null,
          String(payerId),
          Number(capturedAmount.toFixed(2)),
          expectedCurrency,
          txRow.id
        ]
      )

      await queryAsync(
        `INSERT INTO dmac_webapp_partner_allowed_user_additions
         (partner_id, added_users, added_by)
         VALUES (?, ?, ?)`,
        [partnerId, Number(txRow.added_users), partnerId]
      )

      await queryAsync(
        `UPDATE dmac_webapp_partner_users
         SET allowed_users = COALESCE(allowed_users, 0) + ?,
             remaining_users = COALESCE(remaining_users, 0) + ?
         WHERE partner_id = ?`,
        [Number(txRow.added_users), Number(txRow.added_users), partnerId]
      )

      await queryAsync('COMMIT')
    } catch (e) {
      await queryAsync('ROLLBACK')
      throw e
    }

    await sendPartnerPurchaseEmail({
      partnerId,
      status: 'COMPLETED',
      addedUsers: Number(txRow.added_users),
      unitPrice: Number(txRow.unit_price),
      amount: expected,
      orderId: String(orderId),
      paymentId: paymentId || null
    })

    return res.json({
      success: true,
      message: 'Payment captured successfully',
      orderId: String(orderId),
      paymentId: paymentId || null
    })
  } catch (err) {
    console.error('capturePartnerUserSlotsPayment error:', err)

    try {
      if (partnerId && txRow?.id) {
        await queryAsync(
          `UPDATE dmac_webapp_partner_users_transactions
           SET status = ?, failure_reason = ?
           WHERE id = ?`,
          ['FAILED', String(err?.message ?? err), txRow.id]
        )

        await sendPartnerPurchaseEmail({
          partnerId,
          status: 'FAILED',
          addedUsers: Number(txRow.added_users ?? 0),
          unitPrice: Number(txRow.unit_price ?? USER_SLOT_UNIT_PRICE_USD),
          amount: Number(Number(txRow.amount_expected ?? 0).toFixed(2)),
          orderId: String(txRow.order_id ?? ''),
          paymentId: txRow.payment_id ?? null,
          failureReason: String(err?.message ?? err)
        })
      }
    } catch (e) {
      console.error('Failed updating partner tx to FAILED:', e)
    }

    return res.status(500).json({ message: 'Server error' })
  }
}

export const cancelPartnerUserSlotsPayment = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const { orderId, reason } = req.body || {}
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' })
    }

    const rows = await queryAsync(
      `SELECT *
       FROM dmac_webapp_partner_users_transactions
       WHERE order_id = ? AND partner_id = ?
       LIMIT 1`,
      [String(orderId), partnerId]
    )
    const tx = Array.isArray(rows) && rows.length ? rows[0] : null
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found.' })
    }

    if (String(tx.status) !== 'COMPLETED') {
      await queryAsync(
        `UPDATE dmac_webapp_partner_users_transactions
         SET status = ?, failure_reason = ?
         WHERE id = ?`,
        ['CANCELLED', String(reason || 'CANCELLED_BY_USER'), tx.id]
      )

      await sendPartnerPurchaseEmail({
        partnerId,
        status: 'FAILED',
        addedUsers: Number(tx.added_users ?? 0),
        unitPrice: Number(tx.unit_price ?? USER_SLOT_UNIT_PRICE_USD),
        amount: Number(Number(tx.amount_expected ?? 0).toFixed(2)),
        orderId: String(orderId),
        paymentId: tx.payment_id ?? null,
        failureReason: String(reason || 'Cancelled by user')
      })
    }

    return res.json({ success: true })
  } catch (err) {
    console.error('cancelPartnerUserSlotsPayment error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const changePartnerUserPassword = async (req, res) => {
  try {
    const partnerId = await assertPartner(req, res)
    if (!partnerId) return

    const { id, new_password } = req.body || {}
    if (!id || !new_password) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    const rows = await queryAsync(
      'SELECT id FROM dmac_webapp_users WHERE id = ? AND partner_id = ? AND role = \'USER\' LIMIT 1',
      [Number(id), partnerId]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(String(new_password), salt)

    await queryAsync(
      'UPDATE dmac_webapp_users SET password = ? WHERE id = ? AND partner_id = ? AND role = \'USER\'',
      [hashedPassword, Number(id), partnerId]
    )

    return res.status(200).json({ success: true, message: 'Password updated successfully.' })
  } catch (err) {
    console.error('changePartnerUserPassword error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
