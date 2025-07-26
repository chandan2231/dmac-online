import { db } from '../connect.js'

export const saveAdverseEvent = (req, res) => {
  var datetime = new Date()

  // Check if the protocol_id already exists in the adverse_event table
  const checkQuery = 'SELECT * FROM adverse_event WHERE protocol_id = ?'

  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({ status: 500, msg: err })
    } else {
      // If the record exists, update it
      if (data.length > 0) {
        const updateQuery = `
          UPDATE adverse_event
          SET 
            protocol_type = ?,
            protocol_number = ?,
            adverse_event_criteria = ?,
            participant_id_number = ?,
            event_start_date = ?,
            event_end_date = ?,
            event_aware_date = ?,
            irb_report_date = ?,
            severity_level = ?,
            unexpected_event = ?,
            unexpected_event_explain = ?,
            event_nature = ?,
            date_of_death = ?,
            event_nature_explain = ?,
            event_description = ?,
            event_study_relationship = ?,
            study_discontinued = ?,
            study_discontinued_explain = ?,
            person_name = ?,
            email = ?,
            phone = ?,
            your_name = ?,
            updated_at = ?,
            created_by = ?
          WHERE protocol_id = ?`

        const updateValues = [
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.adverse_event_criteria,
          req.body.participant_id_number,
          req.body.event_start_date,
          req.body.event_end_date,
          req.body.event_aware_date,
          req.body.irb_report_date,
          req.body.severity_level,
          req.body.unexpected_event,
          req.body.unexpected_event_explain,
          req.body.event_nature,
          req.body.date_of_death,
          req.body.event_nature_explain,
          req.body.event_description,
          req.body.event_study_relationship,
          req.body.study_discontinued,
          req.body.study_discontinued_explain,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          datetime.toISOString().slice(0, 10),
          req.user.userId,
          req.body.protocol_id
        ]

        db.query(updateQuery, updateValues, (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Adverse Event has been updated successfully'
            })
          }
        })
      } else {
        // If the record does not exist, insert a new one
        const insertQuery = `
          INSERT INTO adverse_event 
          (protocol_id, protocol_type, protocol_number, adverse_event_criteria, participant_id_number, 
          event_start_date, event_end_date, event_aware_date, irb_report_date, severity_level, unexpected_event, 
          unexpected_event_explain, event_nature, date_of_death, event_nature_explain, event_description, 
          event_study_relationship, study_discontinued, study_discontinued_explain, person_name, email, phone, 
          your_name, created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

        const insertValues = [
          req.body.protocol_id,
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.adverse_event_criteria,
          req.body.participant_id_number,
          req.body.event_start_date,
          req.body.event_end_date,
          req.body.event_aware_date,
          req.body.irb_report_date,
          req.body.severity_level,
          req.body.unexpected_event,
          req.body.unexpected_event_explain,
          req.body.event_nature,
          req.body.date_of_death,
          req.body.event_nature_explain,
          req.body.event_description,
          req.body.event_study_relationship,
          req.body.study_discontinued,
          req.body.study_discontinued_explain,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          datetime.toISOString().slice(0, 10)
        ]

        db.query(insertQuery, [insertValues], (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Adverse Event has been saved successfully'
            })
          }
        })
      }
    }
  })
}

export const saveProtocolAmendmentRequest = (req, res) => {
  var datetime = new Date()

  // Check if the protocol_id already exists in the protocol_amendment_request table
  const checkQuery =
    'SELECT * FROM protocol_amendment_request WHERE protocol_id = ?'

  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({ status: 500, msg: err })
    } else {
      // If the record exists, update it
      if (data.length > 0) {
        const updateQuery = `
          UPDATE protocol_amendment_request
          SET 
            protocol_type = ?,
            protocol_number = ?,
            amend_document = ?,
            amend_document_explain = ?,
            describe_change_request = ?,
            describe_reasoning = ?,
            person_name = ?,
            email = ?,
            phone = ?,
            your_name = ?,
            updated_at = ?,
            created_by = ?
          WHERE protocol_id = ?`

        const updateValues = [
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.amend_document.toString(),
          req.body.amend_document_explain,
          req.body.describe_change_request,
          req.body.describe_reasoning,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          datetime.toISOString().slice(0, 10),
          req.user.userId,
          req.body.protocol_id
        ]

        db.query(updateQuery, updateValues, (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Protocol Amendment Request has been updated successfully'
            })
          }
        })
      } else {
        // If the record does not exist, insert a new one
        const insertQuery = `
          INSERT INTO protocol_amendment_request
          (protocol_id, protocol_type, protocol_number, amend_document, amend_document_explain, 
          describe_change_request, describe_reasoning, person_name, email, phone, your_name, 
          created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

        const insertValues = [
          req.body.protocol_id,
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.amend_document.toString(),
          req.body.amend_document_explain,
          req.body.describe_change_request,
          req.body.describe_reasoning,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          datetime.toISOString().slice(0, 10)
        ]

        db.query(insertQuery, [insertValues], (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Protocol Amendment Request has been saved successfully'
            })
          }
        })
      }
    }
  })
}

export const savePromptlyReportableEvent = (req, res) => {
  var datetime = new Date()

  // Check if the protocol_id already exists in the table
  const checkQuery =
    'SELECT * FROM promptly_reportable_event WHERE protocol_id = ?'

  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({ status: 500, msg: err })
    } else {
      // If the record exists, update it
      if (data.length > 0) {
        const updateQuery = `
          UPDATE promptly_reportable_event
          SET 
            protocol_type = ?,
            submitter_type = ?,
            irb_protocol_number = ?,
            sponsor_name = ?,
            described_category = ?,
            described_category_explain = ?,
            involved_subject = ?,
            date_problem_discovered = ?,
            date_of_occurrence = ?,
            date_reported_to_sponsor = ?,
            describe_problem = ?,
            action_taken = ?,
            plan_action_taken = ?,
            subject_harmed = ?,
            protocol_change = ?,
            question_not_covered = ?,
            person_name = ?,
            email = ?,
            phone = ?,
            your_name = ?,
            created_by = ?,
            updated_at = ?
          WHERE protocol_id = ?`

        const updateValues = [
          req.body.protocol_type,
          req.body.submitter_type,
          req.body.irb_protocol_number,
          req.body.sponsor_name,
          req.body.described_category,
          req.body.described_category_explain,
          req.body.involved_subject,
          req.body.date_problem_discovered,
          req.body.date_of_occurrence,
          req.body.date_reported_to_sponsor,
          req.body.describe_problem,
          req.body.action_taken,
          req.body.plan_action_taken,
          req.body.subject_harmed,
          req.body.protocol_change,
          req.body.question_not_covered,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          req.body.protocol_id
        ]

        db.query(updateQuery, updateValues, (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Protocol Reportable Event has been updated successfully'
            })
          }
        })
      } else {
        // If the record does not exist, insert a new one
        const insertQuery = `
          INSERT INTO promptly_reportable_event 
          (protocol_id, protocol_type, submitter_type, irb_protocol_number, sponsor_name, described_category, 
          described_category_explain, involved_subject, date_problem_discovered, date_of_occurrence, 
          date_reported_to_sponsor, describe_problem, action_taken, plan_action_taken, subject_harmed, 
          protocol_change, question_not_covered, person_name, email, phone, your_name, created_by, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

        const insertValues = [
          req.body.protocol_id,
          req.body.protocol_type,
          req.body.submitter_type,
          req.body.irb_protocol_number,
          req.body.sponsor_name,
          req.body.described_category,
          req.body.described_category_explain,
          req.body.involved_subject,
          req.body.date_problem_discovered,
          req.body.date_of_occurrence,
          req.body.date_reported_to_sponsor,
          req.body.describe_problem,
          req.body.action_taken,
          req.body.plan_action_taken,
          req.body.subject_harmed,
          req.body.protocol_change,
          req.body.question_not_covered,
          req.body.person_name,
          req.body.email,
          req.body.phone,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          datetime.toISOString().slice(0, 10)
        ]

        db.query(insertQuery, [insertValues], (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Protocol Reportable Event has been saved successfully'
            })
          }
        })
      }
    }
  })
}

export const saveStudyCloseoutRequest = (req, res) => {
  var datetime = new Date()
  const checkQuery =
    'SELECT * FROM study_closeout_request WHERE protocol_id = ?'
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({ status: 500, msg: err })
    } else {
      if (data.length > 0) {
        const updateQuery = `
          UPDATE study_closeout_request
          SET 
            protocol_type = ?,
            protocol_number = ?,
            pi_name = ?,
            study_completion_date = ?,
            study_closeout_reason = ?,
            study_closeout_reason_other = ?,
            subject_enrolled_number = ?,
            subject_withdrew_number = ?,
            subject_withdrew_by_other = ?,
            subject_fails = ?,
            subject_lost_followup = ?,
            subject_completed = ?,
            subject_complaints_review = ?,
            subject_complaints_review_explain = ?,
            not_reported_irb = ?,
            not_reported_irb_explain = ?,
            promptly_reportable_info = ?,
            adverse_event_info = ?,
            your_name = ?,
            created_by = ?,
            updated_at = ?
          WHERE protocol_id = ?`

        const updateValues = [
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.pi_name,
          req.body.study_completion_date,
          req.body.study_closeout_reason,
          req.body.study_closeout_reason_other,
          req.body.subject_enrolled_number,
          req.body.subject_withdrew_number,
          req.body.subject_withdrew_by_other,
          req.body.subject_fails,
          req.body.subject_lost_followup,
          req.body.subject_completed,
          req.body.subject_complaints_review,
          req.body.subject_complaints_review_explain,
          req.body.not_reported_irb,
          req.body.not_reported_irb_explain,
          req.body.promptly_reportable_info,
          req.body.adverse_event_info,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          req.body.protocol_id
        ]

        db.query(updateQuery, updateValues, (err, data) => {
          if (err) {
            return res.status(500).json({ status: 500, msg: err })
          } else {
            return res.json({
              status: 200,
              msg: 'Study Closeout Request has been updated successfully'
            })
          }
        })
      } else {
        const que =
          'insert into study_closeout_request (`protocol_id`, `protocol_type`, `protocol_number`, `pi_name`,  `study_completion_date`, `study_closeout_reason`,`study_closeout_reason_other`,`subject_enrolled_number`,`subject_withdrew_number`,`subject_withdrew_by_other`,`subject_fails`,`subject_lost_followup`,`subject_completed`,`subject_complaints_review`,`subject_complaints_review_explain`,`not_reported_irb`,`not_reported_irb_explain`,`promptly_reportable_info`,`adverse_event_info`,`your_name`,`created_by`,`created_at`,`updated_at`) value (?)'
        const values = [
          req.body.protocol_id,
          req.body.protocol_type,
          req.body.protocol_number,
          req.body.pi_name,
          req.body.study_completion_date,
          req.body.study_closeout_reason,
          req.body.study_closeout_reason_other,
          req.body.subject_enrolled_number,
          req.body.subject_withdrew_number,
          req.body.subject_withdrew_by_other,
          req.body.subject_fails,
          req.body.subject_lost_followup,
          req.body.subject_completed,
          req.body.subject_complaints_review,
          req.body.subject_complaints_review_explain,
          req.body.not_reported_irb,
          req.body.not_reported_irb_explain,
          req.body.promptly_reportable_info,
          req.body.adverse_event_info,
          req.body.your_name,
          req.user.userId,
          datetime.toISOString().slice(0, 10),
          datetime.toISOString().slice(0, 10)
        ]
        db.query(que, [values], (err, data) => {
          if (err) {
            let result = {}
            result.status = 500
            result.msg = err
            return res.json(result)
          } else {
            let result = {}
            result.status = 200
            result.msg = 'Study Closeout Request has been saved successfully'
            return res.json(result)
          }
        })
      }
    }
  })
}
export const fetchEventAndRequestById = (req, res) => {
  let checkQuery = ''
  if (req.body.type === 'amendment') {
    checkQuery =
      'SELECT * FROM protocol_amendment_request WHERE protocol_id = ?'
  } else if (req.body.type === 'adverse') {
    checkQuery = 'SELECT * FROM adverse_event WHERE protocol_id = ?'
  } else if (req.body.type === 'reportable') {
    checkQuery = 'SELECT * FROM promptly_reportable_event WHERE protocol_id = ?'
  } else if (req.body.type === 'closeout') {
    checkQuery = 'SELECT * FROM study_closeout_request WHERE protocol_id = ?'
  } else {
    return res.status(400).json({ status: 400, msg: 'Invalid type provided' })
  }

  // Run the query to fetch data
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({ status: 500, msg: err })
    }

    if (data.length === 0) {
      return res.status(404).json({
        status: 404,
        msg: `No data found for protocol_id: ${req.body.protocol_id} with type: ${req.body.type}`
      })
    }

    return res.status(200).json({
      status: 200,
      msg: `${req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)} data fetched successfully`,
      data: data
    })
  })
}
