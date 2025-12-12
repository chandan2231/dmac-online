import { db } from '../connect.js'
import moment from 'moment-timezone'
import sendEmail from '../emailService.js'

export const saveTherapistAvailability = async (req, res) => {
  const { startDate, endDate, availability, userId } = req.body

  if (!startDate || !endDate || !availability || !userId) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required fields' })
  }

  try {
    // 1. Get Therapist's Timezone
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT time_zone FROM dmac_webapp_users WHERE id = ?`,
        [userId],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    const therapistTimezone = userResult[0]?.time_zone
    if (!therapistTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Therapist timezone not found' })
    }

    const values = []

    availability.forEach((day) => {
      day.slots.forEach((slot) => {
        let utcStartTime, utcEndTime, utcDate

        if (slot.utcStartTime && slot.utcEndTime) {
          utcStartTime = slot.utcStartTime
          utcEndTime = slot.utcEndTime
          utcDate =
            slot.utcDate || moment.utc(utcStartTime).format('YYYY-MM-DD')
        } else {
          const hour = slot.hour.toString().padStart(2, '0')

          // Create moment object in Therapist's timezone
          const localStartTime = moment.tz(
            `${day.date} ${hour}:00`,
            'YYYY-MM-DD HH:mm',
            therapistTimezone
          )
          const localEndTime = localStartTime.clone().add(1, 'hours')

          // Convert to UTC for storage
          utcStartTime = localStartTime
            .clone()
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
          utcEndTime = localEndTime.clone().utc().format('YYYY-MM-DD HH:mm:ss')
          utcDate = localStartTime.clone().utc().format('YYYY-MM-DD')
        }

        const unavailableSlot = Number(slot.available)
        values.push([
          userId,
          utcDate,
          utcStartTime,
          utcEndTime,
          unavailableSlot,
          0,
          1
        ])
      })
    })

    if (!values.length) {
      return res
        .status(400)
        .json({ status: 400, message: 'No available slots selected' })
    }

    const query = `
      INSERT INTO dmac_webapp_therapist_availability
      (consultant_id, slot_date, start_time, end_time, is_slot_available, is_booked, is_day_off)
      VALUES ?
      ON DUPLICATE KEY UPDATE
      is_slot_available = VALUES(is_slot_available),
      is_day_off = VALUES(is_day_off)
    `

    db.query(query, [values], (err) => {
      if (err) throw err
      return res
        .status(200)
        .json({ status: 200, message: 'Availability saved successfully' })
    })
  } catch (error) {
    console.error('SAVE ERROR:', error)
    return res
      .status(500)
      .json({ status: 500, message: 'Unable to save availability' })
  }
}

export const getTherapistAvailability = async (req, res) => {
  const { consultant_id } = req.body

  if (!consultant_id) {
    return res
      .status(400)
      .json({ status: 400, message: 'Consultant ID is required' })
  }

  try {
    // 1. Get Therapist's Timezone
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT time_zone FROM dmac_webapp_users WHERE id = ?`,
        [consultant_id],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    const therapistTimezone = userResult[0]?.time_zone
    if (!therapistTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Therapist timezone not found' })
    }

    const query = `
      SELECT 
        slot_date,
        start_time,
        end_time,
        is_slot_available,
        is_booked,
        is_day_off
      FROM dmac_webapp_therapist_availability
      WHERE consultant_id = ?
      ORDER BY slot_date ASC, start_time ASC
    `

    db.query(query, [consultant_id], (err, rows) => {
      if (err) return res.status(500).json(err)

      if (!rows.length) {
        return res
          .status(200)
          .json({ status: 200, message: 'No slots found', slots: [] })
      }

      // Grouped result
      const groupedResult = {}

      rows.forEach((slot) => {
        // Convert UTC DB times to Therapist Timezone
        const utcStart = moment.utc(
          moment(slot.start_time).format('YYYY-MM-DD HH:mm:ss')
        )
        const utcEnd = moment.utc(
          moment(slot.end_time).format('YYYY-MM-DD HH:mm:ss')
        )

        const localStart = utcStart.clone().tz(therapistTimezone)
        const localEnd = utcEnd.clone().tz(therapistTimezone)

        const formattedDate = localStart.format('YYYY-MM-DD')
        const formattedStartTime = localStart.format('HH:mm:ss')
        const formattedEndTime = localEnd.format('HH:mm:ss')

        if (!groupedResult[formattedDate]) {
          groupedResult[formattedDate] = []
        }

        groupedResult[formattedDate].push({
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          is_slot_available: slot.is_slot_available,
          is_booked: slot.is_booked,
          is_day_off: slot.is_day_off
        })
      })

      return res.status(200).json({
        status: 200,
        message: 'Availability fetched successfully',
        consultant_id,
        slots: groupedResult
      })
    })
  } catch (error) {
    console.error('GET AVAILABILITY ERROR:', error)
    return res
      .status(500)
      .json({ status: 500, message: 'Unable to fetch availability' })
  }
}

export const getAvailableSlots = async (req, res) => {
  const { consultation_id, user_id, date } = req.body

  if (!consultation_id || !user_id || !date) {
    return res.status(400).json({
      status: 400,
      message: 'consultation_id, user_id and date are required'
    })
  }

  try {
    /** 1️⃣ Get timezone from users table */
    const timezoneQuery = `SELECT time_zone FROM dmac_webapp_users WHERE id = ? LIMIT 1`
    const userResult = await new Promise((resolve, reject) => {
      db.query(timezoneQuery, [user_id], (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

    if (!userResult.length || !userResult[0].time_zone) {
      return res
        .status(404)
        .json({ status: 404, message: 'User or timezone not found' })
    }

    const user_timezone = userResult[0].time_zone

    /** 2️⃣ Convert selected date into UTC date range */
    const startOfDayUTC = moment
      .tz(date + ' 00:00', user_timezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfDayUTC = moment
      .tz(date + ' 23:59', user_timezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')

    /** 3️⃣ Get consultant slots for the selected date */
    const slotQuery = `
      SELECT id, start_time, end_time, is_booked
      FROM dmac_webapp_therapist_availability
      WHERE consultant_id = ?
        AND start_time BETWEEN ? AND ?
      ORDER BY start_time ASC
    `

    const slotRows = await new Promise((resolve, reject) => {
      db.query(
        slotQuery,
        [consultation_id, startOfDayUTC, endOfDayUTC],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    /** 4️⃣ Convert slots back to user's timezone */
    const formattedSlots = slotRows.map((slot) => ({
      slot_id: slot.id,
      is_booked: slot.is_booked,
      start: moment
        .utc(moment(slot.start_time).format('YYYY-MM-DD HH:mm:ss'))
        .tz(user_timezone)
        .format('YYYY-MM-DD HH:mm'),
      end: moment
        .utc(moment(slot.end_time).format('YYYY-MM-DD HH:mm:ss'))
        .tz(user_timezone)
        .format('YYYY-MM-DD HH:mm')
    }))

    return res.status(200).json({
      status: 200,
      consultation_id,
      date,
      timezone: user_timezone,
      slots: formattedSlots
    })
  } catch (error) {
    console.error('getAvailableSlots Error:', error)
    return res.status(500).json({
      status: 500,
      message: 'Unable to fetch available slots'
    })
  }
}

export const toggleDayOff = async (req, res) => {
  const { consultant_id, date, is_day_off } = req.body

  if (!consultant_id || !date || is_day_off === undefined) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required fields' })
  }

  try {
    // 1. Get Therapist's Timezone
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT time_zone FROM dmac_webapp_users WHERE id = ?`,
        [consultant_id],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    const therapistTimezone = userResult[0]?.time_zone
    if (!therapistTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Therapist timezone not found' })
    }

    // 2. Calculate UTC range for the day in Therapist's timezone
    const startOfDayUTC = moment
      .tz(date + ' 00:00', 'YYYY-MM-DD HH:mm', therapistTimezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfDayUTC = moment
      .tz(date + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss', therapistTimezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')

    // 3. Update slots
    const query = `
      UPDATE dmac_webapp_therapist_availability
      SET is_day_off = ?
      WHERE consultant_id = ?
      AND start_time BETWEEN ? AND ?
    `

    db.query(
      query,
      [is_day_off, consultant_id, startOfDayUTC, endOfDayUTC],
      (err, result) => {
        if (err) throw err
        return res.status(200).json({
          status: 200,
          message: 'Day off status updated successfully',
          updatedSlots: result.affectedRows
        })
      }
    )
  } catch (error) {
    console.error('TOGGLE DAY OFF ERROR:', error)
    return res
      .status(500)
      .json({ status: 500, message: 'Unable to update day off status' })
  }
}

export const updateDaySlots = async (req, res) => {
  const { userId, date, slots } = req.body

  if (!userId || !date || !slots || !Array.isArray(slots)) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required fields' })
  }

  try {
    // 1. Get Therapist's Timezone
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT time_zone FROM dmac_webapp_users WHERE id = ?`,
        [userId],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    const therapistTimezone = userResult[0]?.time_zone
    if (!therapistTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Therapist timezone not found' })
    }

    // 2. Process updates
    const updatePromises = slots.map((slot) => {
      return new Promise((resolve, reject) => {
        // Construct local time and convert to UTC
        const localStartTime = moment.tz(
          `${date} ${slot.start_time}`,
          'YYYY-MM-DD HH:mm:ss',
          therapistTimezone
        )

        const utcStartTime = localStartTime
          .clone()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')

        const query = `
          UPDATE dmac_webapp_therapist_availability
          SET is_slot_available = ?
          WHERE consultant_id = ?
          AND start_time = ?
          AND is_booked = 0 
        `

        db.query(
          query,
          [slot.is_slot_available, userId, utcStartTime],
          (err, result) => {
            if (err) reject(err)
            resolve(result)
          }
        )
      })
    })

    await Promise.all(updatePromises)

    return res.status(200).json({
      status: 200,
      message: 'Slots updated successfully'
    })
  } catch (error) {
    console.error('UPDATE SLOTS ERROR:', error)
    return res
      .status(500)
      .json({ status: 500, message: 'Unable to update slots' })
  }
}

export const getConsultationList = async (req, res) => {
  const { consultant_id, patient_name } = req.body

  if (!consultant_id) {
    return res.status(400).json({
      status: 400,
      message: 'consultant_id is required'
    })
  }

  try {
    let query = `
      SELECT 
        c.id,
        c.consultation_date,
        c.event_start,
        c.event_end,
        c.consultation_status,
        c.meet_link,
        u.id as patient_id,
        u.name as patient_name,
        u.email as patient_email,
        c.consultant_timezone
      FROM dmac_webapp_therapist_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      WHERE c.consultant_id = ?
    `

    const params = [consultant_id]

    if (patient_name) {
      query += ` AND u.name LIKE ?`
      params.push(`%${patient_name}%`)
    }

    query += ` ORDER BY c.consultation_date DESC`

    const consultations = await new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    return res.status(200).json({
      status: 200,
      data: consultations
    })
  } catch (error) {
    console.error('Error fetching therapist consultation list:', error)
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch consultation list',
      error: error.message
    })
  }
}

export const updateConsultationStatus = async (req, res) => {
  const { consultationId, status, notes } = req.body

  if (!consultationId || !status || !notes) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Update status and notes
    const updateQuery = `
      UPDATE dmac_webapp_therapist_consultations 
      SET consultation_status = ?, consultation_notes = ? 
      WHERE id = ?
    `

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [status, notes, consultationId], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    // If Cancelled (5) or Rescheduled (6), send email
    if (status === 5 || status === 6) {
      // Fetch consultation details to get user email
      const getConsultationQuery = `
        SELECT c.*, u.email as user_email, u.name as user_name 
        FROM dmac_webapp_therapist_consultations c
        JOIN dmac_webapp_users u ON c.user_id = u.id
        WHERE c.id = ?
      `

      const consultation = await new Promise((resolve, reject) => {
        db.query(getConsultationQuery, [consultationId], (err, data) => {
          if (err) reject(err)
          resolve(data[0])
        })
      })

      if (consultation) {
        const {
          user_email,
          user_name,
          consultation_date,
          consultant_id,
          event_start
        } = consultation
        let subject = ''
        let htmlContent = ''

        if (status === 5) {
          // Free the slot in availability table
          const utcDate = moment.utc(event_start).format('YYYY-MM-DD')
          const utcStartTime = moment
            .utc(event_start)
            .format('YYYY-MM-DD HH:mm:ss')

          const freeSlotQuery = `
            UPDATE dmac_webapp_therapist_availability
            SET is_booked = 0
            WHERE consultant_id = ? AND slot_date = ? AND start_time = ?
          `
          await new Promise((resolve, reject) => {
            db.query(
              freeSlotQuery,
              [consultant_id, utcDate, utcStartTime],
              (err, result) => {
                if (err) reject(err)
                resolve(result)
              }
            )
          })

          subject = 'Consultation Cancelled'
          htmlContent = `
            <p>Dear ${user_name},</p>
            <p>Your consultation scheduled for ${consultation_date} has been cancelled.</p>
            <p><b>Reason:</b> ${notes}</p>
            <p>Please login to reschedule if needed.</p>
          `
        } else if (status === 6) {
          subject = 'Consultation Reschedule Requested'
          htmlContent = `
            <p>Dear ${user_name},</p>
            <p>Your consultation scheduled for ${consultation_date} needs to be rescheduled.</p>
            <p><b>Reason:</b> ${notes}</p>
            <p>Please login to reschedule your appointment.</p>
          `
        }

        await sendEmail(user_email, subject, htmlContent, htmlContent)
      }
    }

    return res
      .status(200)
      .json({ message: 'Consultation status updated successfully' })
  } catch (error) {
    console.error('UPDATE STATUS ERROR:', error)
    return res.status(500).json({ message: 'Failed to update status' })
  }
}

export const getTherapistPatients = async (req, res) => {
  const { consultant_id } = req.body

  if (!consultant_id) {
    return res.status(400).json({
      status: 400,
      message: 'consultant_id is required'
    })
  }

  try {
    const query = `
      SELECT DISTINCT u.id, u.name, u.email
      FROM dmac_webapp_therapist_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      WHERE c.consultant_id = ?
      ORDER BY u.name ASC
    `

    const patients = await new Promise((resolve, reject) => {
      db.query(query, [consultant_id], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    return res.status(200).json({
      status: 200,
      data: patients
    })
  } catch (error) {
    console.error('Error fetching therapist patients:', error)
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch patients',
      error: error.message
    })
  }
}

export const rescheduleTherapistConsultation = async (req, res) => {
  const { consultationId, newDate, newStartTime } = req.body

  if (!consultationId || !newDate || !newStartTime) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // 1. Fetch existing consultation
    const getConsultationQuery = `
      SELECT c.*, u.email as user_email, u.name as user_name, 
             t.email as consultant_email, t.name as consultant_name, t.time_zone as consultant_timezone
      FROM dmac_webapp_therapist_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      JOIN dmac_webapp_users t ON c.consultant_id = t.id
      WHERE c.id = ?
    `
    const consultation = await new Promise((resolve, reject) => {
      db.query(getConsultationQuery, [consultationId], (err, data) => {
        if (err) reject(err)
        resolve(data[0])
      })
    })

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' })
    }

    const {
      consultant_id,
      event_start: oldEventStart,
      user_email,
      user_name,
      consultant_email,
      consultant_name,
      consultant_timezone
    } = consultation

    // 2. Calculate New Times (in UTC)
    // Assume newStartTime is in Consultant's timezone or UTC?
    // Usually frontend sends date 'YYYY-MM-DD' and time 'HH:mm'
    // Let's assume we construct it in Consultant's timezone

    const newStartMoment = moment.tz(
      `${newDate} ${newStartTime}`,
      'YYYY-MM-DD HH:mm',
      consultant_timezone
    )
    const newEndMoment = newStartMoment.clone().add(1, 'hour')

    const newStartUTC = newStartMoment
      .clone()
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const newEndUTC = newEndMoment.clone().utc().format('YYYY-MM-DD HH:mm:ss')
    const newDateUTC = newStartMoment.clone().utc().format('YYYY-MM-DD')

    // 3. Lock New Slot
    const lockQuery = `
      UPDATE dmac_webapp_therapist_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND is_booked = 0
    `
    const lockResult = await new Promise((resolve, reject) => {
      db.query(
        lockQuery,
        [consultant_id, newDateUTC, newStartUTC],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    if (lockResult.affectedRows === 0) {
      return res.status(400).json({ message: 'Selected slot is not available' })
    }

    // 4. Unlock Old Slot
    const oldStartUTC = moment.utc(oldEventStart).format('YYYY-MM-DD HH:mm:ss')
    const oldDateUTC = moment.utc(oldEventStart).format('YYYY-MM-DD')

    const unlockQuery = `
      UPDATE dmac_webapp_therapist_availability
      SET is_booked = 0
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ?
    `
    await new Promise((resolve, reject) => {
      db.query(
        unlockQuery,
        [consultant_id, oldDateUTC, oldStartUTC],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    // 5. Update Consultation Record
    const updateQuery = `
      UPDATE dmac_webapp_therapist_consultations
      SET event_start = ?, event_end = ?, consultation_date = ?, consultation_status = 1
      WHERE id = ?
    `
    await new Promise((resolve, reject) => {
      db.query(
        updateQuery,
        [newStartUTC, newEndUTC, newDate, consultationId],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    // 6. Send Emails
    const subject = 'Consultation Rescheduled'
    const htmlContent = `
      <p>Dear User,</p>
      <p>Your consultation has been rescheduled.</p>
      <p><b>New Date:</b> ${newDate}</p>
      <p><b>New Time:</b> ${newStartTime}</p>
    `

    await sendEmail(user_email, subject, htmlContent, htmlContent)
    await sendEmail(consultant_email, subject, htmlContent, htmlContent)

    return res
      .status(200)
      .json({ message: 'Consultation rescheduled successfully' })
  } catch (error) {
    console.error('RESCHEDULE ERROR:', error)
    return res
      .status(500)
      .json({ message: 'Failed to reschedule consultation' })
  }
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
      'assessment_sat',
      'assessment_dat',
      'assessment_adt',
      'assessment_disclaimer',
      'assessment_research_consent'
    ]
    const results = {}
    const keyMap = {
      assessment_sat: 'sat',
      assessment_dat: 'dat',
      assessment_adt: 'adt',
      assessment_disclaimer: 'disclaimer',
      assessment_research_consent: 'consent'
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
