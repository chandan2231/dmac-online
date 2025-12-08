import { db } from '../connect.js'
import moment from 'moment-timezone'
import { google } from 'googleapis'
import sendEmail from '../emailService.js'
import { uploadFile, deleteFile } from '../utils/s3Service.js'
import fs from 'fs'

function queryDB(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

const generateConsultationId = async (country, type) => {
  const countryCode = country ? country.substring(0, 2).toUpperCase() : 'XX'
  const prefix = `CON${countryCode}${type}`
  const tableName =
    type === 'EX'
      ? 'dmac_webapp_consultations'
      : 'dmac_webapp_therapist_consultations'

  const query = `SELECT consultation_id FROM ${tableName} WHERE consultation_id LIKE '${prefix}%' ORDER BY id DESC LIMIT 1`

  const result = await new Promise((resolve, reject) => {
    db.query(query, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })

  let nextNum = 1
  if (result.length > 0 && result[0].consultation_id) {
    const lastId = result[0].consultation_id
    const lastNumStr = lastId.replace(prefix, '')
    const lastNum = parseInt(lastNumStr, 10)
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1
    }
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`
}

export const getAvailableExpertSlots = async (req, res) => {
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
    // We use startOf('day') and endOf('day') to cover the full 24 hours of the user's selected date
    const startOfDayUTC = moment
      .tz(date, 'YYYY-MM-DD', user_timezone)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfDayUTC = moment
      .tz(date, 'YYYY-MM-DD', user_timezone)
      .endOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')

    /** 3️⃣ Get consultant slots for the selected date */
    const currentDateTimeUTC = moment.utc().format('YYYY-MM-DD HH:mm:ss')
    const slotQuery = `
      SELECT id, start_time, end_time
      FROM dmac_webapp_expert_availability
      WHERE consultant_id = ?
        AND start_time BETWEEN ? AND ?
        AND start_time > ?
        AND is_booked = 0
        AND is_slot_available = 1
        AND is_day_off = 1
      ORDER BY start_time ASC
    `

    const slotRows = await new Promise((resolve, reject) => {
      db.query(
        slotQuery,
        [consultation_id, startOfDayUTC, endOfDayUTC, currentDateTimeUTC],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    /** 4️⃣ Convert slots back to user's timezone */
    const formattedSlots = slotRows
      .map((slot) => {
        // 1. Get the "face value" of the time string from the DB (e.g., "2025-12-01 19:00:00")
        // We use moment() to parse, then format() to strip any timezone offsets the driver might have added
        const rawStart = moment(slot.start_time).format('YYYY-MM-DD HH:mm:ss')
        const rawEnd = moment(slot.end_time).format('YYYY-MM-DD HH:mm:ss')

        // 2. Treat that face value as UTC, then convert to User's Timezone
        const startMoment = moment.utc(rawStart).tz(user_timezone)
        const endMoment = moment.utc(rawEnd).tz(user_timezone)

        return {
          slot_id: slot.id,
          start: startMoment.format('YYYY-MM-DD HH:mm'),
          end: endMoment.format('YYYY-MM-DD HH:mm')
        }
      })
      .filter((slot) => slot.start.startsWith(date))

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

export const getTherapistListByLanguage = async (req, res) => {
  const { userId, date } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    let availabilityJoin = ''
    let availabilityParams = []

    if (date) {
      // Get user timezone
      const timezoneQuery = `SELECT time_zone FROM dmac_webapp_users WHERE id = ? LIMIT 1`
      const userResult = await new Promise((resolve, reject) => {
        db.query(timezoneQuery, [userId], (err, data) => {
          if (err) reject(err)
          resolve(data)
        })
      })

      const user_timezone = userResult[0]?.time_zone || 'UTC'

      // Calculate start and end of 14 days window in UTC
      const startOfDayUTC = moment
        .tz(date, 'YYYY-MM-DD', user_timezone)
        .startOf('day')
        .utc()
        .format('YYYY-MM-DD HH:mm:ss')
      const endOf14DaysUTC = moment
        .tz(date, 'YYYY-MM-DD', user_timezone)
        .add(14, 'days')
        .endOf('day')
        .utc()
        .format('YYYY-MM-DD HH:mm:ss')
      const currentDateTimeUTC = moment.utc().format('YYYY-MM-DD HH:mm:ss')

      availabilityJoin = `
        JOIN (
          SELECT DISTINCT consultant_id 
          FROM dmac_webapp_therapist_availability
          WHERE start_time BETWEEN ? AND ?
            AND start_time > ?
            AND is_booked = 0
            AND is_slot_available = 1
            AND is_day_off = 1
        ) avail ON avail.consultant_id = t.id
      `
      availabilityParams = [startOfDayUTC, endOf14DaysUTC, currentDateTimeUTC]
    }

    const query = `
    SELECT 
        t.id,
        t.name,
        t.email,
        t.country,
        t.province_title,
        t.role,
        t.time_zone,
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_names,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
    FROM dmac_webapp_users t
    JOIN dmac_webapp_users u ON u.id = ?
    JOIN dmac_webapp_language lang ON FIND_IN_SET(lang.id, t.language)
    ${availabilityJoin}
    LEFT JOIN dmac_webapp_therapist_reviews r ON r.therapist_id = t.id
    WHERE t.role = 'THERAPIST'
      AND FIND_IN_SET(u.language, t.language)
    GROUP BY t.id, t.name, t.email, t.country, t.province_title, t.role, t.time_zone;
  `

    const params = [userId, ...availabilityParams]

    db.query(query, params, (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json(data)
    })
  } catch (error) {
    console.error('Error in getTherapistListByLanguage:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getExpertListByLanguage = (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  const query = `
    SELECT 
        t.id,
        t.name,
        t.email,
        t.country,
        t.province_title,
        t.role,
        t.time_zone,
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_names,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
    FROM dmac_webapp_users t
    JOIN dmac_webapp_users u ON u.id = ?
    JOIN dmac_webapp_language lang ON FIND_IN_SET(lang.id, t.language)
    LEFT JOIN dmac_webapp_expert_reviews r ON r.expert_id = t.id
    WHERE t.role = 'EXPERT'
      AND FIND_IN_SET(u.language, t.language)
    GROUP BY t.id, t.name, t.email, t.country, t.province_title, t.role, t.time_zone;
  `

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}

export const bookConsultationWithGoogleCalender = async (req, res) => {
  const useStatic = false
  let consultant_id,
    user_id,
    user_timezone,
    consultant_timezone,
    date,
    start_time,
    product_id

  if (useStatic) {
    consultant_id = 4
    user_id = 22
    user_timezone = 'Asia/Kolkata'
    consultant_timezone = 'America/Chicago'
    date = '2025-11-29'
    start_time = '16:30'
    product_id = 5
  } else {
    ;({ consultant_id, user_id, date, start_time, product_id } = req.body)
  }

  if (!consultant_id || !user_id || !date || !start_time) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required booking fields' })
  }

  try {
    /* 🔹 Fetch consultant email + tokens + timezone */
    const consultantQuery = `SELECT id, email, google_access_token, google_refresh_token, name, time_zone FROM dmac_webapp_users WHERE id = ?`
    const consultant = await new Promise((resolve, reject) => {
      db.query(consultantQuery, [consultant_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    })
    if (consultant.length === 0)
      return res
        .status(404)
        .json({ status: 404, message: 'Consultant not found' })

    const {
      google_access_token,
      google_refresh_token,
      email: consultant_email,
      name: consultant_name,
      time_zone: fetched_consultant_timezone
    } = consultant[0]

    consultant_timezone = fetched_consultant_timezone

    /* 🔹 Fetch user info + timezone */
    const userQuery = `SELECT id, email, name, google_access_token as user_access_token, google_refresh_token as user_refresh_token, time_zone, country FROM dmac_webapp_users WHERE id = ?`
    const user = await new Promise((resolve, reject) => {
      db.query(userQuery, [user_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    })
    if (user.length === 0)
      return res.status(404).json({ status: 404, message: 'User not found' })

    const {
      email: user_email,
      name: user_name,
      user_access_token,
      user_refresh_token,
      time_zone: fetched_user_timezone,
      country
    } = user[0]

    user_timezone = fetched_user_timezone

    const userStartDatetime = `${date} ${start_time}`
    const consultantStart = moment
      .tz(userStartDatetime, user_timezone)
      .tz(consultant_timezone)
    const consultantEnd = consultantStart.clone().add(1, 'hour')

    const eventStartISO = consultantStart.toISOString()
    const eventEndISO = consultantEnd.toISOString()

    /* 🔥 SECURE SLOT FIRST (Optimistic Locking) */
    const utcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
    const utcStartTime = moment.utc(eventStartISO).format('YYYY-MM-DD HH:mm:ss')
    const utcEndTime = moment.utc(eventEndISO).format('YYYY-MM-DD HH:mm:ss')

    const slotUpdateQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND is_booked = 0
    `

    try {
      const secureResult = await new Promise((resolve, reject) => {
        db.query(
          slotUpdateQuery,
          [consultant_id, utcDate, utcStartTime],
          (err, result) => (err ? reject(err) : resolve(result))
        )
      })

      if (secureResult.affectedRows === 0) {
        return res.status(400).json({
          status: 400,
          message:
            'This slot is already booked or unavailable. Please choose another time.'
        })
      }
    } catch (dbError) {
      console.error('DB Error securing slot:', dbError)
      return res
        .status(500)
        .json({ status: 500, message: 'Database error while securing slot' })
    }

    let meetLink = ''

    /* 🔹 Setup Google Calendar for CONSULTANT */
    if (google_access_token && google_refresh_token) {
      try {
        const consultantAuth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_SECRET_KEY,
          process.env.GOOGLE_REDIRECT_URL
        )
        consultantAuth.setCredentials({
          access_token: google_access_token,
          refresh_token: google_refresh_token
        })

        const consultantCalendar = google.calendar({
          version: 'v3',
          auth: consultantAuth
        })

        // Check availability
        const freeBusy = await consultantCalendar.freebusy.query({
          requestBody: {
            timeMin: eventStartISO,
            timeMax: eventEndISO,
            items: [{ id: consultant_email }]
          }
        })

        if (freeBusy.data.calendars[consultant_email].busy.length > 0) {
          // Rollback slot booking
          await new Promise((resolve) => {
            db.query(
              `UPDATE dmac_webapp_expert_availability SET is_booked = 0 WHERE consultant_id = ? AND slot_date = ? AND start_time = ?`,
              [consultant_id, utcDate, utcStartTime],
              resolve
            )
          })
          return res.status(400).json({
            status: 400,
            message: 'Consultant Google Calendar is busy for this time slot'
          })
        }

        /* 🔹 Create Event (attendees: BOTH) */
        const event = {
          summary: 'DMAC Consultation Meeting',
          description: 'Online consultation for the DMAC',
          start: { dateTime: eventStartISO, timeZone: consultant_timezone },
          end: { dateTime: eventEndISO, timeZone: consultant_timezone },
          attendees: [{ email: consultant_email }, { email: user_email }],
          conferenceData: {
            createRequest: { requestId: Date.now().toString() }
          }
        }

        const eventResult = await consultantCalendar.events.insert({
          calendarId: consultant_email,
          conferenceDataVersion: 1,
          requestBody: event
        })

        meetLink = eventResult.data.hangoutLink

        /* 🔹 OPTIONAL: Add event to USER calendar only if they have Google token */
        if (user_access_token) {
          const userAuth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_SECRET_KEY,
            process.env.GOOGLE_REDIRECT_URL
          )
          userAuth.setCredentials({
            access_token: user_access_token,
            refresh_token: user_refresh_token
          })

          const userCalendar = google.calendar({
            version: 'v3',
            auth: userAuth
          })

          await userCalendar.events.insert({
            calendarId: user_email,
            conferenceDataVersion: 1,
            requestBody: event
          })
        }
      } catch (googleError) {
        console.error('Google Calendar Error (Expert):', googleError)
        // Continue without Google Calendar, but warn?
        // For now, we assume internal booking is primary.
      }
    }

    /* 🔹 Save booking */
    const consultation_id_generated = await generateConsultationId(
      country,
      'EX'
    )
    const insertQuery = `
      INSERT INTO dmac_webapp_consultations 
      (product_id, user_id, consultant_id, event_start, event_end, meet_link, user_timezone, consultant_timezone, consultation_date, consultation_status, consultation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    try {
      await new Promise((resolve, reject) => {
        db.query(
          insertQuery,
          [
            product_id,
            user_id,
            consultant_id,
            eventStartISO,
            eventEndISO,
            meetLink,
            user_timezone,
            consultant_timezone,
            date,
            1,
            consultation_id_generated
          ],
          (err, result) => (err ? reject(err) : resolve(result))
        )
      })
    } catch (insertError) {
      // Rollback slot booking if insert fails
      await new Promise((resolve) => {
        db.query(
          `UPDATE dmac_webapp_expert_availability SET is_booked = 0 WHERE consultant_id = ? AND slot_date = ? AND start_time = ?`,
          [consultant_id, utcDate, utcStartTime],
          resolve
        )
      })
      throw insertError
    }

    /* 🔹 Email to USER & CONSULTANT */
    const emailSubject = 'DMAC Consultation Booking Confirmed'

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultation has been booked successfully.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${moment(eventStartISO).tz(user_timezone).format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meetLink}">${meetLink}</a></p>
    `

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>A new consultation has been scheduled.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${consultantStart.format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meetLink}">${meetLink}</a></p>
    `

    await sendEmail(user_email, emailSubject, userHtml, userHtml)
    await sendEmail(
      consultant_email,
      emailSubject,
      consultantHtml,
      consultantHtml
    )

    return res.status(200).json({
      status: 200,
      booked: true,
      meetLink,
      consultant_view_time: consultantStart.format('YYYY-MM-DD hh:mm A'),
      user_view_time: moment(eventStartISO)
        .tz(user_timezone)
        .format('YYYY-MM-DD hh:mm A'),
      message: user_access_token
        ? 'Booking created & added to both calendars'
        : 'Booking created. User email sent (calendar not added due to missing Google token)'
    })
  } catch (error) {
    console.error('BOOKING ERROR:', error)
    return res.status(500).json({
      status: 500,
      booked: false,
      message: 'Unable to create booking'
    })
  }
}

export const rescheduleConsultationWithGoogleCalendar = async (req, res) => {
  const useStatic = false
  let consultation_id, date, start_time, user_timezone

  if (useStatic) {
    consultation_id = 4 // <-- dummy consultation ID
    date = '2025-11-29' // <-- new date selected for reschedule
    start_time = '21:00' // <-- new start time selected for reschedule
    user_timezone = 'Asia/Kolkata' // <-- user timezone
  } else {
    ;({ consultation_id, date, start_time, user_timezone } = req.body)
  }

  if (!consultation_id || !date || !start_time || !user_timezone) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required fields'
    })
  }

  try {
    /* 🔹 Fetch existing consultation details */
    const existingQuery = `
      SELECT c.*, 
        u.email AS user_email, u.name AS user_name, u.google_access_token AS user_access_token, u.google_refresh_token AS user_refresh_token, u.time_zone AS user_db_timezone,
        con.email AS consultant_email, con.name AS consultant_name, con.google_access_token AS consultant_access, con.google_refresh_token AS consultant_refresh, con.time_zone AS consultant_db_timezone,
        c.consultant_timezone
      FROM dmac_webapp_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      JOIN dmac_webapp_users con ON c.consultant_id = con.id
      WHERE c.id = ?`
    const data = await new Promise((resolve, reject) =>
      db.query(existingQuery, [consultation_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    )

    if (!data.length)
      return res
        .status(404)
        .json({ status: 404, message: 'Consultation not found' })

    const booking = data[0]

    if (booking.consultation_status === 4) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot reschedule a completed consultation'
      })
    }

    const {
      meet_link,
      consultant_timezone: booked_consultant_timezone,
      user_email,
      user_name,
      consultant_email,
      consultant_name,
      user_access_token,
      user_refresh_token,
      consultant_access,
      consultant_refresh,
      user_db_timezone,
      consultant_db_timezone
    } = booking

    // Use current DB timezones if available, otherwise fall back to booked/requested values
    const final_user_timezone = user_db_timezone || user_timezone
    const final_consultant_timezone =
      consultant_db_timezone || booked_consultant_timezone

    if (!final_user_timezone || !final_consultant_timezone) {
      return res.status(400).json({
        status: 400,
        message: 'Timezone information missing for user or consultant'
      })
    }

    /* 🔹 Convert user requested time to consultant TZ */
    const newUserStart = `${date} ${start_time}`
    const consultantStart = moment
      .tz(newUserStart, final_user_timezone)
      .tz(final_consultant_timezone)
    const consultantEnd = consultantStart.clone().add(1, 'hour')

    const eventStartISO = consultantStart.toISOString()
    const eventEndISO = consultantEnd.toISOString()

    // Check if new slot is available
    const checkUtcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
    const checkUtcStart = moment
      .utc(eventStartISO)
      .format('YYYY-MM-DD HH:mm:ss')

    const checkSlotQuery = `
        SELECT id FROM dmac_webapp_expert_availability
        WHERE consultant_id = ? 
        AND slot_date = ? 
        AND start_time = ? 
        AND is_booked = 1
    `
    const slotCheck = await new Promise((resolve, reject) => {
      db.query(
        checkSlotQuery,
        [booking.consultant_id, checkUtcDate, checkUtcStart],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    if (slotCheck.length > 0) {
      return res.status(400).json({
        status: 400,
        message:
          'The selected slot is already booked. Please choose another time.'
      })
    }

    /* 🔹 Update event in CONSULTANT Google Calendar */
    try {
      const consultantAuth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_SECRET_KEY,
        process.env.GOOGLE_REDIRECT_URL
      )
      consultantAuth.setCredentials({
        access_token: consultant_access,
        refresh_token: consultant_refresh
      })
      const consultantCalendar = google.calendar({
        version: 'v3',
        auth: consultantAuth
      })

      // Fetch event by Meet link
      const list = await consultantCalendar.events.list({
        calendarId: consultant_email,
        q: meet_link
      })

      if (list.data.items.length) {
        const eventId = list.data.items[0].id

        await consultantCalendar.events.patch({
          calendarId: consultant_email,
          eventId,
          conferenceDataVersion: 1,
          requestBody: {
            start: {
              dateTime: eventStartISO,
              timeZone: final_consultant_timezone
            },
            end: { dateTime: eventEndISO, timeZone: final_consultant_timezone }
          }
        })
      } else {
        console.warn('Event not found in consultant Google Calendar')
      }
    } catch (error) {
      console.error('Google Calendar Error (Consultant):', error)
      // Continue execution even if Google Calendar update fails
    }

    /* 🔹 OPTIONAL: Update event in USER Google Calendar */
    if (user_access_token) {
      try {
        const userAuth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_SECRET_KEY,
          process.env.GOOGLE_REDIRECT_URL
        )
        userAuth.setCredentials({
          access_token: user_access_token,
          refresh_token: user_refresh_token
        })

        const userCalendar = google.calendar({
          version: 'v3',
          auth: userAuth
        })

        const userEventList = await userCalendar.events.list({
          calendarId: user_email,
          q: meet_link
        })

        if (userEventList.data.items.length > 0) {
          const userEventID = userEventList.data.items[0].id
          await userCalendar.events.patch({
            calendarId: user_email,
            eventId: userEventID,
            conferenceDataVersion: 1,
            requestBody: {
              start: {
                dateTime: eventStartISO,
                timeZone: final_consultant_timezone
              },
              end: {
                dateTime: eventEndISO,
                timeZone: final_consultant_timezone
              }
            }
          })
        }
      } catch (error) {
        console.error('Google Calendar Error (User):', error)
        // Continue execution even if Google Calendar update fails
      }
    }

    /* 🔹 Update DB */
    const updateQuery = `
      UPDATE dmac_webapp_consultations
      SET event_start = ?, event_end = ?, consultation_date = ?, consultation_status = ?, user_timezone = ?, consultant_timezone = ?
      WHERE id = ?
    `
    await new Promise((resolve, reject) =>
      db.query(
        updateQuery,
        [
          eventStartISO,
          eventEndISO,
          date,
          6,
          final_user_timezone,
          final_consultant_timezone,
          consultation_id
        ],
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )

    /* 🔹 Update Availability Slots */
    // 1. Free the old slot
    const oldUtcDate = moment.utc(booking.event_start).format('YYYY-MM-DD')
    const oldUtcStart = moment
      .utc(booking.event_start)
      .format('YYYY-MM-DD HH:mm:ss')
    const oldUtcEnd = moment
      .utc(booking.event_end)
      .format('YYYY-MM-DD HH:mm:ss')

    const freeSlotQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 0
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND end_time = ?
    `
    await new Promise((resolve, reject) =>
      db.query(
        freeSlotQuery,
        [booking.consultant_id, oldUtcDate, oldUtcStart, oldUtcEnd],
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )

    // 2. Book the new slot
    const newUtcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
    const newUtcStart = moment.utc(eventStartISO).format('YYYY-MM-DD HH:mm:ss')
    const newUtcEnd = moment.utc(eventEndISO).format('YYYY-MM-DD HH:mm:ss')

    const bookSlotQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND end_time = ?
    `
    await new Promise((resolve, reject) =>
      db.query(
        bookSlotQuery,
        [booking.consultant_id, newUtcDate, newUtcStart, newUtcEnd],
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )

    /* 🔹 Send Email */
    const subject = 'DMAC Consultation Rescheduled'

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultation has been rescheduled successfully.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${moment(eventStartISO).tz(user_timezone).format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>A consultation has been rescheduled.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${consultantStart.format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `

    await sendEmail(user_email, subject, userHtml, userHtml)
    await sendEmail(consultant_email, subject, consultantHtml, consultantHtml)

    return res.status(200).json({
      status: 200,
      rescheduled: true,
      meetLink: meet_link,
      user_view_time: moment(eventStartISO)
        .tz(user_timezone)
        .format('YYYY-MM-DD hh:mm A'),
      consultant_view_time: consultantStart.format('YYYY-MM-DD hh:mm A'),
      message: user_access_token
        ? 'Reschedule updated in both calendars and emails sent'
        : 'Reschedule updated in consultant calendar only. User notified via email'
    })
  } catch (error) {
    console.error('RESCHEDULE ERROR:', error)
    return res.status(500).json({
      status: 500,
      rescheduled: false,
      message: 'Unable to reschedule consultation'
    })
  }
}

export const cancelConsultationByConsultant = async (req, res) => {
  let consultation_id

  // For development — static testing data
  const useStatic = false
  if (useStatic) {
    consultation_id = 7 // existing consultation id
  } else {
    consultation_id = req.body.consultation_id
  }

  if (!consultation_id) {
    return res
      .status(400)
      .json({ status: 400, message: 'consultation_id is required' })
  }

  try {
    // 1) Fetch consultation, user & consultant details
    const fetchQuery = `
      SELECT c.*, 
             c.event_id AS consultant_event_id,
             u.email AS user_email, u.name AS user_name, u.google_access_token AS user_access_token, u.google_refresh_token AS user_refresh_token,
             con.email AS consultant_email, con.name AS consultant_name, con.google_access_token AS consultant_access_token, con.google_refresh_token AS consultant_refresh_token
      FROM dmac_webapp_consultations c
      LEFT JOIN dmac_webapp_users u ON c.user_id = u.id
      LEFT JOIN dmac_webapp_users con ON c.consultant_id = con.id
      WHERE c.id = ?
      LIMIT 1
    `
    const result = await queryDB(fetchQuery, [consultation_id])
    if (!result.length) {
      return res
        .status(404)
        .json({ status: 404, message: 'Consultation not found' })
    }

    const booking = result[0]
    const {
      consultant_event_id,
      user_email,
      user_name,
      user_access_token,
      user_refresh_token,
      consultant_email,
      consultant_name,
      consultant_access_token,
      consultant_refresh_token,
      meet_link
    } = booking

    if (!consultant_email || !consultant_access_token) {
      return res
        .status(500)
        .json({ status: 500, message: 'Consultant calendar not configured' })
    }

    // 2) Cancel consultant event if exists
    const consultantAuth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SECRET_KEY,
      process.env.GOOGLE_REDIRECT_URL
    )
    consultantAuth.setCredentials({
      access_token: consultant_access_token,
      refresh_token: consultant_refresh_token
    })
    const consultantCalendar = google.calendar({
      version: 'v3',
      auth: consultantAuth
    })

    if (consultant_event_id) {
      await consultantCalendar.events
        .delete({
          calendarId: consultant_email,
          eventId: consultant_event_id
        })
        .catch(() => {}) // Ignore if already deleted
    }

    // 3) Cancel user event if user has tokens
    let userEventCancelled = false
    if (user_email && user_access_token) {
      const userOAuth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      )
      userOAuth.setCredentials({
        access_token: user_access_token,
        refresh_token: user_refresh_token
      })
      const userCalendar = google.calendar({ version: 'v3', auth: userOAuth })

      // Find the user's event by meet link
      if (meet_link) {
        const userList = await userCalendar.events.list({
          calendarId: user_email,
          q: meet_link,
          maxResults: 5
        })
        if (userList?.data?.items?.length) {
          const userEventId = userList.data.items[0].id
          await userCalendar.events
            .delete({
              calendarId: user_email,
              eventId: userEventId
            })
            .catch(() => {})
          userEventCancelled = true
        }
      }
    }

    // 4) Update DB
    const updateQuery = `
      UPDATE dmac_webapp_consultations
      SET consultation_status = 5, event_start = NULL, event_end = NULL
      WHERE id = ?
    `
    await queryDB(updateQuery, [consultation_id])

    /* 🔹 Free the slot in Availability Table */
    if (booking.event_start && booking.event_end) {
      const oldUtcDate = moment.utc(booking.event_start).format('YYYY-MM-DD')
      const oldUtcStart = moment
        .utc(booking.event_start)
        .format('YYYY-MM-DD HH:mm:ss')
      const oldUtcEnd = moment
        .utc(booking.event_end)
        .format('YYYY-MM-DD HH:mm:ss')

      const freeSlotQuery = `
          UPDATE dmac_webapp_expert_availability
          SET is_booked = 0
          WHERE consultant_id = ? 
          AND slot_date = ? 
          AND start_time = ? 
          AND end_time = ?
        `
      await queryDB(freeSlotQuery, [
        booking.consultant_id,
        oldUtcDate,
        oldUtcStart,
        oldUtcEnd
      ])
    }

    // 5) Email notifications
    const subject = 'DMAC Consultation Cancelled'

    const userHtml = `
      <p>Dear ${user_name || 'User'},</p>
      <h3>Your consultation has been cancelled by the consultant.</h3>
      <p><b>Google Meet Link:</b> <strike>${meet_link}</strike></p>
      <p>Please re-book a new slot.</p>
    `

    const consultantHtml = `
      <p>Dear ${consultant_name || 'Consultant'},</p>
      <h3>You have cancelled the consultation.</h3>
      <p><b>Google Meet Link:</b> <strike>${meet_link}</strike></p>
    `

    if (user_email) await sendEmail(user_email, subject, userHtml, userHtml)
    if (consultant_email)
      await sendEmail(consultant_email, subject, consultantHtml, consultantHtml)

    return res.status(200).json({
      status: 200,
      cancelled: true,
      user_calendar_cancelled: userEventCancelled,
      message: user_access_token
        ? 'Event cancelled from both calendars (if available). Emails sent.'
        : 'Event cancelled from consultant calendar. User notified by email.'
    })
  } catch (err) {
    console.error('CANCEL ERROR:', err)
    return res.status(500).json({
      status: 500,
      cancelled: false,
      error: err.message
    })
  }
}

export const getAvailableTherapistSlots = async (req, res) => {
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

    /** 2️⃣ Check availability on date + 13 days */
    const checkDate = moment
      .tz(date, 'YYYY-MM-DD', user_timezone)
      .add(13, 'days')
      .format('YYYY-MM-DD')
    const startOfCheckDayUTC = moment
      .tz(checkDate, 'YYYY-MM-DD', user_timezone)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfCheckDayUTC = moment
      .tz(checkDate, 'YYYY-MM-DD', user_timezone)
      .endOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const currentDateTimeUTC = moment.utc().format('YYYY-MM-DD HH:mm:ss')

    const checkQuery = `
      SELECT id
      FROM dmac_webapp_therapist_availability
      WHERE consultant_id = ?
        AND start_time BETWEEN ? AND ?
        AND start_time > ?
        AND is_booked = 0
        AND is_slot_available = 1
        AND is_day_off = 1
      LIMIT 1
    `

    const checkRows = await new Promise((resolve, reject) => {
      db.query(
        checkQuery,
        [
          consultation_id,
          startOfCheckDayUTC,
          endOfCheckDayUTC,
          currentDateTimeUTC
        ],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    if (checkRows.length === 0) {
      return res.status(200).json({
        status: 400,
        message:
          'Therapist is not available for the alternate day slot booking.'
      })
    }

    /** 3️⃣ Convert selected date into UTC date range */
    // We use startOf('day') and endOf('day') to cover the full 24 hours of the user's selected date
    const startOfDayUTC = moment
      .tz(date, 'YYYY-MM-DD', user_timezone)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    const endOfDayUTC = moment
      .tz(date, 'YYYY-MM-DD', user_timezone)
      .endOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')

    /** 4️⃣ Get consultant slots for the selected date */
    const slotQuery = `
      SELECT id, start_time, end_time
      FROM dmac_webapp_therapist_availability
      WHERE consultant_id = ?
        AND start_time BETWEEN ? AND ?
        AND start_time > ?
        AND is_booked = 0
        AND is_slot_available = 1
        AND is_day_off = 1
      ORDER BY start_time ASC
    `

    const slotRows = await new Promise((resolve, reject) => {
      db.query(
        slotQuery,
        [consultation_id, startOfDayUTC, endOfDayUTC, currentDateTimeUTC],
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        }
      )
    })

    /** 5️⃣ Convert slots back to user's timezone */
    const formattedSlots = slotRows
      .map((slot) => {
        // 1. Get the "face value" of the time string from the DB (e.g., "2025-12-01 19:00:00")
        // We use moment() to parse, then format() to strip any timezone offsets the driver might have added
        const rawStart = moment(slot.start_time).format('YYYY-MM-DD HH:mm:ss')
        const rawEnd = moment(slot.end_time).format('YYYY-MM-DD HH:mm:ss')

        // 2. Treat that face value as UTC, then convert to User's Timezone
        const startMoment = moment.utc(rawStart).tz(user_timezone)
        const endMoment = moment.utc(rawEnd).tz(user_timezone)

        return {
          slot_id: slot.id,
          start: startMoment.format('YYYY-MM-DD HH:mm'),
          end: endMoment.format('YYYY-MM-DD HH:mm')
        }
      })
      .filter((slot) => slot.start.startsWith(date))

    return res.status(200).json({
      status: 200,
      consultation_id,
      date,
      timezone: user_timezone,
      slots: formattedSlots
    })
  } catch (error) {
    console.error('getAvailableTherapistSlots Error:', error)
    return res.status(500).json({
      status: 500,
      message: 'Unable to fetch available slots'
    })
  }
}

export const bookTherapistConsultation = async (req, res) => {
  const { product_id, user_id, consultant_id, date, start_time } = req.body

  if (!consultant_id || !user_id || !date || !start_time) {
    return res
      .status(400)
      .json({ status: 400, message: 'Missing required booking fields' })
  }

  try {
    /* 🔹 Fetch consultant email + tokens + timezone */
    const consultantQuery = `SELECT id, email, google_access_token, google_refresh_token, name, time_zone FROM dmac_webapp_users WHERE id = ?`
    const consultant = await new Promise((resolve, reject) => {
      db.query(consultantQuery, [consultant_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    })
    if (consultant.length === 0)
      return res
        .status(404)
        .json({ status: 404, message: 'Consultant not found' })

    const {
      google_access_token,
      google_refresh_token,
      email: consultant_email,
      name: consultant_name,
      time_zone: fetched_consultant_timezone
    } = consultant[0]

    const consultant_timezone = fetched_consultant_timezone || 'Asia/Kolkata'

    /* 🔹 Fetch user info + timezone */
    const userQuery = `SELECT id, email, name, google_access_token as user_access_token, google_refresh_token as user_refresh_token, time_zone, country FROM dmac_webapp_users WHERE id = ?`
    const user = await new Promise((resolve, reject) => {
      db.query(userQuery, [user_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    })
    if (user.length === 0)
      return res.status(404).json({ status: 404, message: 'User not found' })

    const {
      email: user_email,
      name: user_name,
      user_access_token,
      user_refresh_token,
      time_zone: fetched_user_timezone,
      country
    } = user[0]

    const user_timezone = fetched_user_timezone || 'Asia/Kolkata'

    const bookings = []
    const errors = []
    const slotsToBook = []

    // 1. Calculate all 6 slots first
    for (let i = 0; i < 6; i++) {
      const currentDate = moment(date)
        .add(i * 2, 'days')
        .format('YYYY-MM-DD')
      const userStartDatetime = `${currentDate} ${start_time}`
      const consultantStart = moment
        .tz(userStartDatetime, user_timezone)
        .tz(consultant_timezone)
      const consultantEnd = consultantStart.clone().add(1, 'hour')

      const eventStartISO = consultantStart.toISOString()
      const eventEndISO = consultantEnd.toISOString()

      const utcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
      const utcStartTime = moment
        .utc(eventStartISO)
        .format('YYYY-MM-DD HH:mm:ss')
      const utcEndTime = moment.utc(eventEndISO).format('YYYY-MM-DD HH:mm:ss')

      slotsToBook.push({
        i,
        currentDate,
        eventStartISO,
        eventEndISO,
        utcDate,
        utcStartTime,
        utcEndTime,
        consultantStart,
        consultantEnd
      })
    }

    // 2. Try to LOCK all 6 slots in DB
    const lockedSlots = []
    let lockFailed = false

    try {
      for (const slot of slotsToBook) {
        const slotUpdateQuery = `
          UPDATE dmac_webapp_therapist_availability
          SET is_booked = 1
          WHERE consultant_id = ? 
          AND slot_date = ? 
          AND start_time = ? 
          AND is_booked = 0
        `
        const result = await new Promise((resolve, reject) => {
          db.query(
            slotUpdateQuery,
            [consultant_id, slot.utcDate, slot.utcStartTime],
            (err, result) => (err ? reject(err) : resolve(result))
          )
        })

        if (result.affectedRows === 0) {
          lockFailed = true
          break
        }
        lockedSlots.push(slot)
      }
    } catch (err) {
      console.error('DB Lock Error:', err)
      lockFailed = true
    }

    // 3. If locking failed, ROLLBACK (unlock) any locked slots and return error
    if (lockFailed) {
      for (const slot of lockedSlots) {
        const unlockQuery = `
          UPDATE dmac_webapp_therapist_availability
          SET is_booked = 0
          WHERE consultant_id = ? AND slot_date = ? AND start_time = ?
        `
        await new Promise((resolve) => {
          db.query(
            unlockQuery,
            [consultant_id, slot.utcDate, slot.utcStartTime],
            resolve
          )
        })
      }
      return res.status(400).json({
        status: 400,
        message:
          'One or more slots in the series are unavailable. Please choose a different start date or time.'
      })
    }

    // 4. Proceed with Booking (Google Calendar + DB Insert)
    for (const slot of slotsToBook) {
      const {
        currentDate,
        eventStartISO,
        eventEndISO,
        consultantStart,
        consultantEnd
      } = slot
      let meetLink = ''

      /* 🔹 Setup Google Calendar for CONSULTANT */
      if (google_access_token && google_refresh_token) {
        try {
          const consultantAuth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_SECRET_KEY,
            process.env.GOOGLE_REDIRECT_URL
          )
          consultantAuth.setCredentials({
            access_token: google_access_token,
            refresh_token: google_refresh_token
          })

          const consultantCalendar = google.calendar({
            version: 'v3',
            auth: consultantAuth
          })

          // Check availability (Double check, though we locked our DB)
          const freeBusy = await consultantCalendar.freebusy.query({
            requestBody: {
              timeMin: eventStartISO,
              timeMax: eventEndISO,
              items: [{ id: consultant_email }]
            }
          })

          if (freeBusy.data.calendars[consultant_email].busy.length > 0) {
            console.warn(`Consultant Google Calendar busy for ${currentDate}`)
          } else {
            /* 🔹 Create Event (attendees: BOTH) */
            const event = {
              summary: `DMAC Consultation Meeting (Session ${slot.i + 1}/6)`,
              description: 'Online consultation for the DMAC',
              start: { dateTime: eventStartISO, timeZone: consultant_timezone },
              end: { dateTime: eventEndISO, timeZone: consultant_timezone },
              attendees: [{ email: consultant_email }, { email: user_email }],
              conferenceData: {
                createRequest: { requestId: Date.now().toString() }
              }
            }

            const eventResult = await consultantCalendar.events.insert({
              calendarId: consultant_email,
              conferenceDataVersion: 1,
              requestBody: event
            })

            meetLink = eventResult.data.hangoutLink

            /* 🔹 OPTIONAL: Add event to USER calendar only if they have Google token */
            if (user_access_token) {
              const userAuth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_SECRET_KEY,
                process.env.GOOGLE_REDIRECT_URL
              )
              userAuth.setCredentials({
                access_token: user_access_token,
                refresh_token: user_refresh_token
              })

              const userCalendar = google.calendar({
                version: 'v3',
                auth: userAuth
              })

              await userCalendar.events.insert({
                calendarId: user_email,
                conferenceDataVersion: 1,
                requestBody: event
              })
            }
          }
        } catch (googleError) {
          console.error('Google Calendar Error (Therapist):', googleError)
          // Continue without Google Calendar
        }
      }

      try {
        /* 🔹 Save booking */
        const consultation_id_generated = await generateConsultationId(
          country,
          'TH'
        )
        const insertQuery = `
          INSERT INTO dmac_webapp_therapist_consultations 
          (product_id, user_id, consultant_id, event_start, event_end, meet_link, user_timezone, consultant_timezone, consultation_date, consultation_status, consultation_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        await new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [
              product_id,
              user_id,
              consultant_id,
              eventStartISO,
              eventEndISO,
              meetLink,
              user_timezone,
              consultant_timezone,
              currentDate,
              1,
              consultation_id_generated
            ],
            (err, result) => (err ? reject(err) : resolve(result))
          )
        })

        bookings.push({ date: currentDate, status: 'booked', meetLink })
      } catch (dbError) {
        console.error('DB Insert Error:', dbError)
        errors.push({ date: currentDate, error: 'Database error' })
      }
    }

    /* 🔹 Email to USER & CONSULTANT (Summary) */
    const emailSubject = 'DMAC Consultation Bookings Confirmed'

    // Construct email body with list of bookings
    const bookingListHtml = bookings
      .map(
        (b) => `<li>${b.date}: <a href="${b.meetLink}">${b.meetLink}</a></li>`
      )
      .join('')

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultations have been booked successfully.</h3>
      <ul>${bookingListHtml}</ul>
      ${
        errors.length > 0
          ? `<p>Failed bookings: ${errors.map((e) => e.date).join(', ')}</p>`
          : ''
      }
    `

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>New consultations have been scheduled.</h3>
      <ul>${bookingListHtml}</ul>
    `

    if (bookings.length > 0) {
      await sendEmail(user_email, emailSubject, userHtml, userHtml)
      await sendEmail(
        consultant_email,
        emailSubject,
        consultantHtml,
        consultantHtml
      )
    }

    return res.status(200).json({
      status: 200,
      booked: bookings.length > 0,
      bookings,
      errors,
      message:
        bookings.length === 6
          ? 'All 6 sessions booked successfully'
          : `Booked ${bookings.length} sessions. ${errors.length} failed.`
    })
  } catch (error) {
    console.error('BOOKING ERROR:', error)
    return res.status(500).json({
      status: 500,
      booked: false,
      message: 'Failed to book consultation',
      error: error.message
    })
  }
}

export const getConsultationList = async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({
      status: 400,
      message: 'user_id is required'
    })
  }

  try {
    const query = `
      SELECT 
        c.id,
        c.consultation_date,
        c.event_start,
        c.event_end,
        c.consultation_status,
        c.meet_link,
        u.name as expert_name,
        c.consultant_id,
        c.consultant_id as expert_id,
        c.user_timezone
      FROM dmac_webapp_consultations c
      JOIN dmac_webapp_users u ON c.consultant_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.consultation_date DESC
    `

    const consultations = await new Promise((resolve, reject) => {
      db.query(query, [user_id], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    // Format the dates and times for the frontend
    const formattedConsultations = consultations.map((consultation) => {
      return {
        id: consultation.id,
        expert_name: consultation.expert_name,
        consultation_date: consultation.consultation_date,
        event_start: consultation.event_start,
        event_end: consultation.event_end,
        status: consultation.consultation_status,
        meet_link: consultation.meet_link,
        expert_id: consultation.expert_id,
        consultant_id: consultation.consultant_id
      }
    })

    return res.status(200).json({
      status: 200,
      data: formattedConsultations
    })
  } catch (error) {
    console.error('Error fetching consultation list:', error)
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch consultation list',
      error: error.message
    })
  }
}

export const getTherapistConsultationList = async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({
      status: 400,
      message: 'user_id is required'
    })
  }

  try {
    const query = `
      SELECT 
        c.id,
        c.consultation_date,
        c.event_start,
        c.event_end,
        c.consultation_status,
        c.meet_link,
        u.name as expert_name,
        c.consultant_id,
        c.consultant_id as therapist_id,
        c.user_timezone
      FROM dmac_webapp_therapist_consultations c
      JOIN dmac_webapp_users u ON c.consultant_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.consultation_date DESC
    `

    const consultations = await new Promise((resolve, reject) => {
      db.query(query, [user_id], (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    // Format the dates and times for the frontend
    const formattedConsultations = consultations.map((consultation) => {
      return {
        id: consultation.id,
        expert_name: consultation.expert_name,
        consultation_date: consultation.consultation_date,
        event_start: consultation.event_start,
        event_end: consultation.event_end,
        status: consultation.consultation_status,
        meet_link: consultation.meet_link,
        therapist_id: consultation.therapist_id,
        consultant_id: consultation.consultant_id
      }
    })

    return res.status(200).json({
      status: 200,
      data: formattedConsultations
    })
  } catch (error) {
    console.error('Error fetching therapist consultation list:', error)
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch therapist consultation list',
      error: error.message
    })
  }
}

export const rescheduleTherapistConsultation = async (req, res) => {
  const { consultation_id, date, start_time, user_timezone } = req.body

  if (!consultation_id || !date || !start_time || !user_timezone) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required fields'
    })
  }

  try {
    /* 🔹 Fetch existing consultation details */
    const existingQuery = `
      SELECT c.*, 
        u.email AS user_email, u.name AS user_name, u.google_access_token AS user_access_token, u.google_refresh_token AS user_refresh_token, u.time_zone AS user_db_timezone,
        con.email AS consultant_email, con.name AS consultant_name, con.google_access_token AS consultant_access, con.google_refresh_token AS consultant_refresh, con.time_zone AS consultant_db_timezone,
        c.consultant_timezone
      FROM dmac_webapp_therapist_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      JOIN dmac_webapp_users con ON c.consultant_id = con.id
      WHERE c.id = ?`
    const data = await new Promise((resolve, reject) =>
      db.query(existingQuery, [consultation_id], (err, result) =>
        err ? reject(err) : resolve(result)
      )
    )

    if (!data.length)
      return res
        .status(404)
        .json({ status: 404, message: 'Consultation not found' })

    const booking = data[0]

    if (booking.consultation_status === 4) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot reschedule a completed consultation'
      })
    }

    const {
      meet_link,
      consultant_timezone: booked_consultant_timezone,
      user_email,
      user_name,
      consultant_email,
      consultant_name,
      user_access_token,
      user_refresh_token,
      consultant_access,
      consultant_refresh,
      user_db_timezone,
      consultant_db_timezone
    } = booking

    // Use current DB timezones if available, otherwise fall back to booked/requested values
    const final_user_timezone = user_db_timezone || user_timezone
    const final_consultant_timezone =
      consultant_db_timezone || booked_consultant_timezone

    if (!final_user_timezone || !final_consultant_timezone) {
      return res.status(400).json({
        status: 400,
        message: 'Timezone information missing for user or consultant'
      })
    }

    /* 🔹 Convert user requested time to consultant TZ */
    const newUserStart = `${date} ${start_time}`
    const consultantStart = moment
      .tz(newUserStart, final_user_timezone)
      .tz(final_consultant_timezone)
    const consultantEnd = consultantStart.clone().add(1, 'hour')

    const eventStartISO = consultantStart.toISOString()
    const eventEndISO = consultantEnd.toISOString()

    // Check if new slot is available
    const checkUtcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
    const checkUtcStart = moment
      .utc(eventStartISO)
      .format('YYYY-MM-DD HH:mm:ss')

    const checkSlotQuery = `
        SELECT id FROM dmac_webapp_therapist_availability
        WHERE consultant_id = ? 
        AND slot_date = ? 
        AND start_time = ? 
        AND is_booked = 1
    `
    const slotCheck = await new Promise((resolve, reject) => {
      db.query(
        checkSlotQuery,
        [booking.consultant_id, checkUtcDate, checkUtcStart],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        }
      )
    })

    if (slotCheck.length > 0) {
      return res.status(400).json({
        status: 400,
        message:
          'The selected slot is already booked. Please choose another time.'
      })
    }

    /* 🔹 Update event in CONSULTANT Google Calendar */
    if (consultant_access && consultant_refresh) {
      try {
        const consultantAuth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_SECRET_KEY,
          process.env.GOOGLE_REDIRECT_URL
        )
        consultantAuth.setCredentials({
          access_token: consultant_access,
          refresh_token: consultant_refresh
        })
        const consultantCalendar = google.calendar({
          version: 'v3',
          auth: consultantAuth
        })

        // Fetch event by Meet link
        const list = await consultantCalendar.events.list({
          calendarId: consultant_email,
          q: meet_link
        })

        if (list.data.items.length) {
          const eventId = list.data.items[0].id

          await consultantCalendar.events.patch({
            calendarId: consultant_email,
            eventId,
            conferenceDataVersion: 1,
            requestBody: {
              start: {
                dateTime: eventStartISO,
                timeZone: final_consultant_timezone
              },
              end: {
                dateTime: eventEndISO,
                timeZone: final_consultant_timezone
              }
            }
          })
        }
      } catch (error) {
        console.error('Google Calendar Error (Therapist):', error)
      }
    }

    /* 🔹 OPTIONAL: Update event in USER Google Calendar */
    if (user_access_token) {
      try {
        const userAuth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_SECRET_KEY,
          process.env.GOOGLE_REDIRECT_URL
        )
        userAuth.setCredentials({
          access_token: user_access_token,
          refresh_token: user_refresh_token
        })

        const userCalendar = google.calendar({
          version: 'v3',
          auth: userAuth
        })

        const userEventList = await userCalendar.events.list({
          calendarId: user_email,
          q: meet_link
        })

        if (userEventList.data.items.length > 0) {
          const userEventID = userEventList.data.items[0].id
          await userCalendar.events.patch({
            calendarId: user_email,
            eventId: userEventID,
            conferenceDataVersion: 1,
            requestBody: {
              start: {
                dateTime: eventStartISO,
                timeZone: final_consultant_timezone
              },
              end: {
                dateTime: eventEndISO,
                timeZone: final_consultant_timezone
              }
            }
          })
        }
      } catch (error) {
        console.error('Google Calendar Error (User):', error)
      }
    }

    /* 🔹 Update DB */
    const updateQuery = `
      UPDATE dmac_webapp_therapist_consultations
      SET event_start = ?, event_end = ?, consultation_date = ?, consultation_status = ?, user_timezone = ?, consultant_timezone = ?
      WHERE id = ?
    `
    await new Promise((resolve, reject) =>
      db.query(
        updateQuery,
        [
          eventStartISO,
          eventEndISO,
          date,
          6,
          final_user_timezone,
          final_consultant_timezone,
          consultation_id
        ],
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )

    /* 🔹 Update Availability Slots */
    // 1. Free the old slot
    if (booking.event_start && booking.event_end) {
      const oldUtcDate = moment.utc(booking.event_start).format('YYYY-MM-DD')
      const oldUtcStart = moment
        .utc(booking.event_start)
        .format('YYYY-MM-DD HH:mm:ss')
      const oldUtcEnd = moment
        .utc(booking.event_end)
        .format('YYYY-MM-DD HH:mm:ss')

      const freeSlotQuery = `
        UPDATE dmac_webapp_therapist_availability
        SET is_booked = 0
        WHERE consultant_id = ? 
        AND slot_date = ? 
        AND start_time = ? 
        AND end_time = ?
      `
      await new Promise((resolve, reject) =>
        db.query(
          freeSlotQuery,
          [booking.consultant_id, oldUtcDate, oldUtcStart, oldUtcEnd],
          (err, result) => (err ? reject(err) : resolve(result))
        )
      )
    }

    // 2. Book the new slot
    const newUtcDate = moment.utc(eventStartISO).format('YYYY-MM-DD')
    const newUtcStart = moment.utc(eventStartISO).format('YYYY-MM-DD HH:mm:ss')
    const newUtcEnd = moment.utc(eventEndISO).format('YYYY-MM-DD HH:mm:ss')

    const bookSlotQuery = `
      UPDATE dmac_webapp_therapist_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND end_time = ?
    `
    await new Promise((resolve, reject) =>
      db.query(
        bookSlotQuery,
        [booking.consultant_id, newUtcDate, newUtcStart, newUtcEnd],
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )

    /* 🔹 Send Email */
    const subject = 'DMAC Consultation Rescheduled'

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultation has been rescheduled successfully.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${moment(eventStartISO).tz(user_timezone).format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>A consultation has been rescheduled.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${consultantStart.format('YYYY-MM-DD hh:mm A')}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `

    await sendEmail(user_email, subject, userHtml, userHtml)
    await sendEmail(consultant_email, subject, consultantHtml, consultantHtml)

    return res.status(200).json({
      status: 200,
      rescheduled: true,
      meetLink: meet_link,
      user_view_time: moment(eventStartISO)
        .tz(user_timezone)
        .format('YYYY-MM-DD hh:mm A'),
      consultant_view_time: consultantStart.format('YYYY-MM-DD hh:mm A'),
      message: user_access_token
        ? 'Reschedule updated in both calendars and emails sent'
        : 'Reschedule updated in consultant calendar only. User notified via email'
    })
  } catch (error) {
    console.error('RESCHEDULE ERROR:', error)
    return res.status(500).json({
      status: 500,
      rescheduled: false,
      message: 'Unable to reschedule consultation'
    })
  }
}

export const getProfile = (req, res) => {
  const { user_id } = req.body
  const q =
    'SELECT id, name, email, mobile, country, state, zip_code, language, time_zone, role FROM dmac_webapp_users WHERE id = ?'

  db.query(q, [user_id], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length === 0) return res.status(404).json('User not found!')
    const { password, ...info } = data[0]
    return res.status(200).json(info)
  })
}

export const updateProfile = (req, res) => {
  const {
    user_id,
    name,
    mobile,
    country,
    state,
    zip_code,
    language,
    time_zone
  } = req.body

  const q =
    'UPDATE dmac_webapp_users SET name=?, mobile=?, country=?, state=?, zip_code=?, language=?, time_zone=? WHERE id=?'
  const values = [
    name,
    mobile,
    country,
    state,
    zip_code,
    language,
    time_zone,
    user_id
  ]

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json('Profile has been updated.')
  })
}

export const uploadDocument = async (req, res) => {
  const userId = req.user.userId
  const file = req.file

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  if (file.size > 5 * 1024 * 1024) {
    fs.unlinkSync(file.path)
    return res.status(400).json({ message: 'File size exceeds 5MB' })
  }

  try {
    // Check document count
    const countQuery =
      'SELECT COUNT(*) as count FROM dmac_webapp_patient_documents WHERE user_id = ?'
    const countResult = await queryDB(countQuery, [userId])
    if (countResult[0].count >= 5) {
      fs.unlinkSync(file.path) // Delete temp file
      return res
        .status(400)
        .json({ message: 'Maximum document limit (5) reached' })
    }

    // Get user name for folder structure
    const userQuery = 'SELECT name FROM dmac_webapp_users WHERE id = ?'
    const userResult = await queryDB(userQuery, [userId])
    if (!userResult.length) {
      fs.unlinkSync(file.path)
      return res.status(404).json({ message: 'User not found' })
    }
    const userName = userResult[0].name.replace(/\s+/g, '_')

    const s3Key = `${userName}_${userId}/${file.originalname}`

    // Upload to S3
    const s3Result = await uploadFile(file.path, s3Key)

    // Save to DB
    const insertQuery = `
      INSERT INTO dmac_webapp_patient_documents (user_id, file_name, file_url, file_type, file_size, s3_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    await queryDB(insertQuery, [
      userId,
      file.originalname,
      s3Result.Location || s3Result.cdnUrl, // Fallback to cdnUrl if Location is missing
      file.mimetype,
      file.size,
      s3Result.Key || s3Result.key
    ])

    // Cleanup
    fs.unlinkSync(file.path)

    res
      .status(200)
      .json({ message: 'Document uploaded successfully', document: s3Result })
  } catch (error) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    console.error(error)
    res.status(500).json({ message: 'Error uploading document' })
  }
}

export const getUserDocuments = async (req, res) => {
  const userId = req.user.userId
  try {
    const query =
      'SELECT * FROM dmac_webapp_patient_documents WHERE user_id = ? ORDER BY created_at DESC'
    const documents = await queryDB(query, [userId])
    res.status(200).json(documents)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching documents' })
  }
}

export const deleteUserDocument = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params

  try {
    // Get document details
    const query =
      'SELECT * FROM dmac_webapp_patient_documents WHERE id = ? AND user_id = ?'
    const result = await queryDB(query, [id, userId])

    if (!result.length) {
      return res.status(404).json({ message: 'Document not found' })
    }

    const document = result[0]

    // Delete from S3
    await deleteFile(document.s3_key)

    // Delete from DB
    const deleteQuery = 'DELETE FROM dmac_webapp_patient_documents WHERE id = ?'
    await queryDB(deleteQuery, [id])

    res.status(200).json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error deleting document' })
  }
}

export const getAssessmentStatus = async (req, res) => {
  const userId = req.user.userId
  try {
    const query = 'SELECT * FROM patient_assessments WHERE user_id = ?'
    const result = await queryDB(query, [userId])

    if (result.length === 0) {
      return res.status(200).json({
        adl: false,
        fall_risk: false,
        depression: false,
        sleep: false,
        consent: false
      })
    }

    const assessment = result[0]
    res.status(200).json({
      adl: !!assessment.adl_data,
      fall_risk: !!assessment.fall_risk_data,
      depression: !!assessment.depression_data,
      sleep: !!assessment.sleep_data,
      consent: !!assessment.consent_data
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching assessment status' })
  }
}

export const submitAssessmentTab = async (req, res) => {
  const userId = req.user.userId
  const { tab, data } = req.body

  if (!['adl', 'fall_risk', 'depression', 'sleep', 'consent'].includes(tab)) {
    return res.status(400).json({ message: 'Invalid tab' })
  }

  const columnMap = {
    adl: 'adl_data',
    fall_risk: 'fall_risk_data',
    depression: 'depression_data',
    sleep: 'sleep_data',
    consent: 'consent_data'
  }

  const column = columnMap[tab]
  const jsonData = JSON.stringify(data)

  try {
    const query = `
      INSERT INTO patient_assessments (user_id, ${column})
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE ${column} = VALUES(${column})
    `
    await queryDB(query, [userId, jsonData])
    res.status(200).json({ message: 'Assessment submitted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error submitting assessment' })
  }
}
