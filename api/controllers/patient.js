import { db } from '../connect.js'
import moment from "moment-timezone";
import { google } from "googleapis";
import { oauth2Client } from '../googleAuth.js';
import sendEmail from '../emailService.js';


function queryDB(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export const getAvailableExpertSlots = async (req, res) => {
  const { consultation_id, user_id, date } = req.body;

  if (!consultation_id || !user_id || !date) {
    return res.status(400).json({
      status: 400,
      message: "consultation_id, user_id and date are required",
    });
  }

  try {
    /** 1️⃣ Get timezone from users table */
    const timezoneQuery = `SELECT time_zone FROM dmac_webapp_users WHERE id = ? LIMIT 1`;
    const userResult = await new Promise((resolve, reject) => {
      db.query(timezoneQuery, [user_id], (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    if (!userResult.length || !userResult[0].time_zone) {
      return res.status(404).json({ status: 404, message: "User or timezone not found" });
    }

    const user_timezone = userResult[0].time_zone;

    /** 2️⃣ Convert selected date into UTC date range */
    const startOfDayUTC = moment.tz(date + " 00:00", user_timezone).utc().format("YYYY-MM-DD HH:mm:ss");
    const endOfDayUTC = moment.tz(date + " 23:59", user_timezone).utc().format("YYYY-MM-DD HH:mm:ss");

    /** 3️⃣ Get consultant slots for the selected date */
    const slotQuery = `
      SELECT id, start_time, end_time, is_booked
      FROM dmac_webapp_expert_availability
      WHERE consultant_id = ?
        AND start_time BETWEEN ? AND ?
      ORDER BY start_time ASC
    `;

    const slotRows = await new Promise((resolve, reject) => {
      db.query(slotQuery, [consultation_id, startOfDayUTC, endOfDayUTC], (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    /** 4️⃣ Convert slots back to user's timezone */
    const formattedSlots = slotRows.map(slot => ({
      slot_id: slot.id,
      is_booked: slot.is_booked,
      start: moment.utc(slot.start_time).tz(user_timezone).format("YYYY-MM-DD HH:mm"),
      end: moment.utc(slot.end_time).tz(user_timezone).format("YYYY-MM-DD HH:mm")
    }));

    return res.status(200).json({
      status: 200,
      consultation_id,
      date,
      timezone: user_timezone,
      slots: formattedSlots
    });

  } catch (error) {
    console.error("getAvailableSlots Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Unable to fetch available slots"
    });
  }
};

export const getTherapistListByLanguage = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
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
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_names
    FROM dmac_webapp_users t
    JOIN dmac_webapp_users u ON u.id = ?
    JOIN dmac_webapp_language lang ON FIND_IN_SET(lang.id, t.language)
    WHERE t.role = 'THERAPIST'
      AND FIND_IN_SET(u.language, t.language)
    GROUP BY t.id, t.name, t.email, t.country, t.province_title, t.role, t.time_zone;
  `;

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};


export const getExpertListByLanguage = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
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
        GROUP_CONCAT(lang.language ORDER BY lang.language SEPARATOR ', ') AS language_names
    FROM dmac_webapp_users t
    JOIN dmac_webapp_users u ON u.id = ?
    JOIN dmac_webapp_language lang ON FIND_IN_SET(lang.id, t.language)
    WHERE t.role = 'EXPERT'
      AND FIND_IN_SET(u.language, t.language)
    GROUP BY t.id, t.name, t.email, t.country, t.province_title, t.role, t.time_zone;
  `;

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const bookConsultationWithGoogleCalender = async (req, res) => {
  const useStatic = true;
  let consultant_id, user_id, user_timezone, consultant_timezone, date, start_time, product_id;

  if (useStatic) {
    consultant_id = 4;
    user_id = 22;
    user_timezone = "Asia/Kolkata";
    consultant_timezone = "America/Chicago";
    date = "2025-11-29";
    start_time = "16:30";
    product_id = 5;
  } else {
    ({ consultant_id, user_id, user_timezone, consultant_timezone, date, start_time, product_id } = req.body);
  }

  if (!consultant_id || !user_id || !user_timezone || !consultant_timezone || !date || !start_time) {
    return res.status(400).json({ status: 400, message: "Missing required booking fields" });
  }

  try {
    const userStartDatetime = `${date} ${start_time}`;
    const consultantStart = moment.tz(userStartDatetime, user_timezone).tz(consultant_timezone);
    const consultantEnd = consultantStart.clone().add(1, "hour");

    const eventStartISO = consultantStart.toISOString();
    const eventEndISO = consultantEnd.toISOString();

    /* 🔹 Fetch consultant email + tokens */
    const consultantQuery = `SELECT id, email, google_access_token, google_refresh_token, name FROM dmac_webapp_users WHERE id = ?`;
    const consultant = await new Promise((resolve, reject) => {
      db.query(consultantQuery, [consultant_id], (err, result) => (err ? reject(err) : resolve(result)));
    });
    if (consultant.length === 0) return res.status(404).json({ status: 404, message: "Consultant not found" });

    const { google_access_token, google_refresh_token, email: consultant_email, name: consultant_name } = consultant[0];

    /* 🔹 Fetch user info */
    const userQuery = `SELECT id, email, name, google_access_token as user_access_token, google_refresh_token as user_refresh_token FROM dmac_webapp_users WHERE id = ?`;
    const user = await new Promise((resolve, reject) => {
      db.query(userQuery, [user_id], (err, result) => (err ? reject(err) : resolve(result)));
    });
    if (user.length === 0) return res.status(404).json({ status: 404, message: "User not found" });

    const { email: user_email, name: user_name, user_access_token, user_refresh_token } = user[0];

    /* 🔹 Setup Google Calendar for CONSULTANT */
    oauth2Client.setCredentials({
      access_token: google_access_token,
      refresh_token: google_refresh_token
    });

    const consultantCalendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Check availability
    const freeBusy = await consultantCalendar.freebusy.query({
      requestBody: {
        timeMin: eventStartISO,
        timeMax: eventEndISO,
        items: [{ id: consultant_email }]
      }
    });

    if (freeBusy.data.calendars[consultant_email].busy.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Consultant already booked for this time slot"
      });
    }

    /* 🔹 Create Event (attendees: BOTH) */
    const event = {
      summary: "DMAC Consultation Meeting",
      description: "Online consultation for the DMAC",
      start: { dateTime: eventStartISO, timeZone: consultant_timezone },
      end: { dateTime: eventEndISO, timeZone: consultant_timezone },
      attendees: [{ email: consultant_email }, { email: user_email }],
      conferenceData: { createRequest: { requestId: Date.now().toString() } }
    };

    const eventResult = await consultantCalendar.events.insert({
      calendarId: consultant_email,
      conferenceDataVersion: 1,
      requestBody: event
    });

    const meetLink = eventResult.data.hangoutLink;

    /* 🔹 OPTIONAL: Add event to USER calendar only if they have Google token */
    if (user_access_token) {
      oauth2Client.setCredentials({
        access_token: user_access_token,
        refresh_token: user_refresh_token
      });

      const userCalendar = google.calendar({ version: "v3", auth: oauth2Client });

      await userCalendar.events.insert({
        calendarId: user_email,
        conferenceDataVersion: 1,
        requestBody: event
      });
    }

    /* 🔹 Save booking */
    const insertQuery = `
      INSERT INTO dmac_webapp_consultations 
      (product_id, user_id, consultant_id, event_start, event_end, meet_link, user_timezone, consultant_timezone, consultation_date, consultation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      db.query(insertQuery, [
        product_id, user_id, consultant_id,
        eventStartISO, eventEndISO,
        meetLink, user_timezone, consultant_timezone, date, 1
      ], (err, result) => (err ? reject(err) : resolve(result)));
    });

    /* 🔥 UPDATE SLOT AS BOOKED */
    const slotUpdateQuery = `
      UPDATE dmac_webapp_expert_availability
      SET is_booked = 1
      WHERE consultant_id = ? 
      AND slot_date = ? 
      AND start_time = ? 
      AND end_time = ?
    `;
    await new Promise((resolve, reject) => {
      db.query(
        slotUpdateQuery,
        [consultant_id, date, eventStartISO, eventEndISO],
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });

    /* 🔹 Email to USER & CONSULTANT */
    const emailSubject = "DMAC Consultation Booking Confirmed";

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultation has been booked successfully.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${moment(eventStartISO).tz(user_timezone).format("YYYY-MM-DD hh:mm A")}</p>
      <p><b>Meeting Link:</b> <a href="${meetLink}">${meetLink}</a></p>
    `;

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>A new consultation has been scheduled.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${consultantStart.format("YYYY-MM-DD hh:mm A")}</p>
      <p><b>Meeting Link:</b> <a href="${meetLink}">${meetLink}</a></p>
    `;

    await sendEmail(user_email, emailSubject, userHtml, userHtml);
    await sendEmail(consultant_email, emailSubject, consultantHtml, consultantHtml);

    return res.status(200).json({
      status: 200,
      booked: true,
      meetLink,
      consultant_view_time: consultantStart.format("YYYY-MM-DD hh:mm A"),
      user_view_time: moment(eventStartISO).tz(user_timezone).format("YYYY-MM-DD hh:mm A"),
      message: user_access_token
        ? "Booking created & added to both calendars"
        : "Booking created. User email sent (calendar not added due to missing Google token)"
    });

  } catch (error) {
    console.error("BOOKING ERROR:", error);
    return res.status(500).json({
      status: 500,
      booked: false,
      message: "Unable to create booking"
    });
  }
};



export const rescheduleConsultationWithGoogleCalendar = async (req, res) => {
    const useStatic = true;
    let consultation_id, date, start_time, user_timezone;

    if (useStatic) {
        consultation_id = 4;                // <-- dummy consultation ID
        date = "2025-11-29";                // <-- new date selected for reschedule
        start_time = "21:00";               // <-- new start time selected for reschedule
        user_timezone = "Asia/Kolkata";     // <-- user timezone
    } else {
        ({ consultation_id, date, start_time, user_timezone } = req.body);
    }

  if (!consultation_id || !date || !start_time || !user_timezone) {
    return res.status(400).json({
      status: 400,
      message: "Missing required fields"
    });
  }

  try {
    /* 🔹 Fetch existing consultation details */
    const existingQuery = `
      SELECT c.*, 
        u.email AS user_email, u.name AS user_name, u.google_access_token AS user_access_token, u.google_refresh_token AS user_refresh_token,
        con.email AS consultant_email, con.name AS consultant_name, con.google_access_token AS consultant_access, con.google_refresh_token AS consultant_refresh,
        c.consultant_timezone
      FROM dmac_webapp_consultations c
      JOIN dmac_webapp_users u ON c.user_id = u.id
      JOIN dmac_webapp_users con ON c.consultant_id = con.id
      WHERE c.id = ?`;
    const data = await new Promise((resolve, reject) =>
      db.query(existingQuery, [consultation_id], (err, result) => err ? reject(err) : resolve(result))
    );

    if (!data.length)
      return res.status(404).json({ status: 404, message: "Consultation not found" });

    const booking = data[0];

    const {
      meet_link,
      consultant_timezone,
      user_email,
      user_name,
      consultant_email,
      consultant_name,
      user_access_token,
      user_refresh_token,
      consultant_access,
      consultant_refresh,
    } = booking;

    /* 🔹 Convert user requested time to consultant TZ */
    const newUserStart = `${date} ${start_time}`;
    const consultantStart = moment.tz(newUserStart, user_timezone).tz(consultant_timezone);
    const consultantEnd = consultantStart.clone().add(1, "hour");

    const eventStartISO = consultantStart.toISOString();
    const eventEndISO = consultantEnd.toISOString();

    /* 🔹 Update event in CONSULTANT Google Calendar */
    oauth2Client.setCredentials({
      access_token: consultant_access,
      refresh_token: consultant_refresh
    });
    const consultantCalendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Fetch event by Meet link
    const list = await consultantCalendar.events.list({
      calendarId: consultant_email,
      q: meet_link
    });

    if (!list.data.items.length)
      return res.status(404).json({ status: 404, message: "Event not found in consultant Google Calendar" });

    const eventId = list.data.items[0].id;

    await consultantCalendar.events.patch({
      calendarId: consultant_email,
      eventId,
      conferenceDataVersion: 1,
      requestBody: {
        start: { dateTime: eventStartISO, timeZone: consultant_timezone },
        end: { dateTime: eventEndISO, timeZone: consultant_timezone }
      }
    });

    /* 🔹 OPTIONAL: Update event in USER Google Calendar */
    if (user_access_token) {
      oauth2Client.setCredentials({
        access_token: user_access_token,
        refresh_token: user_refresh_token
      });

      const userCalendar = google.calendar({ version: "v3", auth: oauth2Client });

      const userEventList = await userCalendar.events.list({
        calendarId: user_email,
        q: meet_link
      });

      if (userEventList.data.items.length > 0) {
        const userEventID = userEventList.data.items[0].id;
        await userCalendar.events.patch({
          calendarId: user_email,
          eventId: userEventID,
          conferenceDataVersion: 1,
          requestBody: {
            start: { dateTime: eventStartISO, timeZone: consultant_timezone },
            end: { dateTime: eventEndISO, timeZone: consultant_timezone }
          }
        });
      }
    }

    /* 🔹 Update DB */
    const updateQuery = `
      UPDATE dmac_webapp_consultations
      SET event_start = ?, event_end = ?, consultation_date = ?, status = ?
      WHERE id = ?
    `;
    await new Promise((resolve, reject) =>
      db.query(updateQuery, [eventStartISO, eventEndISO, date, 6, consultation_id],
        (err, result) => err ? reject(err) : resolve(result))
    );

    /* 🔹 Send Email */
    const subject = "DMAC Consultation Rescheduled";

    const userHtml = `
      <p>Dear ${user_name},</p>
      <h3>Your consultation has been rescheduled successfully.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${moment(eventStartISO).tz(user_timezone).format("YYYY-MM-DD hh:mm A")}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `;

    const consultantHtml = `
      <p>Dear ${consultant_name},</p>
      <h3>A consultation has been rescheduled.</h3>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${consultantStart.format("YYYY-MM-DD hh:mm A")}</p>
      <p><b>Meeting Link:</b> <a href="${meet_link}">${meet_link}</a></p>
    `;

    await sendEmail(user_email, subject, userHtml, userHtml);
    await sendEmail(consultant_email, subject, consultantHtml, consultantHtml);

    return res.status(200).json({
      status: 200,
      rescheduled: true,
      meetLink: meet_link,
      user_view_time: moment(eventStartISO).tz(user_timezone).format("YYYY-MM-DD hh:mm A"),
      consultant_view_time: consultantStart.format("YYYY-MM-DD hh:mm A"),
      message: user_access_token
        ? "Reschedule updated in both calendars and emails sent"
        : "Reschedule updated in consultant calendar only. User notified via email"
    });

  } catch (error) {
    console.error("RESCHEDULE ERROR:", error);
    return res.status(500).json({
      status: 500,
      rescheduled: false,
      message: "Unable to reschedule consultation"
    });
  }
};

export const cancelConsultationByConsultant = async (req, res) => {
  let consultation_id;

  // For development — static testing data
  const useStatic = true;
  if (useStatic) {
    consultation_id = 7; // existing consultation id
  } else {
    consultation_id = req.body.consultation_id;
  }

  if (!consultation_id) {
    return res.status(400).json({ status: 400, message: "consultation_id is required" });
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
    `;
    const result = await queryDB(fetchQuery, [consultation_id]);
    if (!result.length) {
      return res.status(404).json({ status: 404, message: "Consultation not found" });
    }

    const booking = result[0];
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
    } = booking;

    if (!consultant_email || !consultant_access_token) {
      return res.status(500).json({ status: 500, message: "Consultant calendar not configured" });
    }

    // 2) Cancel consultant event if exists
    oauth2Client.setCredentials({
      access_token: consultant_access_token,
      refresh_token: consultant_refresh_token
    });
    const consultantCalendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (consultant_event_id) {
      await consultantCalendar.events.delete({
        calendarId: consultant_email,
        eventId: consultant_event_id
      }).catch(() => {}); // Ignore if already deleted
    }

    // 3) Cancel user event if user has tokens
    let userEventCancelled = false;
    if (user_email && user_access_token) {
      const userOAuth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      userOAuth.setCredentials({
        access_token: user_access_token,
        refresh_token: user_refresh_token
      });
      const userCalendar = google.calendar({ version: "v3", auth: userOAuth });

      // Find the user's event by meet link
      if (meet_link) {
        const userList = await userCalendar.events.list({
          calendarId: user_email,
          q: meet_link,
          maxResults: 5
        });
        if (userList?.data?.items?.length) {
          const userEventId = userList.data.items[0].id;
          await userCalendar.events.delete({
            calendarId: user_email,
            eventId: userEventId
          }).catch(() => {});
          userEventCancelled = true;
        }
      }
    }

    // 4) Update DB
    const updateQuery = `
      UPDATE dmac_webapp_consultations
      SET status = 5, event_start = NULL, event_end = NULL
      WHERE id = ?
    `;
    await queryDB(updateQuery, [consultation_id]);

    // 5) Email notifications
    const subject = "DMAC Consultation Cancelled";

    const userHtml = `
      <p>Dear ${user_name || "User"},</p>
      <h3>Your consultation has been cancelled by the consultant.</h3>
      <p><b>Google Meet Link:</b> <strike>${meet_link}</strike></p>
      <p>Please re-book a new slot.</p>
    `;

    const consultantHtml = `
      <p>Dear ${consultant_name || "Consultant"},</p>
      <h3>You have cancelled the consultation.</h3>
      <p><b>Google Meet Link:</b> <strike>${meet_link}</strike></p>
    `;

    if (user_email) await sendEmail(user_email, subject, userHtml, userHtml);
    if (consultant_email) await sendEmail(consultant_email, subject, consultantHtml, consultantHtml);

    return res.status(200).json({
      status: 200,
      cancelled: true,
      user_calendar_cancelled: userEventCancelled,
      message: user_access_token
        ? "Event cancelled from both calendars (if available). Emails sent."
        : "Event cancelled from consultant calendar. User notified by email."
    });

  } catch (err) {
    console.error("CANCEL ERROR:", err);
    return res.status(500).json({
      status: 500,
      cancelled: false,
      error: err.message
    });
  }
};