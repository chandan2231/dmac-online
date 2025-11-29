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
        const hour = slot.hour.toString().padStart(2, '0')

        // Create moment object in Therapist's timezone
        const localStartTime = moment.tz(
          `${day.date} ${hour}:00`,
          'YYYY-MM-DD HH:mm',
          therapistTimezone
        )
        const localEndTime = localStartTime.clone().add(1, 'hours')

        // Convert to UTC for storage
        const utcStartTime = localStartTime
          .clone()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
        const utcEndTime = localEndTime
          .clone()
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
        const utcDate = localStartTime.clone().utc().format('YYYY-MM-DD')

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
