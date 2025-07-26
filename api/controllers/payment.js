import { db } from '../connect.js'
import { client } from '../paypalConfig.js'
import paypal from '@paypal/checkout-server-sdk'
import { getUserInfo, getUserInfoByProtocolId } from '../userData.js'
import sendEmail from '../emailService.js'

export const capturePaymentAdditionClinicSite = async (req, res) => {
  const {
    orderId,
    payerId,
    amount,
    currencyCode,
    protocolId,
    researchType,
    userId,
    protocolCount
  } = req.body

  const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(orderId)
  captureOrderRequest.requestBody({
    payer_id: payerId // Ensure payer_id is included in the capture request
  })

  try {
    const captureResult = await client().execute(captureOrderRequest)

    // Store payment details in the database
    const paymentData = {
      payment_id: captureResult.result.id,
      payer_id: payerId,
      amount: amount,
      currency: currencyCode,
      status: captureResult.result.status,
      protocol_id: protocolId,
      user_id: req.user.userId,
      payment_type: 'paypal'
    }

    // Insert payment data into the transactions table
    await new Promise((resolve, reject) => {
      db.query('INSERT INTO transactions SET ?', paymentData, (err, result) => {
        if (err) {
          console.error('Error storing payment in database:', err)
          return reject('Error storing payment in database')
        }
        resolve(result)
      })
    })

    // Update protocol status
    await new Promise((resolve, reject) => {
      const updateQuery =
        'UPDATE protocols SET status = ?, allow_edit = ? WHERE protocol_id = ?'
      const updateValues = [2, 1, protocolId]
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error('Error updating protocol status:', err)
          return reject('Error updating protocol status')
        }
        resolve(result)
      })
    })

    if (researchType === 'Multi-Site Sponsor') {
      await handleMultiSiteAdditionClinicalSite(protocolId, protocolCount)
      const user = await getUserInfo(userId)
      if (user) {
        // Fetch all protocols related to the parent protocol_id
        const protocolDetails = await new Promise((resolve, reject) => {
          db.query(
            'SELECT protocol_id, varification_code FROM protocols WHERE parent_protocol_id = ? ORDER BY id DESC LIMIT ?',
            [protocolId, protocolCount], // Passing protocolCount as the limit
            (err, result) => {
              if (err) {
                console.error('Error fetching protocol details:', err)
                return reject('Error fetching protocol details')
              }
              resolve(result) // This will return an array of protocols with their verification codes
            }
          )
        })
        // Prepare email content
        const transactionDate = new Date().toLocaleDateString() // MM/DD/YYYY
        const transactionTime = new Date().toLocaleTimeString() // HH:MM AM/PM

        const emailSubject =
          'Protocol Submission Confirmation & Protocol Approval & Processing Receipt'
        let emailBody = `
          <p>Dear ${user.name},</p>
          <p>You have successfully submitted your protocol ID # ${protocolId}.</p>
          <p>You will be contacted within 7 days for any further information needed for the approval process.</p>

          <h3>Receipt of Payment</h3>
          <table>
            <tr><td><strong>Merchant Name:</strong></td><td>IRB-HUB.COM</td></tr>
            <tr><td><strong>Merchant Address:</strong></td><td>IBR-HUB.COM DBA Young Scientist Of America 501C3, 3010 Legacy Dr. Frisco.Tx-75034</td></tr>
            <tr><td><strong>Transaction Date:</strong></td><td>${transactionDate}</td></tr>
            <tr><td><strong>Transaction Time:</strong></td><td>${transactionTime}</td></tr>
            <tr><td><strong>Customer Name:</strong></td><td>${user.name}</td></tr>
            <tr><td><strong>Customer Email Address:</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>Payment Method:</strong></td><td>Credit Card (Last 4 digits: XXXX)</td></tr>
            <tr><td><strong>Description of Goods/Services:</strong></td><td>[Commercial Approval of Protocol ID # ${protocolId}] - $${amount}</td></tr>
          </table>

          <p>No service tax is collected due to Tax Exempt Status.</p>
          <p>Please Note: The above payment is non-refundable.</p>
          <p>If you have any questions about your submission or this invoice, please contact us via email.</p>

          <h3>Protocol IDs and Verification Codes</h3>
          <table border="1" cellpadding="5">
            <tr><th>Protocol ID</th><th>Verification Code</th></tr>
        `

        // Add each protocol's protocol_id and verification code to the email body
        protocolDetails.forEach((protocol) => {
          emailBody += `
            <tr>
              <td>${protocol.protocol_id}</td>
              <td>${protocol.varification_code}</td>
            </tr>
          `
        })

        emailBody += `
          </table>
          <p>We have generated ${protocolCount} clinical site registration access code 
            Please provide one Access code to every  clinical research site for registration.</p>
          <p>If you wish to have more clinical research sites please go to your protocol number on the right the three dots select and add clinical sites.</p>
          <p> It will direct you to the payment portal to add more clinical sites.</p>
          <p>Regards,<br/>Admin<br/>IRB-HUB.COM</p>
        `
        const text = emailBody
        const html = emailBody
        // Send email to the user
        await sendEmail(user.email, emailSubject, text, html)
      }
    }
    // Respond back with the capture result
    return res.json({
      message: 'Payment captured successfully',
      captureResult
    })
  } catch (error) {
    console.error('Error during payment capture process:', error)
    return res.status(500).send('Error during payment capture process')
  }
}

const handleMultiSiteAdditionClinicalSite = async (
  protocolId,
  protocolCount
) => {
  const baseProtocolId = protocolId

  // Query to get the last entry where parent_protocol_id equals the baseProtocolId
  const getLastProtocolQuery = `
    SELECT * FROM protocols WHERE parent_protocol_id = ? ORDER BY id DESC LIMIT 1;
  `

  try {
    // Get the last protocol entry before the loop
    const lastProtocol = await new Promise((resolve, reject) => {
      db.query(getLastProtocolQuery, [baseProtocolId], (err, results) => {
        if (err) {
          console.error('Error fetching last protocol entry:', err)
          return reject(err)
        }
        resolve(results[0]) // Get the first result as the last entry
      })
    })

    if (!lastProtocol) {
      console.log('No protocols found for the given parent_protocol_id.')
      return
    }

    // Extract the last numeric part of the protocol_id (e.g., "IRBH00022-05" -> 05)
    const lastProtocolId = lastProtocol.protocol_id
    const lastProtocolNumber = parseInt(lastProtocolId.split('-').pop(), 10)

    console.log('Last protocol number:', lastProtocolNumber)

    // Generate new protocol IDs and insert them into the database
    for (let i = 1; i <= protocolCount; i++) {
      const newProtocolNumber = lastProtocolNumber + i
      const newProtocolId = `${baseProtocolId}-${String(newProtocolNumber).padStart(2, '0')}`
      const randomString = generateRandomString(10)

      const insertQuery = `
        INSERT INTO protocols (\`protocol_id\`, \`parent_protocol_id\`, \`research_type\`, \`status\`, \`varification_code\`, \`protocol_user_type\`) 
        VALUES (?)
      `
      const newGeneratedProtocol = [
        newProtocolId,
        baseProtocolId,
        'Clinical Site',
        2,
        randomString,
        'Clinical Site'
      ]

      try {
        await new Promise((resolve, reject) => {
          db.query(insertQuery, [newGeneratedProtocol], (err, results) => {
            if (err) {
              console.error('Error inserting protocol ID:', err)
              return reject(err)
            }
            console.log(`Inserted Protocol ID: ${newProtocolId}`)
            resolve(results)
          })
        })
      } catch (error) {
        console.error('Error generating protocol IDs:', error)
      }
    }
  } catch (error) {
    console.error('Error fetching last protocol:', error)
  }
}

export const capturePayment = async (req, res) => {
  const {
    orderId,
    payerId,
    amount,
    currencyCode,
    protocolId,
    researchType,
    userId
  } = req.body

  const captureOrderRequest = new paypal.orders.OrdersCaptureRequest(orderId)
  captureOrderRequest.requestBody({
    payer_id: payerId // Ensure payer_id is included in the capture request
  })

  try {
    const captureResult = await client().execute(captureOrderRequest)

    // Store payment details in the database
    const paymentData = {
      payment_id: captureResult.result.id,
      payer_id: payerId,
      amount: amount,
      currency: currencyCode,
      status: captureResult.result.status,
      protocol_id: protocolId,
      user_id: req.user.userId,
      payment_type: 'paypal'
    }

    // Insert payment data into the transactions table
    await new Promise((resolve, reject) => {
      db.query('INSERT INTO transactions SET ?', paymentData, (err, result) => {
        if (err) {
          console.error('Error storing payment in database:', err)
          return reject('Error storing payment in database')
        }
        resolve(result)
      })
    })

    // Update protocol status
    await new Promise((resolve, reject) => {
      const updateQuery =
        'UPDATE protocols SET status = ?, allow_edit = ? WHERE protocol_id = ?'
      const updateValues = [2, 1, protocolId]
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error('Error updating protocol status:', err)
          return reject('Error updating protocol status')
        }
        resolve(result)
      })
    })

    // Handle Multi-Site Sponsor logic
    if (researchType === 'Multi-Site Sponsor') {
      await handleMultiSiteProtocols(protocolId)

      // Fetch user details
      const user = await getUserInfo(userId)

      if (user) {
        // Fetch all protocols related to the parent protocol_id
        const protocolDetails = await new Promise((resolve, reject) => {
          db.query(
            'SELECT protocol_id, varification_code FROM protocols WHERE parent_protocol_id = ?',
            [protocolId],
            (err, result) => {
              if (err) {
                console.error('Error fetching protocol details:', err)
                return reject('Error fetching protocol details')
              }
              resolve(result) // This will return an array of protocols with their verification codes
            }
          )
        })
        // Prepare email content
        const transactionDate = new Date().toLocaleDateString() // MM/DD/YYYY
        const transactionTime = new Date().toLocaleTimeString() // HH:MM AM/PM

        const emailSubject =
          'Protocol Submission Confirmation & Protocol Approval & Processing Receipt'
        let emailBody = `
          <p>Dear ${user.name},</p>
          <p>You have successfully submitted your protocol ID # ${protocolId}.</p>
          <p>You will be contacted within 7 days for any further information needed for the approval process.</p>

          <h3>Receipt of Payment</h3>
          <table>
            <tr><td><strong>Merchant Name:</strong></td><td>IRB-HUB.COM</td></tr>
            <tr><td><strong>Merchant Address:</strong></td><td>IBR-HUB.COM DBA Young Scientist Of America 501C3, 3010 Legacy Dr. Frisco.Tx-75034</td></tr>
            <tr><td><strong>Transaction Date:</strong></td><td>${transactionDate}</td></tr>
            <tr><td><strong>Transaction Time:</strong></td><td>${transactionTime}</td></tr>
            <tr><td><strong>Customer Name:</strong></td><td>${user.name}</td></tr>
            <tr><td><strong>Customer Email Address:</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>Payment Method:</strong></td><td>Credit Card (Last 4 digits: XXXX)</td></tr>
            <tr><td><strong>Description of Goods/Services:</strong></td><td>[Commercial Approval of Protocol ID # ${protocolId}] - $${amount}</td></tr>
          </table>

          <p>No service tax is collected due to Tax Exempt Status.</p>
          <p>Please Note: The above payment is non-refundable.</p>
          <p>If you have any questions about your submission or this invoice, please contact us via email.</p>

          <h3>Protocol IDs and Verification Codes</h3>
          <table border="1" cellpadding="5">
            <tr><th>Protocol ID</th><th>Verification Code</th></tr>
        `

        // Add each protocol's protocol_id and verification code to the email body
        protocolDetails.forEach((protocol) => {
          emailBody += `
            <tr>
              <td>${protocol.protocol_id}</td>
              <td>${protocol.varification_code}</td>
            </tr>
          `
        })

        emailBody += `
          </table>
          <p>We have generated 5 clinical site registration access code 
            Please provide one Access code to every  clinical research site for registration.</p>
          <p>If you wish to have more clinical research sites please go to your protocol number on the right the three dots select and add clinical sites.</p>
          <p> It will direct you to the payment portal to add more clinical sites.</p>
          <p>Regards,<br/>Admin<br/>IRB-HUB.COM</p>
        `
        const text = emailBody
        const html = emailBody
        // Send email to the user
        await sendEmail(user.email, emailSubject, text, html)
      }
    } else {
      // Fetch user details
      const user = await getUserInfo(userId)
      if (user) {
        // Prepare email content
        const transactionDate = new Date().toLocaleDateString() // MM/DD/YYYY
        const transactionTime = new Date().toLocaleTimeString() // HH:MM AM/PM

        const emailSubject =
          'Protocol Submission Confirmation & Protocol Approval & Processing Receipt'
        let emailBody = `
          <p>Dear ${user.name},</p>
          <p>You have successfully submitted your protocol ID # ${protocolId}.</p>
          <p>You will be contacted within 7 days for any further information needed for the approval process.</p>

          <h3>Receipt of Payment</h3>
          <table>
            <tr><td><strong>Merchant Name:</strong></td><td>IRB-HUB.COM</td></tr>
            <tr><td><strong>Merchant Address:</strong></td><td>IBR-HUB.COM DBA Young Scientist Of America 501C3, 3010 Legacy Dr. Frisco.Tx-75034</td></tr>
            <tr><td><strong>Transaction Date:</strong></td><td>${transactionDate}</td></tr>
            <tr><td><strong>Transaction Time:</strong></td><td>${transactionTime}</td></tr>
            <tr><td><strong>Customer Name:</strong></td><td>${user.name}</td></tr>
            <tr><td><strong>Customer Email Address:</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>Payment Method:</strong></td><td>Credit Card (Last 4 digits: XXXX)</td></tr>
            <tr><td><strong>Description of Goods/Services:</strong></td><td>[Commercial Approval of Protocol ID # ${protocolId}] - $${amount}</td></tr>
          </table>

          <p>No service tax is collected due to Tax Exempt Status.</p>
          <p>Please Note: The above payment is non-refundable.</p>
          <p>If you have any questions about your submission or this invoice, please contact us via email.</p>
          <p>Regards,<br/>Admin<br/>IRB-HUB.COM</p>
        `
        const text = emailBody
        const html = emailBody
        // Send email to the user
        await sendEmail(user.email, emailSubject, text, html)
      }
    }

    // Respond back with the capture result
    return res.json({
      message: 'Payment captured successfully',
      captureResult
    })
  } catch (error) {
    console.error('Error during payment capture process:', error)
    return res.status(500).send('Error during payment capture process')
  }
}

// Function to handle Multi-Site Sponsor Protocols
const handleMultiSiteProtocols = async (protocolId) => {
  const baseProtocolId = protocolId
  for (let i = 1; i <= 5; i++) {
    const newProtocolId = `${baseProtocolId}-${String(i).padStart(2, '0')}`
    const randomString = generateRandomString(10)
    const insertQuery = `
      INSERT INTO protocols (\`protocol_id\`, \`parent_protocol_id\`, \`research_type\`, \`status\`, \`varification_code\`, \`protocol_user_type\`) 
      VALUES (?)
    `
    const newGeneratedProtocol = [
      newProtocolId,
      baseProtocolId,
      'Clinical Site',
      2,
      randomString,
      'Clinical Site'
    ]
    try {
      await new Promise((resolve, reject) => {
        db.query(insertQuery, [newGeneratedProtocol], (err, results) => {
          if (err) {
            console.error('Error inserting protocol ID:', err)
            return reject(err)
          }
          console.log(`Inserted Protocol ID: ${newProtocolId}`)
          resolve(results)
        })
      })
    } catch (error) {
      console.error('Error generating protocol IDs:', error)
    }
  }
}

function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const getPaymentAmountInfo = (req, res) => {
  const que = 'select * from event_price WHERE event_type=?'
  db.query(que, [req.body.paymentType.paymentType], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const createPayment = async (req, res) => {
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
      return_url: 'https://app.irbhub.org/success',
      cancel_url: 'https://app.irbhub.org/cancel'
    }
  })
  try {
    const order = await client().execute(createOrderRequest)
    const approvalUrl = order.result.links.find(
      (link) => link.rel === 'approve'
    ).href
    res.json({ approvalUrl })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error creating PayPal order')
  }
}

export const successPayment = (req, res) => {
  let result = {}
  result.status = 200
  result.msg = 'Payment success'
  return res.json(result)
}

export const canclePayment = (req, res) => {
  let result = {}
  result.status = 200
  result.msg = 'Payment cancelled'
  return res.json(result)
}

export const getTransactionListByType = (req, res) => {
  const { selectedUserType } = req.body
  let paymentType = ''
  if (selectedUserType === 'Transaction') {
    paymentType = 'paypal'
  } else if (selectedUserType === 'Waive Fee') {
    paymentType = 'waive_fee'
  }

  const que = paymentType
    ? `SELECT trans.*, users.name AS name, users.email, protocols.research_type AS protocol_name, protocols.protocol_user_type as protocol_pi 
       FROM transactions as trans 
       JOIN users AS users ON trans.user_id = users.id 
       JOIN protocols AS protocols ON trans.protocol_id = protocols.protocol_id 
       WHERE trans.payment_type = ? 
       ORDER BY trans.id DESC`
    : `SELECT trans.*, users.name AS name, users.email, protocols.research_type AS protocol_name, protocols.protocol_user_type as protocol_pi
       FROM transactions as trans 
       JOIN users AS users ON trans.user_id = users.id 
       JOIN protocols AS protocols ON trans.protocol_id = protocols.protocol_id 
       ORDER BY trans.id DESC`

  db.query(que, paymentType ? [paymentType] : [], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length > 0) {
      return res.status(200).json(data)
    } else {
      return res.status(404).json({ message: 'No transactions found.' })
    }
  })
}
