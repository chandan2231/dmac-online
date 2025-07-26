import { db } from '../connect.js'

export const saveRiskAssessment = (req, res) => {
  var datetime = new Date()
  const checkQuery = 'SELECT * FROM risk_assessment WHERE protocol_id = ?'
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking for existing risk assessment',
        error: err
      })
    }
    if (data.length > 0) {
      const updateQuery =
        'UPDATE risk_assessment SET `criteria_report` = ?, `criteria_report_explain` = ?, `irb_report` = ?, `irb_report_explain` = ?, `updated_at` = ?, `created_by` = ? WHERE `protocol_id` = ?'

      const values = [
        req.body.criteria_report,
        req.body.criteria_report_explain,
        req.body.irb_report,
        req.body.irb_report_explain,
        datetime.toISOString().slice(0, 10), // updated_at
        req.user.userId, // updated_by
        req.body.protocol_id // protocol_id
      ]

      db.query(updateQuery, values, (err, data) => {
        if (err) {
          return res.status(500).json({
            message: 'Error updating risk assessment',
            error: err
          })
        } else {
          return res.json({
            status: 200,
            msg: 'Risk Assessment has been updated successfully'
          })
        }
      })
    } else {
      const insertQuery =
        'INSERT INTO risk_assessment (`protocol_id`, `criteria_report`, `criteria_report_explain`, `irb_report`, `irb_report_explain`, `created_at`, `updated_at`, `created_by`) VALUES (?)'

      const values = [
        req.body.protocol_id,
        req.body.criteria_report,
        req.body.criteria_report_explain,
        req.body.irb_report,
        req.body.irb_report_explain,
        datetime.toISOString().slice(0, 10),
        datetime.toISOString().slice(0, 10),
        req.user.userId
      ]

      db.query(insertQuery, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const updateProtocolQuery =
            'UPDATE protocols SET continuein_review_status = ? WHERE protocol_id = ?'

          db.query(
            updateProtocolQuery,
            [2, req.body.protocol_id],
            (err, data) => {
              if (err) {
                return res.status(500).json(err)
              } else {
                return res.json({
                  status: 200,
                  msg: 'Risk Assessment has been saved successfully'
                })
              }
            }
          )
        }
      })
    }
  })
}

export const saveInformedConsent = (req, res) => {
  var datetime = new Date()
  const checkQuery =
    'SELECT * FROM informed_consent_process WHERE protocol_id = ?'
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking for existing risk assessment',
        error: err
      })
    }
    if (data.length > 0) {
      const que = `UPDATE informed_consent_process
        SET 
          challenges_faced = ?,
          challenges_faced_explain = ?,
          changes_consent = ?,
          changes_consent_explain = ?,
          ensuring_list = ?,
          ensuring_list_explain = ?,
          icf_version = ?,
          performing_consent = ?,
          updated_at = ?,
          created_by = ?
        WHERE protocol_id = ?`

      const values = [
        req.body.challenges_faced,
        req.body.challenges_faced_explain,
        req.body.changes_consent,
        req.body.changes_consent_explain,
        req.body.ensuring_list,
        req.body.ensuring_list_explain,
        req.body.icf_version,
        req.body.performing_consent,
        datetime.toISOString().slice(0, 10),
        req.user.userId,
        req.body.protocol_id
      ]

      db.query(que, values, (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status = ? WHERE protocol_id = ?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg =
                'Informed Consent Process has been updated successfully'
              return res.json(result)
            }
          })
        }
      })
    } else {
      const que =
        'insert into informed_consent_process (`protocol_id`, `challenges_faced`, `challenges_faced_explain`, `changes_consent`, `changes_consent_explain`, `ensuring_list`, `ensuring_list_explain`, `icf_version`,`performing_consent`, `created_at`, `updated_at`,`created_by`) value (?)'
      const values = [
        req.body.protocol_id,
        req.body.challenges_faced,
        req.body.challenges_faced_explain,
        req.body.changes_consent,
        req.body.changes_consent_explain,
        req.body.ensuring_list,
        req.body.ensuring_list_explain,
        req.body.icf_version,
        req.body.performing_consent,
        datetime.toISOString().slice(0, 10),
        datetime.toISOString().slice(0, 10),
        req.user.userId
      ]
      db.query(que, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status=? WHERE protocol_id=?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg =
                'Informed Consent Process has been saved successfully'
              return res.json(result)
            }
          })
        }
      })
    }
  })
}

export const saveInvestigatorAndinstuation = (req, res) => {
  var datetime = new Date()
  const checkQuery =
    'SELECT * FROM investigator_instuation_info WHERE protocol_id = ?'
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({
        message:
          'Error checking for existing investigator and instuation information',
        error: err
      })
    }
    if (data.length > 0) {
      const que = `UPDATE investigator_instuation_info SET 
        changes_explain = ?,
        changes_law = ?,
        changes_law_explain = ?,
        changes_reported = ?,
        changes_reported_explain = ?,
        facility_any_changes = ?,
        facility_any_changes_explain = ?,
        facility_change_item = ?,
        facility_changes = ?,
        inv_or_comp = ?,
        inv_or_comp_explain = ?,
        inv_sit_quali = ?,
        investigator_changes = ?,
        updated_at = ?,
        created_by = ?
      WHERE protocol_id = ?`

      const values = [
        req.body.changes_explain,
        req.body.changes_law,
        req.body.changes_law_explain,
        req.body.changes_reported,
        req.body.changes_reported_explain,
        req.body.facility_any_changes,
        req.body.facility_any_changes_explain,
        req.body.facility_change_item.toString(),
        req.body.facility_changes,
        req.body.inv_or_comp,
        req.body.inv_or_comp_explain,
        req.body.inv_sit_quali,
        req.body.investigator_changes.toString(),
        datetime.toISOString().slice(0, 10),
        req.user.userId,
        req.body.protocol_id
      ]

      db.query(que, values, (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status = ? WHERE protocol_id = ?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg =
                'Investigator and Instuation Information has been updated successfully'
              return res.json(result)
            }
          })
        }
      })
    } else {
      const que =
        'insert into investigator_instuation_info (`protocol_id`, `changes_explain`, `changes_law`, `changes_law_explain`, `changes_reported`, `changes_reported_explain`, `facility_any_changes`, `facility_any_changes_explain`,`facility_change_item`, `facility_changes`, `inv_or_comp`, `inv_or_comp_explain`, `inv_sit_quali`, `investigator_changes`, `created_at`, `updated_at`,`created_by`) value (?)'
      const values = [
        req.body.protocol_id,
        req.body.changes_explain,
        req.body.changes_law,
        req.body.changes_law_explain,
        req.body.changes_reported,
        req.body.changes_reported_explain,
        req.body.facility_any_changes,
        req.body.facility_any_changes_explain,
        req.body.facility_change_item.toString(),
        req.body.facility_changes,
        req.body.inv_or_comp,
        req.body.inv_or_comp_explain,
        req.body.inv_sit_quali,
        req.body.investigator_changes.toString(),
        datetime.toISOString().slice(0, 10),
        datetime.toISOString().slice(0, 10),
        req.user.userId
      ]
      db.query(que, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status=? WHERE protocol_id=?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg =
                'Investigator and Instuation Information has been saved successfully'
              return res.json(result)
            }
          })
        }
      })
    }
  })
}
export const saveResearchProcess = (req, res) => {
  var datetime = new Date()
  const checkQuery =
    'SELECT * FROM research_progress_info WHERE protocol_id = ?'
  db.query(checkQuery, [req.body.protocol_id], (err, data) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking for existing Research Progress Information',
        error: err
      })
    }
    if (data.length > 0) {
      const que = `
        UPDATE research_progress_info SET 
          adverse_event_explain = ?,
          adverse_event_not_reported_explain = ?,
          adverse_event_submission = ?,
          changes_not_reported_to_irb = ?,
          discontinued_subjects = ?,
          last_approval_change = ?,
          last_approval_change_report = ?,
          occured_adverse_event = ?,
          sub_terminated_before_completion = ?,
          sub_withdrew = ?,
          subjecte_completed = ?,
          subjects_enrolled = ?,
          termination_reason_explain = ?,
          withdrawal_reason_explain = ?,
          updated_at = ?,
          created_by = ?
        WHERE protocol_id = ?`

      const values = [
        req.body.adverse_event_explain,
        req.body.adverse_event_not_reported_explain,
        req.body.adverse_event_submission,
        req.body.changes_not_reported_to_irb,
        req.body.discontinued_subjects,
        req.body.last_approval_change,
        req.body.last_approval_change_report,
        req.body.occured_adverse_event,
        req.body.sub_terminated_before_completion,
        req.body.sub_withdrew,
        req.body.subjecte_completed,
        req.body.subjects_enrolled,
        req.body.termination_reason_explain,
        req.body.withdrawal_reason_explain,
        datetime.toISOString().slice(0, 10),
        req.user.userId,
        req.body.protocol_id
      ]

      db.query(que, values, (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status = ? WHERE protocol_id = ?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg =
                'Research Progress Information has been updated successfully'
              return res.json(result)
            }
          })
        }
      })
    } else {
      const que =
        'insert into research_progress_info (`protocol_id`, `adverse_event_explain`, `adverse_event_not_reported_explain`, `adverse_event_submission`, `changes_not_reported_to_irb`, `discontinued_subjects`, `last_approval_change`, `last_approval_change_report`,`occured_adverse_event`, `sub_terminated_before_completion`, `sub_withdrew`, `subjecte_completed`, `subjects_enrolled`, `termination_reason_explain`, `withdrawal_reason_explain`, `created_at`, `updated_at`,`created_by`) value (?)'
      const values = [
        req.body.protocol_id,
        req.body.adverse_event_explain,
        req.body.adverse_event_not_reported_explain,
        req.body.adverse_event_submission,
        req.body.changes_not_reported_to_irb,
        req.body.discontinued_subjects,
        req.body.last_approval_change,
        req.body.last_approval_change_report,
        req.body.occured_adverse_event,
        req.body.sub_terminated_before_completion,
        req.body.sub_withdrew,
        req.body.subjecte_completed,
        req.body.subjects_enrolled,
        req.body.termination_reason_explain,
        req.body.withdrawal_reason_explain,
        datetime.toISOString().slice(0, 10),
        datetime.toISOString().slice(0, 10),
        req.user.userId
      ]
      db.query(que, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err)
        } else {
          const que =
            'UPDATE protocols SET continuein_review_status=? WHERE protocol_id=?'
          db.query(que, [2, req.body.protocol_id], (err, data) => {
            if (err) {
              return res.status(500).json(err)
            } else {
              let result = {}
              result.status = 200
              result.msg = 'Research Process has been saved successfully'
              return res.json(result)
            }
          })
        }
      })
    }
  })
}
