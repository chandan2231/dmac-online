import { db } from '../connect.js'
import fs, { stat } from 'fs'
import { generatePdfFromHTML } from '../utils/pdfService.js'
import * as s3Service from '../utils/s3Service.js'
import PdfTemplates from '../templates/generate-pdf.js'
import sendEmail from '../emailService.js'
import { getUserInfo } from '../userData.js'
import bcrypt from 'bcryptjs'

export const getCTMProtocolsReport = (req, res) => {
  const que = `SELECT 
      emd.*,
      users.name, 
      users.mobile, 
      users.email
    FROM 
      external_monitor_documents AS emd
    LEFT JOIN 
      users ON emd.created_by = users.id
    WHERE 
      emd.protocol_id = ?`
  db.query(que, [req.body.protocolId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const getCRCList = (req, res) => {
  const que =
    'select * from clinical_research_coordinator WHERE status=? AND added_by=?'
  db.query(que, [1, req.user.userId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const createCRC = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company_name,
      city,
      country,
      zip_code,
      license_number,
      added_by
    } = req.body

    // Check if the email already exists
    const checkEmailQuery =
      'SELECT * FROM clinical_research_coordinator WHERE email = ?'
    const existingUser = await new Promise((resolve, reject) => {
      db.query(checkEmailQuery, [email], (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })

    if (existingUser?.length > 0) {
      return res.status(400).json({
        status: 400,
        msg: 'Email already exists. Please use a different email.'
      })
    }

    // Insert new user into the database
    const insertQuery = `
      INSERT INTO clinical_research_coordinator 
      (name, email, mobile, company_name, city, country, zip_code, license_number, added_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [
          name,
          email,
          phone,
          company_name,
          city,
          country,
          zip_code,
          license_number,
          added_by
        ],
        (err, data) => {
          if (err) return reject(err)
          resolve(data)
        }
      )
    })

    // Send success response
    return res.status(200).json({
      status: 200,
      msg: 'Clinical Research Coordinator has been created successfully.'
    })
  } catch (err) {
    console.error('Error during registration:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const getExternalMonitorList = (req, res) => {
  const que =
    'select * from users WHERE user_type=? AND status=? AND added_by=?'
  db.query(que, ['external_monitor', 1, req.user.userId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const createExternalMonitor = async (req, res) => {
  try {
    // Check if the email already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?'
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
      return res.status(500).json({
        status: 500,
        msg: 'Email already exists. Please try with another email.'
      })
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)

    // Insert new user into the database
    const insertQuery = `
      INSERT INTO users (name, email, mobile, password, company_name, city, country, zip_code, researcher_type, user_type, license_number, added_by) 
      VALUES (?)`
    const values = [
      req.body.name,
      req.body.email,
      req.body.phone,
      hashedPassword,
      req.body.company_name,
      req.body.city,
      req.body.country,
      req.body.zip_code,
      req.body.researcher_type,
      req.body.user_type,
      req.body.license_number,
      req.user.userId
    ]

    const insertResult = await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    // Now, send the welcome email
    const loginUrl = `${process.env.DOMAIN}signin`
    const to = req.body.email
    const subject = 'Welcome to IRBHUB'
    const greetingHtml = `<p>Dear ${req.body.name},</p>`
    let bodyHtml = `<p>You have successfully registered with IRBHUB as a ${req.body.researcher_type} role.</p>`
    bodyHtml += `<p>Your login details are</p>`
    bodyHtml += `<p>Email: ${req.body.email}</p>`
    bodyHtml += `<p>Password: ${req.body.password}</p>`
    bodyHtml += `<p>Login URL: <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">
              Click here
            </a></p>`
    const emailHtml = `
      <div>
        ${greetingHtml}
        ${bodyHtml}
      </div>`
    const text = emailHtml
    const html = emailHtml

    // Send email
    try {
      await sendEmail(to, subject, text, html)
      return res.status(200).json({
        status: 200,
        msg: 'Clinical Trial Monitor has been created and email sent'
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return res
        .status(500)
        .json({ status: 500, msg: 'User created but failed to send email.' })
    }
  } catch (err) {
    console.error('Error during registration:', err)
    return res.status(500).json({ status: 500, msg: 'Internal server error.' })
  }
}

export const multiSiteChildProtocolsList = (req, res) => {
  const que = `SELECT 
      ps.protocol_id, 
      ps.parent_protocol_id, 
      ps.created_at, 
      users.name, 
      users.mobile, 
      users.email
    FROM 
      protocols AS ps
    LEFT JOIN 
      users ON ps.added_by = users.id
    WHERE 
      ps.parent_protocol_id = ?`
  db.query(que, [req.body.protocolId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

// export const checkMultisiteProtocolExist = (req, res) => {
//   const que =
//     'SELECT * FROM protocols WHERE protocol_id = ? AND varification_code = ?'
//   db.query(
//     que,
//     [req.body.protocolId, req.body.verificationCode],
//     (err, data) => {
//       if (err) {
//         return res.status(500).json({ message: 'Database error', error: err })
//       }

//       if (data.length > 0) {
//         const updateQuery = `
//         UPDATE protocols
//         SET added_by = ?
//         WHERE protocol_id = ? AND varification_code = ?
//       `
//         const updateValues = [
//           req.body.loggedinUserId,
//           req.body.protocolId,
//           req.body.verificationCode
//         ]

//         db.query(updateQuery, updateValues, (err, result) => {
//           if (err) {
//             return res
//               .status(500)
//               .json({ message: 'Failed to update protocol', error: err })
//           }

//           return res
//             .status(200)
//             .json({ message: 'Protocol Verified successfully', status: 200 })
//         })
//       } else {
//         return res.status(404).json({
//           message:
//             'Entered protocol id and verification code not matched. Please check your input and try again.'
//         })
//       }
//     }
//   )
// }

export const checkMultisiteProtocolExist = (req, res) => {
  const que =
    'SELECT * FROM protocols WHERE protocol_id = ? AND varification_code = ?'
  db.query(
    que,
    [req.body.protocolId, req.body.verificationCode],
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Database error', error: err, status: 500 })
      }

      if (data.length > 0) {
        const protocol = data[0]

        // Check if protocol is already assigned
        if (
          protocol.protocol_id &&
          protocol.varification_code &&
          protocol.added_by &&
          protocol.added_by !== '0'
        ) {
          return res.status(200).json({
            message: 'Protocol is already assigned to someone.',
            status: 500
          })
        }

        // Proceed with assignment
        const updateQuery = `
          UPDATE protocols
          SET added_by = ?
          WHERE protocol_id = ? AND varification_code = ?
        `
        const updateValues = [
          req.body.loggedinUserId,
          req.body.protocolId,
          req.body.verificationCode
        ]

        db.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return res.status(500).json({
              message: 'Failed to update protocol',
              error: err,
              status: 500
            })
          }

          return res
            .status(200)
            .json({ message: 'Protocol Verified successfully', status: 200 })
        })
      } else {
        return res.status(404).json({
          message:
            'Entered protocol id and verification code not matched. Please check your input and try again.',
          status: 404
        })
      }
    }
  )
}

export const createProtocol = async (req, res) => {
  try {
    const prefix = 'IRBH'
    const que1 = `SELECT protocol_id FROM protocols WHERE parent_protocol_id IS NULL OR parent_protocol_id = '' ORDER BY id DESC LIMIT 1`
    const result = await new Promise((resolve, reject) => {
      db.query(que1, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
    const data = Array.isArray(result) ? result : [result]
    let newProtocolNumber
    if (data && data.length > 0) {
      const lastProtocolNumber = data[0].protocol_id
      const lastNumber = parseInt(lastProtocolNumber.replace(prefix, ''), 10) // Remove the prefix and convert to number
      const incrementedNumber = lastNumber + 1
      newProtocolNumber = prefix + incrementedNumber.toString().padStart(5, '0') // Ensure the number has leading zeros
    } else {
      newProtocolNumber = prefix + '00001'
    }

    const que2 =
      'INSERT INTO protocols (`protocol_id`, `research_type`, `protocol_user_type`, `added_by`) VALUES (?)'
    const protocolValue = [
      newProtocolNumber,
      req.body.research_type_id,
      req.body.protocol_user_type,
      req.user.userId
    ]

    // Wrap the insert query in a promise to use async/await
    await new Promise((resolve, reject) => {
      db.query(que2, [protocolValue], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    // Fetch user info
    const user = await getUserInfo(req.user.userId)
    const to = user.email
    const subject = `Save Protocol ID ${newProtocolNumber}`
    const grettingHtml = `<p>Save Protocol ID</p><p>Dear ${user.name},</p>`
    let bodyHtml = `<p>Thank you for choosing IRB-HUB for your research needs.</p>`
    bodyHtml += `<p>You have started the IRB-HUB protocol registration,  the assign protocol identification number is as below for all your future references.</p>`
    bodyHtml += `<p>Your Protocol Number is ${newProtocolNumber}.</p>`
    bodyHtml += `<p>Please save the protocol ID.</p>`
    bodyHtml += `<p>You have 6 months to complete the protocol. All the incomplete protocol after 6 months are automatically deleted from the file and database.</p>`
    bodyHtml += `If you have any questions or concern please email to us.</p>`
    bodyHtml += `<p>help.irbhub@gmail.com</p>`
    const emailHtml = `
      <div>
        ${grettingHtml}
        ${bodyHtml}
      </div>`
    const text = emailHtml
    const html = emailHtml

    // Send email
    try {
      await sendEmail(to, subject, text, html)

      const resultResponse = {
        status: 200,
        msg:
          'Research type has been created with protocol number: ' +
          newProtocolNumber
      }
      return res.json(resultResponse)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      res.status(500).json({ status: 500, msg: 'Error sending email' })
    }
  } catch (err) {
    // console.error('Error in creating protocol:', err)
    return res.status(500).json({
      status: 500,
      msg: 'An error occurred while creating the protocol'
    })
  }
}

export const getProtocolList = (req, res) => {
  const { selectedStatus } = req.body
  const status =
    selectedStatus === 'Created'
      ? 1
      : selectedStatus === 'Under Review'
        ? 2
        : selectedStatus === 'Approved'
          ? 3
          : selectedStatus === 'Rejected'
            ? 4
            : null
  const page = Number(req.body.page) || 0 // Default to page 0
  const pageSize = Number(req.body.pageSize) || 10 // Default to 10 records per page
  const offset = page * pageSize // Offset calculation based on 0-based index

  // Base query to count the total protocols
  let countQuery = 'SELECT COUNT(*) AS total FROM protocols WHERE added_by = ?'
  let countParams = [req.user.userId]

  // Base query to fetch protocols
  let dataQuery = 'SELECT * FROM protocols WHERE added_by = ?'
  let dataParams = [req.user.userId]

  // Modify queries if selectedStatus is provided
  if (selectedStatus !== 'All' && status !== null) {
    countQuery += ' AND status = ?'
    dataQuery += ' AND status = ?'
    countParams.push(status)
    dataParams.push(status)
  }

  // Add ORDER BY, LIMIT, and OFFSET clauses to data query
  dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?'
  dataParams.push(pageSize, offset)

  // Execute count query
  db.query(countQuery, countParams, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message })

    const totalRecords = countResult[0].total
    const totalPages = Math.ceil(totalRecords / pageSize)

    // Execute data query
    db.query(dataQuery, dataParams, (err, data) => {
      if (err) return res.status(500).json({ error: err.message })

      return res.status(200).json({
        data,
        pagination: {
          currentPage: page, // Starts from 0
          totalPages,
          totalRecords,
          pageSize
        }
      })
    })
  })
}

export const getApprovedProtocolCheck = (req, res) => {
  const que = 'SELECT * from protocols WHERE added_by=? AND status=?'
  db.query(que, [req.user.userId, 3], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data.length)
    }
  })
}

export const getApprovedProtocolList = (req, res) => {
  const que = 'SELECT * from protocols WHERE added_by=? AND status=?'
  db.query(que, [req.user.userId, 3], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

export const saveFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const datetime = new Date().toISOString().slice(0, 10)
  let tableName = 'protocol_documents' // Default table
  let query = ''
  let values = []

  try {
    // Upload file to S3
    const uploadedFile = await s3Service.uploadFile(req.file.path)
    const imageUrl = uploadedFile.cdnUrl

    // Determine table based on request conditions
    if (req.body.protocolType === 'continuein_review') {
      tableName = 'continuein_review_documents'
    } else if (req.body.protocolType === 'Protocol Amendment Request') {
      tableName = 'protocol_documents'
    } else if (req.body.informationType === 'communication_attachments') {
      tableName = 'communication_documents'
    } else if (req.body.identifierType === 'external_monitor') {
      tableName = 'external_monitor_documents'
    } else if (req.body.informationType === 'document_verification') {
      tableName = 'educational_document_verification'
    }
    // Define the SQL query
    if (req.body.informationType === 'communication_attachments') {
      query = `
      INSERT INTO ${tableName} 
      (protocol_id, protocol_type, information_type, document_name, file_name, file_url, created_by_user_type, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

      values = [
        req.body.protocolId,
        req.body.protocolType,
        req.body.informationType,
        req.body.documentName,
        req.file.filename,
        imageUrl,
        req.body.createdByUserType,
        req.user.userId,
        datetime,
        datetime
      ]
    } else if (req.body.informationType === 'document_verification') {
      query = `
      INSERT INTO ${tableName} 
      (user_id, protocol_type, information_type, pi_affiliation_type, file_name, file_url, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

      values = [
        req.body.userId,
        req.body.protocolType,
        req.body.informationType,
        req.body.subType,
        req.file.filename,
        imageUrl,
        req.body.userId,
        datetime,
        datetime
      ]
    } else {
      query = `
    INSERT INTO ${tableName} 
    (protocol_id, protocol_type, information_type, document_name, file_name, file_url, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

      values = [
        req.body.protocolId,
        req.body.protocolType,
        req.body.informationType,
        req.body.documentName,
        req.file.filename,
        imageUrl,
        req.user.userId,
        datetime,
        datetime
      ]
    }

    // Run the query using Promises
    const insertResult = await new Promise((resolve, reject) => {
      db.query(query, values, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    // Remove the file from the local server
    fs.unlinkSync(req.file.path)

    return res.status(200).json({ id: insertResult.insertId })
  } catch (error) {
    console.error('Error saving file:', error)

    // Ensure file is removed if an error occurs
    if (req.file?.path) {
      fs.unlinkSync(req.file.path)
    }

    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const continueinReviewGeneratePdf = async (req, res) => {
  const continuinReviewDetailObj = {}
  const que = 'select * from risk_assessment where protocol_id = ?'
  db.query(que, [req.body.protocolId], (err, data) => {
    if (data.length >= 0) {
      continuinReviewDetailObj.risk_assessment = data[0] || {}
      const docQue =
        'select * from continuein_review_documents where protocol_id = ? AND information_type = ?'
      db.query(
        docQue,
        [req.body.protocolId, 'risk_assessment'],
        (err, data) => {
          if (data.length >= 0) {
            continuinReviewDetailObj.risk_assessment.documents = data || {}
          } else {
            continuinReviewDetailObj.risk_assessment.documents = []
          }
        }
      )
      const que2 =
        'select * from informed_consent_process where protocol_id = ?'
      db.query(que2, [req.body.protocolId], (err, data) => {
        if (data.length >= 0) {
          continuinReviewDetailObj.informed_consent_process = data[0] || {}
          const docQue =
            'select * from continuein_review_documents where protocol_id = ? AND information_type = ?'
          db.query(
            docQue,
            [req.body.protocolId, 'informed_consent_process'],
            (err, data) => {
              if (data.length >= 0) {
                continuinReviewDetailObj.informed_consent_process.documents =
                  data || {}
              } else {
                continuinReviewDetailObj.informed_consent_process.documents = []
              }
            }
          )
          const que3 =
            'select * from investigator_instuation_info where protocol_id = ?'
          db.query(que3, [req.body.protocolId], (err, data) => {
            if (data.length >= 0) {
              continuinReviewDetailObj.investigator_instuation_info =
                data[0] || {}
              const docQue =
                'select * from continuein_review_documents where protocol_id = ? AND information_type = ?'
              db.query(
                docQue,
                [req.body.protocolId, 'investigator_and_institution'],
                (err, data) => {
                  if (data.length >= 0) {
                    continuinReviewDetailObj.investigator_instuation_info.documents =
                      data || {}
                  } else {
                    continuinReviewDetailObj.investigator_instuation_info.documents =
                      []
                  }
                }
              )
              const que4 =
                'select * from research_progress_info where protocol_id = ?'
              db.query(que4, [req.body.protocolId], (err, data) => {
                if (data.length >= 0) {
                  continuinReviewDetailObj.research_progress_info =
                    data[0] || {}
                  const docQue =
                    'select * from continuein_review_documents where protocol_id = ? AND information_type = ?'
                  db.query(
                    docQue,
                    [req.body.protocolId, 'research_progress'],
                    async (err, data) => {
                      if (data.length >= 0) {
                        continuinReviewDetailObj.research_progress_info.documents =
                          data || {}
                      } else {
                        continuinReviewDetailObj.research_progress_info.documents =
                          []
                      }

                      try {
                        const protocolId = req.body
                        const template =
                          await PdfTemplates.ContinuingReviewPdfTemplate(
                            continuinReviewDetailObj,
                            protocolId
                          )
                        let filePath = await generatePdfFromHTML(
                          template,
                          req.body.protocolId
                        )
                        let sRL = await s3Service.uploadFile(filePath)
                        let pdfUrl = sRL.cdnUrl
                        // Remove the file from the local server
                        fs.unlinkSync(filePath)
                        return res.status(200).json({ pdfUrl })
                      } catch (error) {
                        console.log(error)
                        return res
                          .status(500)
                          .json({ message: 'Internal Server Error' })
                      }
                    }
                  )
                }
              })
            }
          })
        }
      })
    }
  })
  return
}

const getProtocolDocuments = async (protocolId, informationType) => {
  const query =
    'select * from protocol_documents where protocol_id = ? AND information_type = ?'
  return new Promise((resolve, reject) => {
    db.query(query, [protocolId, informationType], (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.length > 0 ? data : [])
      }
    })
  })
}

const getProtocolDetails = async (protocolId, protocolType) => {
  const protocolDetailsObj = {}

  const queries = {
    'Clinical Site': [
      {
        key: 'protocol_information',
        query: 'select * from protocol_information where protocol_id = ?'
      },
      {
        key: 'investigator_information',
        query: 'select * from investigator_information where protocol_id = ?'
      },
      {
        key: 'study_information',
        query: 'select * from study_information where protocol_id = ?'
      },
      {
        key: 'informed_consent',
        query: 'select * from informed_consent where protocol_id = ?'
      },
      {
        key: 'protocol_procedure',
        query: 'select * from protocol_procedure where protocol_id = ?'
      },
      {
        key: 'protocol_details',
        query: 'select * from protocols where protocol_id = ?'
      }
    ],
    'Multi-Site Sponsor': [
      {
        key: 'protocol_information',
        query: 'select * from protocol_information where protocol_id = ?'
      },
      {
        key: 'contact_information',
        query: 'select * from contact_information where protocol_id = ?'
      },
      {
        key: 'study_information',
        query: 'select * from study_information where protocol_id = ?'
      },
      {
        key: 'informed_consent',
        query: 'select * from informed_consent where protocol_id = ?'
      },
      {
        key: 'protocol_procedure',
        query: 'select * from protocol_procedure where protocol_id = ?'
      },
      {
        key: 'protocol_details',
        query: 'select * from protocols where protocol_id = ?'
      }
    ],
    'Document Review': [
      {
        key: 'protocol_information',
        query: 'select * from protocol_information where protocol_id = ?'
      },
      {
        key: 'investigator_information',
        query: 'select * from investigator_information where protocol_id = ?'
      },
      {
        key: 'informed_consent',
        query: 'select * from informed_consent where protocol_id = ?'
      },
      {
        key: 'protocol_details',
        query: 'select * from protocols where protocol_id = ?'
      }
    ],
    default: [
      {
        key: 'investigator_protocol_information',
        query:
          'select * from investigator_protocol_information where protocol_id = ?'
      },
      {
        key: 'consent_information',
        query:
          'select * from clinical_consent_information where protocol_id = ?'
      },
      {
        key: 'protocol_details',
        query: 'select * from protocols where protocol_id = ?'
      }
    ]
  }

  const selectedQueries = queries[protocolType] || queries['default']

  try {
    // Fetch all details for the protocol
    for (const { key, query } of selectedQueries) {
      const data = await new Promise((resolve, reject) => {
        db.query(query, [protocolId], (err, data) => {
          if (err) reject(err)
          else resolve(data.length > 0 ? data[0] : {})
        })
      })
      protocolDetailsObj[key] = data

      // Fetch associated documents for each key
      const documents = await getProtocolDocuments(protocolId, key)
      protocolDetailsObj[key].documents = documents
    }
    return protocolDetailsObj
  } catch (error) {
    throw new Error(`Error fetching protocol details: ${error.message}`)
  }
}

export const protocolGeneratePdf = async (req, res) => {
  const { protocolId, protocolType } = req.body
  try {
    // Fetch protocol details
    const protocolDetailsObj = await getProtocolDetails(
      protocolId,
      protocolType
    )
    // Generate PDF
    let template
    if (protocolType === 'Clinical Site') {
      template =
        await PdfTemplates.protocolAmendmentRequestPdfTemplate.ClinicalSitePdfTemplate(
          protocolDetailsObj,
          req.body
        )
    } else if (protocolType === 'Multi-Site Sponsor') {
      template =
        await PdfTemplates.protocolAmendmentRequestPdfTemplate.MultiSiteSponsorPdfTemplate(
          protocolDetailsObj,
          req.body
        )
    } else if (protocolType === 'Document Review') {
      template =
        await PdfTemplates.protocolAmendmentRequestPdfTemplate.DocumentReviewPdfTemplate(
          protocolDetailsObj,
          req.body
        )
    } else {
      template =
        await PdfTemplates.protocolAmendmentRequestPdfTemplate.PrincipalInvestigatorPdfTemplate(
          protocolDetailsObj,
          req.body
        )
    }
    // Generate the PDF from template HTML
    const filePath = await generatePdfFromHTML(
      template,
      protocolId,
      protocolType
    )

    // Upload the PDF to S3
    const sRL = await s3Service.uploadFile(filePath)
    const pdfUrl = sRL.cdnUrl

    // Remove the file from the local server
    fs.unlinkSync(filePath)

    // Respond with the generated PDF URL
    return res.status(200).json({ pdfUrl })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// export const saveFile = async (req, res) => {
//   console.log('req.body', req.body)
//   return
//   var datetime = new Date()
//   try {
//     if (req.file) {
//       let sRL = await s3Service.uploadFile(req.file.path)
//       let imageUrl = sRL.cdnUrl
//       // Remove the file from the local server
//       fs.unlinkSync(req.file.path)
//       if (req.body.protocolType === 'continuein_review') {
//         const que2 =
//           'insert into continuein_review_documents (`protocol_id`, `protocol_type`, `information_type`, `document_name`, `file_name`, `file_url`, `created_by`, `created_at`, `updated_at`) value (?)'
//         const protocolValue = [
//           req.body.protocolId,
//           req.body.protocolType,
//           req.body.informationType,
//           req.body.documentName,
//           req.file.filename,
//           imageUrl,
//           req.user.userId,
//           datetime.toISOString().slice(0, 10),
//           datetime.toISOString().slice(0, 10)
//         ]
//         db.query(que2, [protocolValue], (err, data) => {
//           if (err) return res.status(500).json(err)
//           if (data) {
//             return res.status(200).json({ id: data.insertId })
//           }
//         })
//       } else if (req.body.protocolType === 'Protocol Amendment Request') {
//         const que2 =
//           'insert into protocol_documents (`protocol_id`, `protocol_type`, `information_type`, `document_name`, `file_name`, `file_url`, `created_by`, `created_at`, `updated_at`) value (?)'
//         const protocolValue = [
//           req.body.protocolId,
//           req.body.protocolType,
//           req.body.informationType,
//           req.body.documentName,
//           req.file.filename,
//           imageUrl,
//           req.user.userId,
//           datetime.toISOString().slice(0, 10),
//           datetime.toISOString().slice(0, 10)
//         ]
//         db.query(que2, [protocolValue], (err, data) => {
//           if (err) return res.status(500).json(err)
//           if (data) {
//             return res.status(200).json({ id: data.insertId })
//           }
//         })
//       } else if (req.body.informationType === 'communication_attachments') {
//         const que2 =
//           'insert into communication_documents (`protocol_id`, `protocol_type`, `information_type`, `document_name`, `file_name`, `file_url`, `created_by_user_type`, `created_by`, `created_at`, `updated_at`) value (?)'
//         const protocolValue = [
//           req.body.protocolId,
//           req.body.protocolType,
//           req.body.informationType,
//           req.body.documentName,
//           req.file.filename,
//           imageUrl,
//           req.body.createdByUserType,
//           req.user.userId,
//           datetime.toISOString().slice(0, 10),
//           datetime.toISOString().slice(0, 10)
//         ]
//         db.query(que2, [protocolValue], (err, data) => {
//           if (err) return res.status(500).json(err)
//           if (data) {
//             return res.status(200).json({ id: data.insertId })
//           }
//         })
//       } else if (req.body.identifierType === 'external_monitor') {
//         const que2 =
//           'insert into external_monitor_documents (`protocol_id`, `protocol_type`, `information_type`, `document_name`, `file_name`, `file_url`, `created_by`, `created_at`, `updated_at`) value (?)'
//         const protocolValue = [
//           req.body.protocolId,
//           req.body.protocolType,
//           req.body.informationType,
//           req.body.documentName,
//           req.file.filename,
//           imageUrl,
//           req.user.userId,
//           datetime.toISOString().slice(0, 10),
//           datetime.toISOString().slice(0, 10)
//         ]
//         db.query(que2, [protocolValue], (err, data) => {
//           if (err) return res.status(500).json(err)
//           if (data) {
//             return res.status(200).json({ id: data.insertId })
//           }
//         })
//       } else {
//         const que2 =
//           'insert into protocol_documents (`protocol_id`, `protocol_type`, `information_type`, `document_name`, `file_name`, `file_url`, `created_by`, `created_at`, `updated_at`) value (?)'
//         const protocolValue = [
//           req.body.protocolId,
//           req.body.protocolType,
//           req.body.informationType,
//           req.body.documentName,
//           req.file.filename,
//           imageUrl,
//           req.user.userId,
//           datetime.toISOString().slice(0, 10),
//           datetime.toISOString().slice(0, 10)
//         ]
//         db.query(que2, [protocolValue], (err, data) => {
//           if (err) return res.status(500).json(err)
//           if (data) {
//             return res.status(200).json({ id: data.insertId })
//           }
//         })
//       }
//     } else {
//       return res.status(400).json({ message: 'No file uploaded' })
//     }
//   } catch (error) {
//     console.log({ error })
//     fs.unlinkSync(req.file?.path)
//     return res.status(500).json({ message: 'Internal Server Error' })
//   }
// }

// export const protocolGeneratePdf = async (req, res) => {
//   const protocolDetailsObj = {}
//   if (req.body.protocolType === 'Clinical Site') {
//     const que1 = 'select * from protocol_information where protocol_id = ?'
//     db.query(que1, [req.body.protocolId], (err, data) => {
//       if (data.length >= 0) {
//         protocolDetailsObj.protocol_information = data[0] || {}
//         const docQue =
//           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//         db.query(
//           docQue,
//           [req.body.protocolId, 'protocol_information'],
//           async (err, data) => {
//             if (data.length >= 0) {
//               protocolDetailsObj.protocol_information.documents = data || {}
//             } else {
//               protocolDetailsObj.protocol_information.documents = []
//             }
//           }
//         )
//         const que2 =
//           'select * from investigator_information where protocol_id = ?'
//         db.query(que2, [req.body.protocolId], (err, data) => {
//           if (data.length >= 0) {
//             protocolDetailsObj.investigator_information = data[0] || {}
//             const docQue =
//               'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//             db.query(
//               docQue,
//               [req.body.protocolId, 'investigator_information'],
//               async (err, data) => {
//                 if (data.length >= 0) {
//                   protocolDetailsObj.investigator_information.documents =
//                     data || {}
//                 } else {
//                   protocolDetailsObj.investigator_information.documents = []
//                 }
//               }
//             )
//             const que3 = 'select * from study_information where protocol_id = ?'
//             db.query(que3, [req.body.protocolId], (err, data) => {
//               if (data.length >= 0) {
//                 protocolDetailsObj.study_information = data[0] || {}
//                 const docQue =
//                   'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                 db.query(
//                   docQue,
//                   [req.body.protocolId, 'study_information'],
//                   async (err, data) => {
//                     if (data.length >= 0) {
//                       protocolDetailsObj.study_information.documents =
//                         data || {}
//                     } else {
//                       protocolDetailsObj.study_information.documents = []
//                     }
//                   }
//                 )
//                 const que4 =
//                   'select * from informed_consent where protocol_id = ?'
//                 db.query(que4, [req.body.protocolId], (err, data) => {
//                   if (data.length >= 0) {
//                     protocolDetailsObj.informed_consent = data[0] || {}
//                     const docQue =
//                       'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                     db.query(
//                       docQue,
//                       [req.body.protocolId, 'informed_consent'],
//                       async (err, data) => {
//                         if (data.length >= 0) {
//                           protocolDetailsObj.informed_consent.documents = data
//                         } else {
//                           protocolDetailsObj.informed_consent.documents = []
//                         }
//                       }
//                     )
//                     const que5 =
//                       'select * from protocol_procedure where protocol_id = ?'
//                     db.query(que5, [req.body.protocolId], (err, data) => {
//                       if (data.length >= 0) {
//                         protocolDetailsObj.protocol_procedure = data[0] || {}
//                         const docQue =
//                           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                         db.query(
//                           docQue,
//                           [req.body.protocolId, 'protocol_procedure'],
//                           async (err, data) => {
//                             if (data.length >= 0) {
//                               protocolDetailsObj.protocol_procedure.documents =
//                                 data
//                             } else {
//                               protocolDetailsObj.protocol_procedure.documents =
//                                 []
//                             }
//                             try {
//                               const protocolId = req.body
//                               const template =
//                                 await PdfTemplates.protocolAmendmentRequestPdfTemplate.ClinicalSitePdfTemplate(
//                                   protocolDetailsObj,
//                                   protocolId
//                                 )
//                               let filePath = await generatePdfFromHTML(template)
//                               console.log('filePath', filePath)
//                               let sRL = await s3Service.uploadFile(filePath)
//                               console.log('sRL', sRL)
//                               let pdfUrl = sRL.cdnUrl
//                               // Remove the file from the local server
//                               fs.unlinkSync(filePath)
//                               return res.status(200).json({ pdfUrl })
//                             } catch (error) {
//                               console.log(error)
//                               return res
//                                 .status(500)
//                                 .json({ message: 'Internal Server Error' })
//                             }
//                           }
//                         )
//                       }
//                     })
//                   }
//                 })
//               }
//             })
//           }
//         })
//       }
//     })
//   } else if (req.body.protocolType === 'Multi-Site Sponsor') {
//     const que1 = 'select * from protocol_information where protocol_id = ?'
//     db.query(que1, [req.body.protocolId], (err, data) => {
//       if (data.length >= 0) {
//         protocolDetailsObj.protocol_information = data[0] || {}
//         const docQue =
//           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//         db.query(
//           docQue,
//           [req.body.protocolId, 'protocol_information'],
//           async (err, data) => {
//             if (data.length >= 0) {
//               protocolDetailsObj.protocol_information.documents = data
//             } else {
//               protocolDetailsObj.protocol_information.documents = []
//             }
//           }
//         )
//         const que2 = 'select * from contact_information where protocol_id = ?'
//         db.query(que2, [req.body.protocolId], (err, data) => {
//           if (data.length >= 0) {
//             protocolDetailsObj.contact_information = data[0] || {}
//             const docQue =
//               'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//             db.query(
//               docQue,
//               [req.body.protocolId, 'contact_information'],
//               async (err, data) => {
//                 if (data.length >= 0) {
//                   protocolDetailsObj.contact_information.documents = data
//                 } else {
//                   protocolDetailsObj.contact_information.documents = []
//                 }
//               }
//             )
//             const que3 = 'select * from study_information where protocol_id = ?'
//             db.query(que3, [req.body.protocolId], (err, data) => {
//               if (data.length >= 0) {
//                 protocolDetailsObj.study_information = data[0] || {}
//                 const docQue =
//                   'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                 db.query(
//                   docQue,
//                   [req.body.protocolId, 'study_information'],
//                   async (err, data) => {
//                     if (data.length >= 0) {
//                       protocolDetailsObj.study_information.documents = data
//                     } else {
//                       protocolDetailsObj.study_information.documents = []
//                     }
//                   }
//                 )
//                 const que4 =
//                   'select * from informed_consent where protocol_id = ?'
//                 db.query(que4, [req.body.protocolId], (err, data) => {
//                   if (data.length >= 0) {
//                     protocolDetailsObj.informed_consent = data[0] || {}
//                     const docQue =
//                       'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                     db.query(
//                       docQue,
//                       [req.body.protocolId, 'informed_consent'],
//                       async (err, data) => {
//                         if (data.length >= 0) {
//                           protocolDetailsObj.informed_consent.documents = data
//                         } else {
//                           protocolDetailsObj.informed_consent.documents = []
//                         }
//                       }
//                     )
//                     const que5 =
//                       'select * from protocol_procedure where protocol_id = ?'
//                     db.query(que5, [req.body.protocolId], (err, data) => {
//                       if (data.length >= 0) {
//                         protocolDetailsObj.protocol_procedure = data[0] || {}
//                         const docQue =
//                           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                         db.query(
//                           docQue,
//                           [req.body.protocolId, 'protocol_procedure'],
//                           async (err, data) => {
//                             if (data.length >= 0) {
//                               protocolDetailsObj.protocol_procedure.documents =
//                                 data
//                             } else {
//                               protocolDetailsObj.protocol_procedure.documents =
//                                 []
//                             }
//                             // return res.status(200).json(protocolDetailsObj);
//                             try {
//                               const protocolId = req.body
//                               const template =
//                                 await PdfTemplates.protocolAmendmentRequestPdfTemplate.MultiSiteSponsorPdfTemplate(
//                                   protocolDetailsObj,
//                                   protocolId
//                                 )
//                               let filePath = await generatePdfFromHTML(template)
//                               console.log('filePath', filePath)
//                               let sRL = await s3Service.uploadFile(filePath)
//                               console.log('sRL', sRL)
//                               let pdfUrl = sRL.cdnUrl
//                               // Remove the file from the local server
//                               fs.unlinkSync(filePath)
//                               return res.status(200).json({ pdfUrl })
//                             } catch (error) {
//                               console.log(error)
//                               return res
//                                 .status(500)
//                                 .json({ message: 'Internal Server Error' })
//                             }
//                           }
//                         )
//                       }
//                     })
//                   }
//                 })
//               }
//             })
//           }
//         })
//       }
//     })
//   } else if (req.body.protocolType === 'Document Review') {
//     const que1 = 'select * from protocol_information where protocol_id = ?'
//     db.query(que1, [req.body.protocolId], (err, data) => {
//       if (data.length >= 0) {
//         protocolDetailsObj.protocol_information = data[0] || {}
//         const docQue =
//           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//         db.query(
//           docQue,
//           [req.body.protocolId, 'protocol_information'],
//           async (err, data) => {
//             if (data.length >= 0) {
//               protocolDetailsObj.protocol_information.documents = data
//             } else {
//               protocolDetailsObj.protocol_information.documents = []
//             }
//           }
//         )
//         const que2 =
//           'select * from investigator_information where protocol_id = ?'
//         db.query(que2, [req.body.protocolId], (err, data) => {
//           if (data.length >= 0) {
//             protocolDetailsObj.investigator_information = data[0] || {}
//             const docQue =
//               'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//             db.query(
//               docQue,
//               [req.body.protocolId, 'investigator_information'],
//               async (err, data) => {
//                 if (data.length >= 0) {
//                   protocolDetailsObj.investigator_information.documents = data
//                 } else {
//                   protocolDetailsObj.investigator_information.documents = []
//                 }
//               }
//             )
//             const que3 = 'select * from informed_consent where protocol_id = ?'
//             db.query(que3, [req.body.protocolId], (err, data) => {
//               if (data.length >= 0) {
//                 protocolDetailsObj.informed_consent = data[0] || {}
//                 const docQue =
//                   'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//                 db.query(
//                   docQue,
//                   [req.body.protocolId, 'informed_consent'],
//                   async (err, data) => {
//                     if (data.length >= 0) {
//                       protocolDetailsObj.informed_consent.documents = data
//                     } else {
//                       protocolDetailsObj.informed_consent.documents = []
//                     }
//                     try {
//                       const protocolId = req.body
//                       const template =
//                         await PdfTemplates.protocolAmendmentRequestPdfTemplate.PrincipalInvestigatorPdfTemplate(
//                           protocolDetailsObj,
//                           protocolId
//                         )
//                       let filePath = await generatePdfFromHTML(template)
//                       console.log('filePath', filePath)
//                       let sRL = await s3Service.uploadFile(filePath)
//                       console.log('sRL', sRL)
//                       let pdfUrl = sRL.cdnUrl
//                       // Remove the file from the local server
//                       fs.unlinkSync(filePath)
//                       return res.status(200).json({ pdfUrl })
//                     } catch (error) {
//                       console.log(error)
//                       return res
//                         .status(500)
//                         .json({ message: 'Internal Server Error' })
//                     }
//                   }
//                 )
//               }
//             })
//           }
//         })
//       }
//     })
//   } else {
//     const que1 =
//       'select * from investigator_protocol_information where protocol_id = ?'
//     db.query(que1, [req.body.protocolId], (err, data) => {
//       if (data.length >= 0) {
//         protocolDetailsObj.investigator_protocol_information = data[0] || {}
//         const docQue =
//           'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//         db.query(
//           docQue,
//           [req.body.protocolId, 'investigator_protocol_information'],
//           async (err, data) => {
//             if (data.length >= 0) {
//               protocolDetailsObj.investigator_protocol_information.documents =
//                 data
//             } else {
//               protocolDetailsObj.investigator_protocol_information.documents =
//                 []
//             }
//           }
//         )
//         const que2 =
//           'select * from clinical_consent_information where protocol_id = ?'
//         db.query(que2, [req.body.protocolId], (err, data) => {
//           if (data.length >= 0) {
//             protocolDetailsObj.consent_information = data[0] || {}
//             const docQue =
//               'select * from protocol_documents where protocol_id = ? AND information_type = ?'
//             db.query(
//               docQue,
//               [req.body.protocolId, 'consent_information'],
//               async (err, data) => {
//                 if (data.length >= 0) {
//                   protocolDetailsObj.consent_information.documents = data
//                 } else {
//                   protocolDetailsObj.consent_information.documents = []
//                 }
//                 // return res.status(200).json(protocolDetailsObj);
//                 try {
//                   const protocolId = req.body
//                   const template =
//                     await PdfTemplates.protocolAmendmentRequestPdfTemplate.PrincipalInvestigatorPdfTemplate(
//                       protocolDetailsObj,
//                       protocolId
//                     )
//                   let filePath = await generatePdfFromHTML(template)
//                   console.log('filePath', filePath)
//                   let sRL = await s3Service.uploadFile(filePath)
//                   console.log('sRL', sRL)
//                   let pdfUrl = sRL.cdnUrl
//                   // Remove the file from the local server
//                   fs.unlinkSync(filePath)
//                   return res.status(200).json({ pdfUrl })
//                 } catch (error) {
//                   console.log(error)
//                   return res
//                     .status(500)
//                     .json({ message: 'Internal Server Error' })
//                 }
//               }
//             )
//           }
//         })
//       }
//     })
//   }
// }

// export const createProtocol = (req, res) => {
//     // CHECK RESEARCH TYPE IF EXIST
//     const que = "select * from protocols where research_type = ? AND added_by = ?"
//     db.query(que, [req.body.research_type_id, req.user.userId], (err, data) => {
//         if (err) return res.status(500).json(err)
//         if (data.length > 0) {
//             return res.status(400).json('You have already added the selected research type, try with other')
//         }
//         // CREATE A NEW Entry
//         const protocolNumber = "IRB" + Math.floor(Math.random() * 899999 + 100000);
//         const que2 = 'insert into protocols (`protocol_id`, `research_type`, `added_by`, `added_timestamp`, `updated_timestamp`) value (?)';
//         const protocolValue = [
//             protocolNumber,
//             req.body.research_type_id,
//             req.user.userId,
//             new Date().getTime(),
//             new Date().getTime(),
//         ]
//         db.query(que2, [protocolValue], (err2, data) => {
//             if (err2) return res.status(500).json(err2)
//             return res.status(200).json('Research type has been created.')
//         })
//     })

// }
