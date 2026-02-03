import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmail from '../emailService.js'
import { v4 as uuidv4 } from 'uuid'
import { client } from '../paypalConfig.js'
import paypal from '@paypal/checkout-server-sdk'
import crypto from 'crypto'
import moment from 'moment'
import {
  computeUpgradeCharge,
  getProductById,
  getUserLatestCompletedProduct,
  hasLiccaSubscription
} from './commonService.js'
import {
  hasSDMAC,
  hasSDMACExpertAdvice,
  hasSDMACLicca,
  hasRM360Pack,
  hasRM360Pack6SupervisedTraining
} from '../email-templates/product-inclusion.js';
import { getSDMACEmailContent } from '../email-templates/sdmac.js';
import { getSDMACExpertAdviceEmailContent } from '../email-templates/sdmac_expert_advice.js';
import { getSDMACLiccaEmailContent } from '../email-templates/sdmac_licca.js';
import { getRM360PackEmailContent } from '../email-templates/rm360_pack.js';
import { getRM360Pack6SupervisedTrainingEmailContent } from '../email-templates/rm360_pack_6_supervised_training.js';
import { paymentPoolConnection } from '../paymentPoolConnection.js'

export const capturePatientPayment = async (req, res) => {
  const {
    orderId,
    payerId,
    currencyCode,
    productId,
    userId,
    userName,
    userEmail,
    productName
  } = req.body

  const transactionDate = moment().format('YYYY-MM-DD')
  const transactionTime = moment().format('HH:mm:ss')
  const datetime = moment().format('YYYY-MM-DD HH:mm:ss')

  const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(orderId)
  captureOrderRequest.requestBody({ payer_id: payerId })

  let patient_id = null
  let isLiccaIncluded = false
  let liccaProvisioned = false
  let amountForLog = 0

  try {
    /* ------------------ CAPTURE PAYPAL PAYMENT ------------------ */
    const captureResult = await client().execute(captureOrderRequest)
    const paymentStatus = captureResult.result.status

    const targetProduct = await getProductById(productId, db)
    if (!targetProduct) throw new Error('PRODUCT_NOT_FOUND')
    const productCode = targetProduct.product_code;

    const current = await getUserLatestCompletedProduct(userId, db)
    const charge = current ? computeUpgradeCharge({ currentProduct: current, targetProduct })
      : {
          allowed: true,
          reason: null,
          amountToCharge: Number(
            Number(targetProduct.product_amount).toFixed(2)
          ),
          isUpgrade: false,
          upgradeFromProductId: null,
          fullProductAmount: Number(targetProduct.product_amount),
          currentProductAmount: null
        }

    if (!charge.allowed) {
      throw new Error(charge.reason)
    }

    const capturedAmountValue =
      captureResult?.result?.purchase_units?.[0]?.payments?.captures?.[0]
        ?.amount?.value ?? null
    const capturedAmount =
      capturedAmountValue !== null ? Number(capturedAmountValue) : null
    if (capturedAmount === null || !Number.isFinite(capturedAmount)) {
      throw new Error('CAPTURE_AMOUNT_MISSING')
    }
    amountForLog = Number(capturedAmount.toFixed(2))
    if (
      Number(capturedAmount.toFixed(2)) !==
      Number(charge.amountToCharge.toFixed(2))
    ) {
      throw new Error('AMOUNT_MISMATCH')
    }

    await db.promise().query(
      `INSERT INTO dmac_webapp_users_transaction
       (payment_id, payer_id, amount, currency, status, product_id, user_id, payment_type,
        is_upgrade, upgrade_from_product_id, full_product_amount, price_difference_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        captureResult.result.id,
        payerId,
        charge.amountToCharge,
        currencyCode,
        paymentStatus,
        productId,
        userId,
        'paypal',
        charge.isUpgrade ? 1 : 0,
        charge.upgradeFromProductId,
        charge.fullProductAmount,
        charge.isUpgrade ? charge.amountToCharge : null
      ]
    )

    if (paymentStatus !== 'COMPLETED') {
      throw new Error('PAYMENT_NOT_COMPLETED')
    }

    /* ------------------ PRODUCT CHECK ------------------ */
    isLiccaIncluded = hasLiccaSubscription(targetProduct.subscription_list)

    /* ------------------ MARK PAYMENT DONE ------------------ */
    await db.promise().query(
      `UPDATE dmac_webapp_users
       SET patient_payment = 1, patient_payment_date = ?
       WHERE id = ?`,
      [datetime, userId]
    )

    /* ------------------ LICCA FLOW (POOL ONLY) ------------------ */
    if (isLiccaIncluded) {
      let paymentConnection

      try {
        paymentConnection = await paymentPoolConnection
          .promise()
          .getConnection()
        await paymentConnection.beginTransaction()

        const [[user]] = await paymentConnection.query(
          `SELECT * FROM dmac_webapp_users WHERE id = ? LIMIT 1`,
          [userId]
        )
        if (!user) throw new Error('USER_NOT_FOUND')

        const [[existingUser]] = await paymentConnection.query(
          `SELECT id FROM users WHERE username = ? LIMIT 1`,
          [user.email]
        )

        if (existingUser) {
          patient_id = existingUser.id
        } else {
          let md5Password
          try {
            const originalPassword = decryptString(user.encrypted_password)
            md5Password = crypto
              .createHash('md5')
              .update(originalPassword)
              .digest('hex')
          } catch (e) {
            throw new Error(
              `LICCA_PASSWORD_DECRYPT_FAILED: ${e?.message ?? String(e)}`
            )
          }

          const [insertUser] = await paymentConnection.query(
            `INSERT INTO users
             (user_role, username, password, firstName, address, city, state,
              zipCode, country, mobileNo, time_zone, clinic_id, active,
              is_quesionaire, is_test, dateCreated, added_from)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'User',
              user.email,
              md5Password,
              user.name,
              user.address,
              user.state,
              user.province_title,
              user.zip_code,
              user.country,
              user.mobile,
              user.time_zone,
              9,
              1,
              0,
              0,
              new Date(),
              3
            ]
          )

          patient_id = insertUser.insertId

          await paymentConnection.query(
            `INSERT INTO share_users_list
             (patient_id, user_role, username, password, firstName, address,
              city, state, zipCode, country, mobileNo, time_zone, clinic_id,
              active, is_quesionaire, is_test, dateCreated, added_from)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              patient_id,
              'User',
              user.email,
              md5Password,
              user.name,
              user.address,
              user.state,
              user.province_title,
              user.zip_code,
              user.country,
              user.mobile,
              user.time_zone,
              9,
              1,
              0,
              0,
              new Date(),
              3
            ]
          )
        }

        await paymentConnection.query(
          `INSERT IGNORE INTO dmac_webapp_licca_user_mapping
           (webapp_user_id, licca_user_id)
           VALUES (?, ?)`,
          [userId, patient_id]
        )

        /* ------------------ LICCA VALIDITY ------------------ */
        const licca_product_id = 100
        const group_id = 100
        const licca_validity = 90
        const clinic_id = 9

        const [[lastPayment]] = await paymentConnection.query(
          `SELECT * FROM user_payment_details
           WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
          [patient_id]
        )

        const now_ts = moment().unix()
        const end_ts =
          !lastPayment || lastPayment.end_ts <= now_ts
            ? moment().add(licca_validity, 'days').endOf('day').unix()
            : moment
                .unix(lastPayment.end_ts)
                .add(licca_validity, 'days')
                .endOf('day')
                .unix()

        await paymentConnection.query(
          `INSERT INTO user_payment_details
           (user_id, product_group_id, product_id, start_ts, end_ts, clinic_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [patient_id, group_id, licca_product_id, now_ts, end_ts, clinic_id]
        )

        await paymentConnection.query(
          `DELETE FROM user_product_expiry
           WHERE user_id = ? AND product_group_id = ?`,
          [patient_id, group_id]
        )

        await paymentConnection.query(
          `INSERT INTO user_product_expiry
           (user_id, product_group_id, product_id, expiry_ts,
            is_active, clinic_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [patient_id, group_id, licca_product_id, end_ts, 1, clinic_id]
        )

        await paymentConnection.commit()
        liccaProvisioned = true
      } catch (err) {
        if (paymentConnection) await paymentConnection.rollback()
        // Do not fail a successful PayPal capture just because LICCA provisioning failed.
        // Log and continue; admins can investigate env mismatch / legacy encrypted_password values.
        console.error('LICCA PROVISIONING ERROR:', err)
        liccaProvisioned = false
      } finally {
        if (paymentConnection) paymentConnection.release()
      }
    }


    // Select email content based on product code
    let emailContent;
    if (hasSDMAC(targetProduct.subscription_list, productCode)) {
      emailContent = getSDMACEmailContent({ userName, link: '' });
    } else if (hasSDMACExpertAdvice(targetProduct.subscription_list, productCode)) {
      emailContent = getSDMACExpertAdviceEmailContent({ userName, link: '' });
    } else if (hasSDMACLicca(targetProduct.subscription_list, productCode)) {
      emailContent = getSDMACLiccaEmailContent({ userName, link: '' });
    } else if (hasRM360Pack(targetProduct.subscription_list, productCode)) {
      emailContent = getRM360PackEmailContent({ userName, link: '' });
    } else if (hasRM360Pack6SupervisedTraining(targetProduct.subscription_list, productCode)) {
      emailContent = getRM360Pack6SupervisedTrainingEmailContent({ userName, link: '' });
    } else {
      emailContent = {
        subject: 'Payment Receipt — Payment Approved',
        html: `
          <p>Dear ${userName},</p>
          <h3>Payment Successful</h3>
          <p>Amount: $${charge.amountToCharge}</p>
          <p>Product: ${productName}</p>
          <p>Date: ${transactionDate} ${transactionTime}</p>
          <p>Regards,<br/>Admin<br/>DMAC.COM</p>
        `
      };
    }
    await sendEmail(userEmail, emailContent.subject, emailContent.html, emailContent.html);

    return res.json({
      message: 'Payment captured successfully',
      patient_id,
      licca_enabled: Boolean(isLiccaIncluded && liccaProvisioned)
    })
  } catch (error) {
    console.error('PAYPAL ERROR:', error)

    const failureReason = error?.message ?? String(error)
    const safeAmount = Number.isFinite(Number(amountForLog))
      ? Number(amountForLog)
      : 0

    try {
      await db.promise().query(
        `INSERT INTO dmac_webapp_users_transaction
         (payment_id, payer_id, amount, currency, status,
          product_id, user_id, payment_type, failure_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          payerId || null,
          safeAmount,
          currencyCode,
          'FAILED',
          productId,
          userId,
          'paypal',
          failureReason
        ]
      )
    } catch (logErr) {
      console.error('FAILED TO LOG PAYMENT FAILURE:', logErr)
    }

    return res.status(400).json({
      message: 'Payment failed',
      reason: failureReason
    })
  }
}

// export const capturePatientPayment = async (req, res) => {
//   const {
//     orderId,
//     payerId,
//     amount,
//     currencyCode,
//     productId,
//     userId,
//     userName,
//     userEmail,
//     productName
//   } = req.body

//   const transactionDate = moment().format('YYYY-MM-DD')
//   const transactionTime = moment().format('HH:mm:ss')
//   const datetime = moment().format('YYYY-MM-DD HH:mm:ss')

//   const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(orderId)
//   captureOrderRequest.requestBody({ payer_id: payerId })

//   try {
//     /* ------------------ CAPTURE PAYPAL PAYMENT ------------------ */
//     const captureResult = await client().execute(captureOrderRequest)
//     const paymentStatus = captureResult.result.status

//     /* Always log transaction */
//     await db.promise().query(
//       `INSERT INTO dmac_webapp_users_transaction
//        (payment_id, payer_id, amount, currency, status, product_id, user_id, payment_type)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         captureResult.result.id,
//         payerId,
//         amount,
//         currencyCode,
//         paymentStatus,
//         productId,
//         userId,
//         'paypal'
//       ]
//     )

//     /* ------------------ ONLY PROCEED IF COMPLETED ------------------ */
//     if (paymentStatus !== 'COMPLETED') {
//       throw new Error('PAYMENT_NOT_COMPLETED')
//     }

//     /* ------------------ GET PRODUCT DETAILS ------------------ */
//     const product = await getProductById(productId, db)

//     if (!product) {
//       throw new Error('PRODUCT_NOT_FOUND')
//     }
//     const isLiccaIncluded = hasLiccaSubscription(product.subscription_list)

//     /* Mark patient as paid */
//     await db.promise().query(
//       `UPDATE dmac_webapp_users
//        SET patient_payment = 1, patient_payment_date = ?
//        WHERE id = ?`,
//       [datetime, userId]
//     )
//     if (isLiccaIncluded) {
//       /* Get user info */
//       const [users] = await db
//         .promise()
//         .query(`SELECT * FROM dmac_webapp_users WHERE id = ?`, [userId])

//       if (!users.length) {
//         return res.status(200).json({ message: 'User data not found' })
//       }
//       const user = users[0]
//       /* ------------------ DECRYPT + CONVERT PASSWORD TO MD5 ------------------ */
//       const originalPassword = decryptString(user.encrypted_password)

//       const md5Password = crypto
//         .createHash('md5')
//         .update(originalPassword)
//         .digest('hex')

//       /* ------------------ INSERT INTO MAIN users TABLE ------------------ */
//       const [insertUserResult] = await db.promise().query(
//         `INSERT INTO users
//           (user_role, username, password, firstName, address, city, state, zipCode, country, mobileNo, time_zone, clinic_id, active, is_quesionaire, is_test, dateCreated, added_from)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           'User',
//           user.email,
//           md5Password,
//           user.name,
//           user.address,
//           user.state,
//           user.province_title,
//           user.zip_code,
//           user.country,
//           user.mobile,
//           user.time_zone,
//           9,
//           1,
//           0,
//           0,
//           new Date(),
//           3
//         ]
//       )

//       const patient_id = insertUserResult.insertId

//       /* ------------------ INSERT INTO mapping ------------------ */

//       await db.promise().query(`INSERT INTO dmac_webapp_licca_user_mapping (webapp_user_id, licca_user_id) VALUES (?, ?)`, [userId, patient_id])

//       /* ------------------ INSERT INTO share_users_list ------------------ */
//       await db.promise().query(
//         `INSERT INTO share_users_list
//           (patient_id, user_role, username, password, firstName, address, city, state, zipCode, country, mobileNo, time_zone, clinic_id, active, is_quesionaire, is_test, dateCreated, added_from)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           patient_id,
//           'User',
//           user.email,
//           md5Password,
//           user.name,
//           user.address,
//           user.state,
//           user.province_title,
//           user.zip_code,
//           user.country,
//           user.mobile,
//           user.time_zone,
//           9,
//           1,
//           0,
//           0,
//           new Date(),
//           3
//         ]
//       )

//       /* ------------------ LICCA / PRODUCT VALIDITY ------------------ */
//       const licca_product_id = 100
//       const group_id = 100
//       const licca_validity = 90
//       const clinic_id = 9

//       const [[lastPayment]] = await db.promise().query(
//         `SELECT * FROM user_payment_details
//         WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
//         [patient_id]
//       )

//       const now_ts = moment().unix()
//       let end_ts

//       if (!lastPayment || lastPayment.end_ts <= now_ts) {
//         end_ts = moment().add(licca_validity, 'days').endOf('day').unix()
//       } else {
//         end_ts = moment
//           .unix(lastPayment.end_ts)
//           .add(licca_validity, 'days')
//           .endOf('day')
//           .unix()
//       }

//       /* Insert payment cycle */
//       await db.promise().query(
//         `INSERT INTO user_payment_details
//         (user_id, product_group_id, product_id, start_ts, end_ts, clinic_id)
//         VALUES (?, ?, ?, ?, ?, ?)`,
//         [patient_id, group_id, licca_product_id, now_ts, end_ts, clinic_id]
//       )

//       /* Update expiry */
//       await db
//         .promise()
//         .query(
//           `DELETE FROM user_product_expiry WHERE user_id = ? AND product_group_id = ?`,
//           [patient_id, group_id]
//         )

//       await db.promise().query(
//         `INSERT INTO user_product_expiry
//         (user_id, product_group_id, product_id, expiry_ts, is_active, clinic_id)
//         VALUES (?, ?, ?, ?, ?, ?)`,
//         [patient_id, group_id, licca_product_id, end_ts, 1, clinic_id]
//       )
//     }

//     /* ------------------ SUCCESS EMAIL ------------------ */
//     const subject = 'Payment Receipt — Payment Approved'
//     const html = `
//       <p>Dear ${userName},</p>
//       <h3>Receipt of Successful Payment</h3>
//       <table>
//         <tr><td><strong>Status:</strong></td><td>SUCCESS</td></tr>
//         <tr><td><strong>Amount:</strong></td><td>$${amount}</td></tr>
//         <tr><td><strong>Product:</strong></td><td>${productName}</td></tr>
//         <tr><td><strong>Date:</strong></td><td>${transactionDate}</td></tr>
//         <tr><td><strong>Time:</strong></td><td>${transactionTime}</td></tr>
//       </table>
//       <p>No service tax due to Tax Exempt Status.</p>
//       <p>Please note: The above payment is non-refundable.</p>
//       <p>Regards,<br/>Admin<br/>DMAC.COM</p>
//     `

//     await sendEmail(userEmail, subject, html, html)

//     /* Final Response */
//     return res.json({
//       message: 'Payment captured successfully',
//       patient_id
//     })
//   } catch (error) {
//     console.error('PayPal CAPTURE ERROR:', error)

//     const failReason =
//       error?.result?.message || error?.message || 'Payment failed'

//     /* Log failed payment */
//     await db.promise().query(
//       `INSERT INTO dmac_webapp_users_transaction
//        (payment_id, payer_id, amount, currency, status, product_id, user_id, payment_type, failure_reason)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         orderId,
//         payerId || null,
//         amount,
//         currencyCode,
//         'FAILED',
//         productId,
//         userId,
//         'paypal',
//         failReason
//       ]
//     )

//     /* Failure email */
//     if (userEmail) {
//       const subject = 'Payment Receipt — Payment Failed'
//       const html = `
//         <p>Dear ${userName},</p>
//         <h3>Payment Failed</h3>
//         <table>
//           <tr><td><strong>Status:</strong></td><td>FAILED</td></tr>
//           <tr><td><strong>Reason:</strong></td><td>${failReason}</td></tr>
//           <tr><td><strong>Amount:</strong></td><td>$${amount}</td></tr>
//           <tr><td><strong>Product:</strong></td><td>${productName}</td></tr>
//           <tr><td><strong>Date:</strong></td><td>${transactionDate}</td></tr>
//           <tr><td><strong>Time:</strong></td><td>${transactionTime}</td></tr>
//         </table>
//         <p>Please retry the payment.</p>
//         <p>Regards,<br/>Admin<br/>DMAC.COM</p>
//       `
//       await sendEmail(userEmail, subject, html, html)
//     }

//     return res.status(400).json({
//       message: 'Payment failed',
//       reason: failReason
//     })
//   }
// }

export const emailVerification = (req, res) => {
  const { token } = req.body

  db.query(
    'UPDATE dmac_webapp_users SET verified = 1 WHERE verification_token = ?',
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })
      if (result.affectedRows === 0)
        return res.status(400).json({ error: 'Invalid or expired token' })

      res.json({ message: 'Email verified successfully!' })
    }
  )
}

export const register = async (req, res) => {
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
    // If email exists, return an error
    if (existingUser.length > 0) {
      return res.status(200).json({
        isSuccess: false,
        message: 'Email already exists. Please try with another email.'
      })
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)

    const verificationToken = uuidv4()
    // Insert new user into the database
    const insertQuery = `
      INSERT INTO dmac_webapp_users (name, email, mobile, password, country, state, zip_code,language, verified, verification_token, role, time_zone) 
      VALUES (?)`
    const values = [
      req.body.name,
      req.body.email,
      req.body.mobile,
      hashedPassword,
      req.body.country,
      req.body.state,
      req.body.zipcode,
      req.body.language,
      0,
      verificationToken,
      'USER',
      req.body.timeZone
    ]

    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
    const verifyLink = `${process.env.DOMAIN}verify-email/${verificationToken}`
    const to = req.body.email
    const subject = 'Verify Your Email for DMAC'
    const greetingHtml = `<p>Dear ${req.body.name},</p>`
    const bodyHtml = `<h2>You have successfully registered with DMAC.</h2>
                      <br>
                      <h4>Click the link below to verify your email</h4>
                      <a href="${verifyLink}">Verify Email</a>`
    const emailHtml = `
      <div>
        ${greetingHtml}
        ${bodyHtml}
      </div>`
    const text = emailHtml
    const html = emailHtml

    try {
      await sendEmail(to, subject, text, html)
      return res.status(200).json({
        isSuccess: true,
        message:
          'User has been created and email verification sent to registered email.'
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return res.status(500).json({
        status: 500,
        isSuccess: false,
        message: 'User created but failed to send email.'
      })
    }
  } catch (err) {
    console.error('Error during registration:', err)
    return res.status(500).json({
      status: 500,
      isSuccess: false,
      message: 'Internal server error.'
    })
  }
}

export const login = (req, res) => {
  const query = `
    SELECT 
      u.*,
      l.code AS language_code
    FROM dmac_webapp_users u
    LEFT JOIN dmac_webapp_language l
      ON l.id = u.language
    WHERE u.email = ? 
      AND u.status = ?;
  `
  db.query(query, [req.body.email, 1], (err, data) => {
    if (err) {
      console.error('Database Error:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (data.length === 0) {
      return res
        .status(200)
        .json({ error: 'Email not found! Try with a valid email.' })
    }

    const user = data[0]
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password)

    if (!isPasswordValid) {
      return res.status(200).json({ error: 'Wrong password!' })
    }

    if (!user.verified) {
      return res.status(200).json({ error: 'Please verify your email first.' })
    }

    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    const { password, ...otherUserData } = user

    const usersData = {
      name: user.name,
      email: user.email,
      id: user.id,
      token: token,
      language: user.language,
      phone: user.mobile,
      languageCode: user.language_code,
      role: user.role,
      google_access_token: user.google_access_token,
      google_refresh_token: user.google_refresh_token,
      time_zone: user.time_zone,
      country: user.country,
      province_title: user.province_title,
      province_id: user.province_id,
      state: user.state
    }

    res.status(200).json({
      message: 'Login successful',
      user: usersData
    })
  })
}

export const forgetPasswordVerifyEmail = (req, res) => {
  try {
    const { email } = req.body
    db.query(
      'SELECT * FROM dmac_webapp_users WHERE email = ?',
      [email],
      async (err, result) => {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: err.message })
        }

        if (result.length === 0) {
          return res.status(200).json({ msg: 'User not found!' })
        }

        const user = result[0]
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '30m'
        })
        const resetLink = `${process.env.DOMAIN}reset-password/${encodeURIComponent(token)}`

        const to = email
        const subject = 'DMAC Password Reset Link'
        const greetingHtml = `<p>Dear ${user.name || 'User'},</p>`
        const bodyHtml = `<h2>Click the link to reset your password</h2>
               <a href="${resetLink}">Reset Password</a>`
        const emailHtml = `<div>${greetingHtml}${bodyHtml}</div>`

        try {
          await sendEmail(to, subject, emailHtml, emailHtml)
          return res.status(200).json({
            msg: 'A password reset email has been sent successfully. Please check your inbox to reset your password.'
          })
        } catch (emailError) {
          console.error('Error sending email:', emailError)
          return res
            .status(500)
            .json({ status: 500, msg: 'User found but failed to send email.' })
        }
      }
    )
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const resetPassword = (req, res) => {
  const { token, password } = req.body
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ msg: 'Invalid or expired token' })
    const userId = decoded.id
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    db.query(
      'UPDATE dmac_webapp_users SET password = ? WHERE id = ?',
      [hashedPassword, userId],
      (err) => {
        if (err) return res.status(500).json({ error: err.msg })
        res.json({ msg: 'Password reset successful!' })
      }
    )
  })
}

export const logout = (req, res) => {
  res.status(200).json('User has been logged out.')
  res.end()
}

// Customers registration and login journey
export const patientRegistration = async (req, res) => {
  try {
    // 🔍 Check if product is selected
    if (
      !req.body.product_id ||
      req.body.product_id === '' ||
      req.body.product_id === null
    ) {
      return res.status(200).json({
        isSuccess: false,
        message: 'Please select the product.'
      })
    }
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

    // If email exists, return an error
    if (existingUser.length > 0) {
      return res.status(200).json({
        isSuccess: false,
        message: 'Email already exists. Please try with another email.'
      })
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)
    const verificationToken = uuidv4()
    const otherInfoJson = JSON.stringify(req.body.otherInfo ?? {})
    const encryptedPasswordString = encryptString(req.body.password)
    // Insert new user into the database
    const insertQuery = `
      INSERT INTO dmac_webapp_users 
      (name, email, mobile, password, encrypted_password, country, state, zip_code, language, verified, verification_token, role, time_zone, province_title, province_id, patient_meta, weight, weight_unit, height, height_unit) 
      VALUES (?)`
    const values = [
      req.body.name,
      req.body.email,
      req.body.mobile,
      hashedPassword,
      encryptedPasswordString,
      req.body.country,
      req.body.state,
      req.body.zipcode,
      req.body.language,
      0,
      verificationToken,
      'USER',
      req.body.timeZone,
      req.body.provinceTitle,
      req.body.provinceValue,
      otherInfoJson,
      req.body.weight,
      req.body.weight_unit,
      req.body.height,
      req.body.height_unit
    ]

    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    // Get new user id
    const userId = insertResult.insertId

    // Insert entry into dmac_webapp_registered_users_product linked with user id
    const insertProductQuery = `
      INSERT INTO dmac_webapp_registered_users_product (user_id, product_id)
      VALUES (?)`
    const productValues = [userId, req.body.product_id]

    await new Promise((resolve, reject) => {
      db.query(insertProductQuery, [productValues], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    // Prepare email verification message
    const verifyLink = `${process.env.DOMAIN}patient/email/verify/${verificationToken}`
    const to = req.body.email
    const subject = 'Verify Your Email for DMAC'
    const greetingHtml = `<p>Dear ${req.body.name},</p>`
    const bodyHtml = `<h2>You have successfully registered with DMAC.</h2>
                      <br>
                      <h4>Click the link below to verify your email</h4>
                      <a href="${verifyLink}">Verify Email</a>`
    const emailHtml = `
      <div>
        ${greetingHtml}
        ${bodyHtml}
      </div>`
    const text = emailHtml
    const html = emailHtml

    try {
      await sendEmail(to, subject, text, html)
      return res.status(200).json({
        isSuccess: true,
        message:
          'User has been created and email verification sent to registered email.'
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return res.status(500).json({
        status: 500,
        isSuccess: false,
        message: 'User created but failed to send email.'
      })
    }
  } catch (err) {
    console.error('Error during registration:', err)
    return res.status(500).json({
      status: 500,
      isSuccess: false,
      message: 'Internal server error.'
    })
  }
}

export const patientEmailVerification = (req, res) => {
  const { token } = req.body

  // Step 1: Verify and update user
  db.query(
    'UPDATE dmac_webapp_users SET verified = 1 WHERE verification_token = ?',
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message })

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'Invalid or expired token' })
      }

      // Step 2: Fetch user details using token (include mobile & role since you return them)
      const userQuery = `
        SELECT id, name, email, mobile, role, partner_id
        FROM dmac_webapp_users
        WHERE verification_token = ?
      `

      db.query(userQuery, [token], (userErr, userRows) => {
        if (userErr) return res.status(500).json({ error: userErr.message })

        if (!userRows || userRows.length === 0) {
          return res.status(400).json({ error: 'User not found' })
        }

        const user = userRows[0]
        const userId = user.id

        const ensurePartnerUserHasDefaultProduct = (done) => {
          const defaultProductId = 1

          if (!user.partner_id) {
            return done(null)
          }

          const checkProductSql =
            'SELECT id FROM dmac_webapp_registered_users_product WHERE user_id = ? AND product_id = ? LIMIT 1'
          db.query(
            checkProductSql,
            [userId, defaultProductId],
            (checkErr, checkRows) => {
              if (checkErr) return done(checkErr)

              const ensureTxnRow = () => {
                // Add a dummy transaction row for admin/audit views.
                const checkTxnSql =
                  'SELECT id FROM dmac_webapp_users_transaction WHERE user_id = ? AND product_id = ? AND payment_type = ? LIMIT 1'
                db.query(
                  checkTxnSql,
                  [userId, defaultProductId, 'partner'],
                  (txnCheckErr, txnRows) => {
                    if (txnCheckErr) return done(txnCheckErr)

                    if (Array.isArray(txnRows) && txnRows.length > 0) {
                      return done(null)
                    }

                    const insertTxnSql = `
                      INSERT INTO dmac_webapp_users_transaction
                        (payment_id, payer_id, amount, currency, status, product_id, user_id, payment_type, failure_reason)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `

                    db.query(
                      insertTxnSql,
                      [
                        `PARTNER_ADDED_USER_${userId}`,
                        `PARTNER_ADDED_USER_${userId}`,
                        0,
                        'USD',
                        'COMPLETED',
                        defaultProductId,
                        userId,
                        'partner',
                        'Added by partner'
                      ],
                      (txnInsertErr) => {
                        if (txnInsertErr) return done(txnInsertErr)
                        return done(null)
                      }
                    )
                  }
                )
              }

              if (Array.isArray(checkRows) && checkRows.length > 0) {
                return ensureTxnRow()
              }

              const insertProductSql =
                'INSERT INTO dmac_webapp_registered_users_product (user_id, product_id) VALUES (?)'
              db.query(
                insertProductSql,
                [[userId, defaultProductId]],
                (insertErr) => {
                  if (insertErr) return done(insertErr)

                  return ensureTxnRow()
                }
              )
            }
          )
        }

        // Step 3: JOIN to get the latest product (if any)
        // NOTE: removed stray comma after p.product_amount which caused SQL syntax error
        const productJoinQuery = `
          SELECT 
            rup.product_id,
            p.*
          FROM dmac_webapp_registered_users_product rup
          LEFT JOIN dmac_webapp_products p 
            ON rup.product_id = p.id
          WHERE rup.user_id = ?
          ORDER BY rup.id DESC
          LIMIT 1
        `

        ensurePartnerUserHasDefaultProduct((ensureErr) => {
          if (ensureErr)
            return res.status(500).json({ error: ensureErr.message })

          db.query(productJoinQuery, [userId], (prodErr, prodRows) => {
            if (prodErr) return res.status(500).json({ error: prodErr.message })

            // Format product response (null if no product assigned)
            const product = prodRows && prodRows.length > 0 ? prodRows[0] : null

            return res.json({
              isSuccess: true,
              message: 'Email verified successfully',
              is_partner_user: Boolean(user.partner_id),
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role
              },
              product // null allowed
            })
          })
        })
      })
    }
  )
}

export const patientLogin = (req, res) => {
  const query = `
    SELECT 
      u.*,
      l.code AS language_code
    FROM dmac_webapp_users u
    LEFT JOIN dmac_webapp_language l
      ON l.id = u.language
    WHERE u.email = ? 
      AND u.status = ?;
  `
  db.query(query, [req.body.email, 1], (err, data) => {
    if (err) {
      console.error('Database Error:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (data.length === 0) {
      return res
        .status(200)
        .json({ error: 'Email not found! Try with a valid email.' })
    }

    const user = data[0]
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password)

    if (!isPasswordValid) {
      return res.status(200).json({ error: 'Wrong password!' })
    }

    if (!user.verified) {
      return res.status(200).json({ error: 'Please verify your email first.' })
    }

    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    const { password, ...otherUserData } = user

    const usersData = {
      name: user.name,
      email: user.email,
      id: user.id,
      token: token,
      language: user.language,
      phone: user.mobile,
      languageCode: user.language_code,
      role: user.role,
      patient_payment: user.patient_payment,
      google_access_token: user.google_access_token,
      google_refresh_token: user.google_refresh_token,
      time_zone: user.time_zone,
      country: user.country,
      province_title: user.province_title,
      province_id: user.province_id,
      state: user.state
    }

    res.status(200).json({
      message: 'Login successful',
      user: usersData
    })
  })
}

export const createPatientPayment = async (req, res) => {
  const { userId, productId } = req.body

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: 'userId and productId are required' })
  }

  const targetProduct = await getProductById(productId, db)
  if (!targetProduct) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const current = await getUserLatestCompletedProduct(userId, db)

  const charge = current
    ? computeUpgradeCharge({ currentProduct: current, targetProduct })
    : {
        allowed: true,
        reason: null,
        amountToCharge: Number(Number(targetProduct.product_amount).toFixed(2)),
        isUpgrade: false,
        upgradeFromProductId: null,
        fullProductAmount: Number(targetProduct.product_amount),
        currentProductAmount: null
      }

  if (!charge.allowed) {
    return res.status(400).json({ message: charge.reason })
  }

  if (!Number.isFinite(charge.amountToCharge) || charge.amountToCharge <= 0) {
    return res.status(400).json({ message: 'INVALID_AMOUNT' })
  }

  const createOrderRequest = new paypal.orders.OrdersCreateRequest()
  createOrderRequest.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: String(charge.amountToCharge) // Amount to charge the customer (server-computed)
        }
      }
    ],
    application_context: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL
    }
  })
  try {
    const order = await client().execute(createOrderRequest)
    const orderId = order.result.id
    const approvalUrl = order.result.links.find(
      (link) => link.rel === 'approve'
    ).href
    res.json({
      orderId,
      approvalUrl,
      amountToPay: charge.amountToCharge,
      isUpgrade: charge.isUpgrade,
      upgradeFromProductId: charge.upgradeFromProductId,
      fullProductAmount: charge.fullProductAmount
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error creating PayPal order')
  }
}

export const successPatientPayment = (req, res) => {
  let result = {}
  result.status = 200
  result.msg = 'Payment success'
  return res.json(result)
}

export const canclePatientPayment = (req, res) => {
  let result = {}
  result.status = 200
  result.msg = 'Payment cancelled'
  return res.json(result)
}

export const getPatientProductByUserId = async (req, res) => {
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({
      status: 400,
      message: 'User ID is required'
    })
  }

  const query = `
    SELECT
      t.id AS transaction_id,
      t.product_id,
      t.payment_id,
      t.amount,
      t.currency,
      t.status,
      t.payment_type,
      t.created_date AS payment_date,
      p.id,
      p.product_name,
      p.product_description,
      p.product_amount,
      p.subscription_list,
      p.upgrade_priority,
      p.feature
    FROM dmac_webapp_users_transaction t
    INNER JOIN dmac_webapp_products p
      ON t.product_id = p.id
    WHERE t.user_id = ?
      AND t.status = 'COMPLETED'
    ORDER BY t.created_date DESC
    LIMIT 1
  `

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('DB Error:', err)
      return res.status(500).json({
        status: 500,
        message: 'Database error'
      })
    }

    if (result.length === 0) {
      return res.status(200).json({
        status: 200,
        purchased: false,
        product: [],
        message: 'No purchased products found for this user'
      })
    }

    return res.status(200).json({
      status: 200,
      purchased: true,
      product: result,
      message: 'Purchased Product'
    })
  })
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

function decryptString(encoded) {
  if (!encoded) {
    throw new Error('MISSING_ENCRYPTED_PASSWORD')
  }
  if (!process.env.CRYPTO_SECRET_KEY || !process.env.CRYPTO_ALGORITHM) {
    throw new Error('CRYPTO_ENV_MISSING')
  }

  const key = Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex')

  const decipher = crypto.createDecipheriv(
    process.env.CRYPTO_ALGORITHM,
    key,
    Buffer.alloc(16, 0)
  )

  decipher.setAutoPadding(true)

  let decrypted = decipher.update(encoded, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
