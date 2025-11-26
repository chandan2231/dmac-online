import { db } from '../connect.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmail from '../emailService.js'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { client } from '../paypalConfig.js'
import paypal from '@paypal/checkout-server-sdk'

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
      INSERT INTO dmac_webapp_users (name, email, mobile, password, country, state, zip_code,language, verified, verification_token, role) 
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
      'USER'
    ]

    // Entry for LICCA login, later will enable it for the licca login,

    // const liccaPassword = createHash('md5').update(password).digest('hex');
    // const insertQueryLicca = `
    //   INSERT INTO users (user_role, firstName, username, mobileNo, password, country, state, zipCode, active, dmac_user_verification_token)
    //   VALUES (?)`
    // const liccaValues = [
    //   'dmac_user',
    //   req.body.name,
    //   req.body.email,
    //   req.body.mobile,
    //   liccaPassword,
    //   country,
    //   state,
    //   zipcode,
    //   0,
    //   verificationToken
    // ]

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
      role: user.role
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
export const patinetRegistration = async (req, res) => {
  try {
    // 🔍 Check if product is selected
    if (!product_id || product_id === "" || product_id === null) {
      return res.status(200).json({
        isSuccess: false,
        message: "Please select the product."
      });
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
    const otherInfoJson = JSON.stringify(req.body.otherInfo ?? {});
    // Insert new user into the database
    const insertQuery = `
      INSERT INTO dmac_webapp_users 
      (name, email, mobile, password, country, state, zip_code, language, verified, verification_token, role, time_zone, province_title, province_id, patient_meta) 
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
      req.body.timeZone,
      req.body.provinceTitle,
      req.body.provinceValue,
      otherInfoJson
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
  const { token } = req.body;

  // Step 1: Verify and update user
  db.query(
    "UPDATE dmac_webapp_users SET verified = 1 WHERE verification_token = ?",
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Step 2: Fetch user details using token (include mobile & role since you return them)
      const userQuery = `
        SELECT id, name, email, mobile, role
        FROM dmac_webapp_users
        WHERE verification_token = ?
      `;

      db.query(userQuery, [token], (userErr, userRows) => {
        if (userErr) return res.status(500).json({ error: userErr.message });

        if (!userRows || userRows.length === 0) {
          return res.status(400).json({ error: "User not found" });
        }

        const user = userRows[0];
        const userId = user.id;

        // Step 3: JOIN to get the latest product (if any)
        // NOTE: removed stray comma after p.product_amount which caused SQL syntax error
        const productJoinQuery = `
          SELECT 
            rup.product_id,
            p.product_name,
            p.product_description AS product_description,
            p.product_amount
          FROM dmac_webapp_registered_users_product rup
          LEFT JOIN dmac_webapp_products p 
            ON rup.product_id = p.id
          WHERE rup.user_id = ?
          ORDER BY rup.id DESC
          LIMIT 1
        `;

        db.query(productJoinQuery, [userId], (prodErr, prodRows) => {
          if (prodErr) return res.status(500).json({ error: prodErr.message });

          // Format product response (null if no product assigned)
          const product = prodRows && prodRows.length > 0 ? prodRows[0] : null;

          return res.json({
            isSuccess: true,
            message: "Email verified successfully",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              mobile: user.mobile,
              role: user.role
            },
            product // null allowed
          });
        });
      });
    }
  );
};


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
      patient_payment: user.patient_payment
    }

    res.status(200).json({
      message: 'Login successful',
      user: usersData
    })
  })
}


export const createPatientPayment = async (req, res) => {
  const createOrderRequest = new paypal.orders.OrdersCreateRequest()
  createOrderRequest.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: req.body.amount // Amount to charge the customer
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
    const orderId = order.result.id;
    const approvalUrl = order.result.links.find(
      (link) => link.rel === 'approve'
    ).href
    res.json({
      orderId,
      approvalUrl
    });
  } catch (error) {
    console.error(error)
    res.status(500).send('Error creating PayPal order')
  }
}

export const capturePatientPayment = async (req, res) => {
  const {
    orderId,
    payerId,
    amount,
    currencyCode,
    productId,
    userId,
    userName,
    userEmail,
    productName
  } = req.body

  const datetime = new Date()
  const transactionDate = new Date().toLocaleDateString()
  const transactionTime = new Date().toLocaleTimeString()

  const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(orderId)
  captureOrderRequest.requestBody({
    payer_id: payerId
  })

  try {
    /** 🔹 Attempt to capture payment */
    const captureResult = await client().execute(captureOrderRequest)
    const paymentStatus = captureResult.result.status

    /** 🔹 Save transaction in DB */
    const paymentData = {
      payment_id: captureResult.result.id,
      payer_id: payerId,
      amount,
      currency: currencyCode,
      status: paymentStatus,
      product_id: productId,
      user_id: userId,
      payment_type: "paypal"
    }

    await new Promise((resolve, reject) => {
      db.query('INSERT INTO dmac_webapp_users_transaction SET ?', paymentData, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })

    /** 🔹 If success — update user & send success email */
    if (paymentStatus === "COMPLETED") {
      await new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE dmac_webapp_users 
          SET patient_payment = ?, patient_payment_date = ? 
          WHERE id = ?
        `
        db.query(updateQuery, [1, datetime.toISOString().slice(0, 10), userId], (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })

      const subject = "Payment Receipt — Payment Approved"
      const html = `
      <p>Dear ${userName},</p>
      <h3>Receipt of Successful Payment</h3>
      <table>
        <tr><td><strong>Status:</strong></td><td>SUCCESS</td></tr>
        <tr><td><strong>Amount:</strong></td><td>$${amount}</td></tr>
        <tr><td><strong>Product:</strong></td><td>${productName}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${transactionDate}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${transactionTime}</td></tr>
      </table>
      <p>No service tax due to Tax Exempt Status.</p>
      <p>Please note: The above payment is non-refundable.</p>
      <p>Regards,<br/>Admin<br/>DMAC.COM</p>
      `
      await sendEmail(userEmail, subject, html, html)

      return res.json({
        message: "Payment captured successfully",
        captureResult
      })
    }

    /** 🔹 If PayPal capture doesn't return COMPLETED */
    throw new Error("PAYMENT_NOT_COMPLETED")

  } catch (error) {
    console.error("PayPal CAPTURE ERROR:", error)

    // Extract safe message from PayPal error if available
    const failReason = error?.result?.message || error?.message || "Payment failed"

    /** 🔹 Insert failed transaction record */
    const failedPaymentData = {
      payment_id: orderId,
      payer_id: payerId || null,
      amount,
      currency: currencyCode,
      status: "FAILED",
      product_id: productId,
      user_id: userId,
      payment_type: "paypal",
      failure_reason: failReason
    }

    await new Promise(resolve => {
      db.query('INSERT INTO dmac_webapp_users_transaction SET ?', failedPaymentData, () => {
        resolve()
      })
    })

    /** 🔹 Send failure email to the user */
    if (userEmail) {
      const subject = "Payment Receipt — Payment Failed"
      const html = `
      <p>Dear ${userName},</p>
      <h3>Payment Failed</h3>
      <table>
        <tr><td><strong>Status:</strong></td><td>FAILED</td></tr>
        <tr><td><strong>Failure Reason:</strong></td><td>${failReason}</td></tr>
        <tr><td><strong>Amount:</strong></td><td>$${amount}</td></tr>
        <tr><td><strong>Product:</strong></td><td>${productName}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${transactionDate}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${transactionTime}</td></tr>
      </table>
      <p>Please retry the payment. If you need assistance, reply to this email.</p>
      <p>Regards,<br/>Admin<br/>DMAC.COM</p>
      `
      await sendEmail(userEmail, subject, html, html)
    }

    return res.status(400).json({
      message: "Payment failed",
      reason: failReason
    })
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
  const { userId } = req.body; 
  if (!userId) {
    return res.status(400).json({
      status: 400,
      message: "User ID is required"
    });
  }

  const query = `
    SELECT
      t.id,
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
      p.product_amount
    FROM dmac_webapp_users_transaction t
    INNER JOIN dmac_webapp_products p
      ON t.product_id = p.id
    WHERE t.user_id = ?
      AND t.status = 'COMPLETED'
    ORDER BY t.created_date DESC
    LIMIT 1
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        status: 500,
        message: "Database error"
      });
    }

    if (result.length === 0) {
      return res.status(200).json({
        status: 200,
        purchased: false,
        product: [],
        message: "No purchased products found for this user"
      });
    }

    return res.status(200).json({
      status: 200,
      purchased: true,
      product: result,
      message: "Purchased Product"
    });
  });
};






