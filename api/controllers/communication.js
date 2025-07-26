import { db } from '../connect.js'
import sendEmail from '../emailService.js'
import { getUserInfo } from '../userData.js'

// Save Enquiry Request function
export const saveEnquiryRequest = async (req, res) => {
  try {
    const datetime = new Date()
    const attachmentString =
      req.body.attachments_file?.length > 0
        ? req.body.attachments_file.join(',')
        : ''

    const query =
      'INSERT INTO communication (`protocol_id`, `attachments_id`, `protocol_type`, `subject`, `body`, `created_by_user_type`, `status`, `reply_thread_parent_id`, `created_by`, `created_at`, `updated_at`) VALUES (?)'

    const values = [
      req.body.protocol_id,
      attachmentString,
      req.body.protocol_type,
      req.body.subject,
      req.body.body,
      req.body.created_by_user_type,
      req.body.status,
      req.body.reply_thread_parent_id ?? '',
      req.user.userId,
      datetime.toISOString(),
      datetime.toISOString()
    ]

    // Perform the insert query
    const result = await db.promise().query(query, [values])

    // Handle reply thread update if necessary
    if (
      req.body.reply_thread_parent_id != null &&
      req.body.reply_thread_parent_id !== ''
    ) {
      const updateQuery = 'UPDATE communication SET replied_by = ? WHERE id = ?'
      const updateValues = [
        req.body.created_by_user_type,
        req.body.reply_thread_parent_id
      ]
      await db.promise().query(updateQuery, updateValues)
    }

    // Fetch user info
    const user = await getUserInfo(req.body.created_by)

    // Fetch attachment info
    const getAttachment = await handleCommunicationRequest(result[0].insertId)

    // Extract and clean the attachment URLs
    const attachmentUrls = getAttachment
      .map((item) => item.attachments)
      .join(',') // Join the URLs into a single string
      .split(',') // Split the string by commas
      .map((url) => url.trim()) // Trim whitespace from each URL
      .filter(Boolean) // Remove any empty strings or invalid URLs

    // Create HTML for attachments
    let attachmentHtml = ''
    if (attachmentUrls.length > 0) {
      attachmentHtml = '<p>Attachments:</p><ul>'
      attachmentUrls.forEach((url, idx) => {
        attachmentHtml += `
          <li>
            <a href="${url}" target="_blank" rel="noopener noreferrer">
              Attachment ${idx + 1}
            </a>
          </li>
        `
      })
      attachmentHtml += '</ul>'
    }

    // Define email parameters
    const to = req.body.status === 2 ? user.email : 'help.irbhub@gmail.com'
    const subject = req.body.subject

    // Create the email HTML body
    const protocolNumberHtml = `<p>Protocol Number: ${req.body.protocol_id}</p>`
    const bodyHtml = `<p>${req.body.body}</p>`

    const emailHtml = `
      <div>
        ${protocolNumberHtml}
        ${bodyHtml}
        ${attachmentHtml}
      </div>
    `

    const text = emailHtml
    const html = emailHtml

    // Send email
    try {
      await sendEmail(to, subject, text, html)
      res.status(200).json({ status: 200, msg: 'Email sent successfully' })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      res.status(500).json({ status: 500, msg: 'Error sending email' })
    }
  } catch (err) {
    console.error('Error saving enquiry:', err)
    res.status(500).json({ status: 500, msg: 'Internal server error' })
  }
}

// Get Communication List by Protocol ID
export const getCommunicationListByProtocolId = async (req, res) => {
  const protocolId = req.body.protocol_id
  const status = req.body.status
  const que = `SELECT cm.*, 
       GROUP_CONCAT(cd.file_url SEPARATOR ', ') AS attachments
FROM communication AS cm
LEFT JOIN communication_documents AS cd 
    ON FIND_IN_SET(cd.id, cm.attachments_id) > 0
WHERE cm.protocol_id = ? 
  AND cm.status = ? 
  AND (cm.attachments_id IS NOT NULL AND cm.attachments_id != '' OR cm.attachments_id IS NULL OR cm.attachments_id = '')
GROUP BY cm.id ORDER BY cm.id DESC`

  try {
    // Execute the query using async/await
    const data = await new Promise((resolve, reject) => {
      db.query(que, [protocolId, status], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    if (data.length > 0) {
      return res.status(200).json(data)
    } else {
      return res.status(200).json({ message: 'No data found' })
    }
  } catch (err) {
    console.error('Database query error:', err)
    res.status(500).json({ message: 'Database query error', error: err })
  }
}

// New function to handle the request for communication list
export const handleCommunicationRequest = (id) => {
  return new Promise((resolve, reject) => {
    // Create a mock req and res object for the call
    const req = {
      body: {
        id: id
      }
    }

    // Mock response object
    const res = {
      status: (statusCode) => {
        return {
          json: (data) => {
            if (statusCode === 200) {
              resolve(data) // Resolve the promise with the data
            } else {
              reject(data) // Reject the promise with an error message
            }
          }
        }
      }
    }

    // Call the original function
    getCommunicationDetailsById(req, res)
  })
}

// Get Communication List by Protocol ID
export const getCommunicationDetailsById = async (req, res) => {
  const id = req.body.id
  const que = `SELECT cm.*, 
       GROUP_CONCAT(cd.file_url SEPARATOR ', ') AS attachments
FROM communication AS cm
LEFT JOIN communication_documents AS cd 
    ON FIND_IN_SET(cd.id, cm.attachments_id) > 0
WHERE cm.id = ? 
  AND (cm.attachments_id IS NOT NULL AND cm.attachments_id != '')
GROUP BY cm.id`

  try {
    // Execute the query using async/await
    const data = await new Promise((resolve, reject) => {
      db.query(que, [id], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    if (data.length >= 0) {
      return res.status(200).json(data)
    } else {
      return res.status(404).json({ message: 'No data found' })
    }
  } catch (err) {
    console.error('Database query error:', err)
    res.status(500).json({ message: 'Database query error', error: err })
  }
}

export const downloadCommunicationPdf = async (req, res) => {
  const protocolId = req.body.protocolId

  // SQL query to get communications with attachments
  const que = `SELECT cm.*, 
                  GROUP_CONCAT(cd.file_url SEPARATOR ', ') AS attachments
              FROM communication AS cm
              LEFT JOIN communication_documents AS cd 
                  ON FIND_IN_SET(cd.id, cm.attachments_id) > 0
              WHERE cm.protocol_id = ? 
                AND (cm.attachments_id IS NOT NULL AND cm.attachments_id != '' 
                     OR cm.attachments_id IS NULL OR cm.attachments_id = '')
              GROUP BY cm.id`

  try {
    // Execute the query using async/await
    const data = await new Promise((resolve, reject) => {
      db.query(que, [protocolId], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    if (data.length > 0) {
      // To store the final grouped data
      const quariedGroupedData = []

      // Loop through the data to group and aggregate root threads
      data.forEach((item) => {
        if (item.reply_thread_parent_id === '') {
          // Add an empty replies array to the current item (root thread)
          item.replies = [] // Initializing as an array for storing replies

          // Push the root item into the quariedGroupedData array
          quariedGroupedData.push(item)
        }
      })

      // Loop through the data again to associate replies with their parent threads
      data.forEach((innerItem) => {
        if (innerItem.reply_thread_parent_id !== '') {
          // Find the parent thread by comparing the reply_thread_parent_id with the root thread's id
          const parentThread = quariedGroupedData.find(
            (parent) =>
              String(parent.id) === String(innerItem.reply_thread_parent_id)
          )

          if (parentThread) {
            // Add the innerItem as a reply to the parent's replies array
            parentThread.replies.push(innerItem)
          }
        }
      })

      // Send the grouped results as the response
      return res.status(200).json(quariedGroupedData)
    } else {
      return res.status(404).json({ message: 'No data found' })
    }
  } catch (err) {
    console.error('Database query error:', err)
    res.status(500).json({ message: 'Database query error', error: err })
  }
}
