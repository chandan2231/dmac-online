import { db } from '../connect.js'
import moment from 'moment-timezone'
import sendEmail from '../emailService.js'

export const saveExpertAvailability = async (req, res) => {
  const { startDate, endDate, availability, userId } = req.body

  if (!startDate || !endDate || !availability || !userId) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required fields' })
  }

  try {
    // 1. Get Expert's Timezone
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

    const expertTimezone = userResult[0]?.time_zone
    if (!expertTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Expert timezone not found' })
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

          // Create moment object in Expert's timezone
          const localStartTime = moment.tz(
            `${day.date} ${hour}:00`,
            'YYYY-MM-DD HH:mm',
            expertTimezone
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
      INSERT INTO dmac_webapp_expert_availability
      (consultant_id, slot_date, start_time, end_time, is_slot_available, is_booked, is_day_off)
      VALUES ?
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

export const getExpertAvailability = async (req, res) => {
  const { consultant_id } = req.body

  if (!consultant_id) {
    return res
      .status(400)
      .json({ status: 400, message: 'Consultant ID is required' })
  }

  try {
    // 1. Get Expert's Timezone
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

    const expertTimezone = userResult[0]?.time_zone
    if (!expertTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Expert timezone not found' })
    }

    const query = `
      SELECT 
        slot_date,
        start_time,
        end_time,
        is_slot_available,
        is_booked,
        is_day_off
      FROM dmac_webapp_expert_availability
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
        // Convert UTC DB times to Expert Timezone
        // Ensure we handle both Date objects and strings
        // We format first to avoid MySQL driver's local timezone assumption on Date objects
        const utcStart = moment.utc(
          moment(slot.start_time).format('YYYY-MM-DD HH:mm:ss')
        )
        const utcEnd = moment.utc(
          moment(slot.end_time).format('YYYY-MM-DD HH:mm:ss')
        )

        const localStart = utcStart.clone().tz(expertTimezone)
        const localEnd = utcEnd.clone().tz(expertTimezone)

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
      FROM dmac_webapp_expert_availability
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
    // 1. Get Expert's Timezone
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

    const expertTimezone = userResult[0]?.time_zone
    if (!expertTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Expert timezone not found' })
    }

    // 2. Calculate UTC range for the day in Expert's timezone
    const startOfDayUTC = moment
      .tz(date + ' 00:00', 'YYYY-MM-DD HH:mm', expertTimezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfDayUTC = moment
      .tz(date + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss', expertTimezone)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')

    // 3. Update slots
    const query = `
      UPDATE dmac_webapp_expert_availability
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
    // 1. Get Expert's Timezone
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

    const expertTimezone = userResult[0]?.time_zone
    if (!expertTimezone) {
      return res
        .status(400)
        .json({ status: 400, message: 'Expert timezone not found' })
    }

    // 2. Process updates
    const updatePromises = slots.map((slot) => {
      return new Promise((resolve, reject) => {
        // Construct local time and convert to UTC
        // slot.start_time is likely "HH:mm:ss" or "HH:mm"
        const localStartTime = moment.tz(
          `${date} ${slot.start_time}`,
          'YYYY-MM-DD HH:mm:ss',
          expertTimezone
        )

        const utcStartTime = localStartTime
          .clone()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')

        const query = `
          UPDATE dmac_webapp_expert_availability
          SET is_slot_available = ?
          WHERE consultant_id = ?
          AND start_time = ?
          AND is_booked = 0 
        `
        // Added is_booked = 0 check as a safety measure, though frontend also checks it

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

export const getExpertConsultations = async (req, res) => {
  const { consultant_id, patient_name } = req.body

  if (!consultant_id) {
    return res.status(400).json({ message: 'Consultant ID is required' })
  }

  let query = `
    SELECT 
        c.id,
        c.event_start,
        c.event_end,
        c.meet_link,
        c.consultation_status,
        c.consultation_date,
        u.name as patient_name,
        u.email as patient_email,
        p.product_name as product_name
    FROM dmac_webapp_consultations c
    JOIN dmac_webapp_users u ON c.user_id = u.id
    LEFT JOIN dmac_webapp_products p ON c.product_id = p.id
    WHERE c.consultant_id = ?
  `

  const queryParams = [consultant_id]

  if (patient_name) {
    query += ` AND u.name LIKE ?`
    queryParams.push(`%${patient_name}%`)
  }

  query += ` ORDER BY c.event_start DESC`

  db.query(query, queryParams, (err, data) => {
    if (err) {
      console.error('GET CONSULTATIONS ERROR:', err)
      return res.status(500).json({ message: 'Failed to fetch consultations' })
    }
    return res.status(200).json({
      status: 200,
      data
    })
  })
}

export const getExpertPatients = async (req, res) => {
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
      FROM dmac_webapp_consultations c
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
    console.error('Error fetching expert patients:', error)
    return res.status(500).json({
      status: 500,
      message: 'Internal server error'
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
      UPDATE dmac_webapp_consultations 
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
        FROM dmac_webapp_consultations c
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
            UPDATE dmac_webapp_expert_availability
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

export const rescheduleConsultation = async (req, res) => {
  const { consultationId, newDate, newStartTime, userId, timezone } = req.body

  if (!consultationId || !newDate || !newStartTime || !userId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // 1. Fetch existing consultation
    const getConsultationQuery = `
      SELECT c.*, u.time_zone as user_timezone, exp.time_zone as expert_timezone, exp.email as expert_email, u.email as user_email, u.name as user_name
      FROM dmac_webapp_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      JOIN dmac_webapp_users exp ON c.consultant_id = exp.id
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
      user_timezone,
      expert_timezone,
      user_email,
      user_name
    } = consultation

    // 2. Calculate New Times (UTC)
    const requestTimezone = timezone || user_timezone

    const newStartDatetime = `${newDate} ${newStartTime}`
    const newConsultantStart = moment
      .tz(newStartDatetime, requestTimezone)
      .tz(expert_timezone)
    const newConsultantEnd = newConsultantStart.clone().add(1, 'hour')

    const newEventStartISO = newConsultantStart.toISOString()
    const newEventEndISO = newConsultantEnd.toISOString()

    const newUtcDate = moment.utc(newEventStartISO).format('YYYY-MM-DD')
    const newUtcStartTime = moment
      .utc(newEventStartISO)
      .format('YYYY-MM-DD HH:mm:ss')

    // 3. Secure New Slot
    const secureSlotQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND is_booked = 0
    `

    const secureResult = await new Promise((resolve, reject) => {
      db.query(
        secureSlotQuery,
        [consultant_id, newUtcDate, newUtcStartTime],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    if (secureResult.affectedRows === 0) {
      return res.status(400).json({ message: 'New slot is not available' })
    }

    // 4. Free Old Slot
    const oldUtcDate = moment.utc(oldEventStart).format('YYYY-MM-DD')
    const oldUtcStartTime = moment
      .utc(oldEventStart)
      .format('YYYY-MM-DD HH:mm:ss')

    const freeSlotQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 0
      WHERE consultant_id = ? AND slot_date = ? AND start_time = ?
    `

    await new Promise((resolve, reject) => {
      db.query(
        freeSlotQuery,
        [consultant_id, oldUtcDate, oldUtcStartTime],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    // 5. Update Consultation Record
    const updateConsultationQuery = `
      UPDATE dmac_webapp_consultations
      SET event_start = ?, event_end = ?, consultation_date = ?, consultation_status = 1
      WHERE id = ?
    `

    await new Promise((resolve, reject) => {
      db.query(
        updateConsultationQuery,
        [newEventStartISO, newEventEndISO, newDate, consultationId],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    // 6. Send Email Notification
    const subject = 'Consultation Rescheduled'
    const htmlContent = `
      <p>Dear ${user_name},</p>
      <p>Your consultation has been successfully rescheduled.</p>
      <p><b>New Date:</b> ${newDate}</p>
      <p><b>New Time:</b> ${moment(newEventStartISO)
        .tz(user_timezone)
        .format('YYYY-MM-DD hh:mm A')}</p>
    `

    await sendEmail(user_email, subject, htmlContent, htmlContent)

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
