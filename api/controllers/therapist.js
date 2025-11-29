import { db } from '../connect.js'
import moment from "moment-timezone";
import sendEmail from '../emailService.js';


export const saveTherapistAvailability = async (req, res) => {
  const { startDate, endDate, availability, userId } = req.body;

  if (!startDate || !endDate || !availability || !userId) {
    return res.status(400).json({ status: 400, message: "Missing required fields" });
  }

  try {
    const values = [];

    availability.forEach(day => {
      day.slots.forEach(slot => {
          const hour = slot.hour.toString().padStart(2, "0");
          const startTime = `${hour}:00:00`;
          const endHour = (slot.hour + 1).toString().padStart(2, "0");
          const endTime = `${endHour}:00:00`;
          const unavailableSlot = Number(slot.available)
          values.push([userId, day.date, startTime, endTime, unavailableSlot, 0, 1]);
      });
    });

    if (!values.length) {
      return res.status(400).json({ status: 400, message: "No available slots selected" });
    }

    const query = `
      INSERT INTO dmac_webapp_expert_availability
      (consultant_id, slot_date, start_time, end_time, is_slot_available, is_booked, is_day_off)
      VALUES ?
    `;

    db.query(query, [values], (err) => {
      if (err) throw err;
      return res.status(200).json({ status: 200, message: "Availability saved successfully" });
    });

  } catch (error) {
    console.error("SAVE ERROR:", error);
    return res.status(500).json({ status: 500, message: "Unable to save availability" });
  }
};

export const getTherapistAvailability = (req, res) => {
  const { consultant_id } = req.body;

  if (!consultant_id) {
    return res.status(400).json({ status: 400, message: "Consultant ID is required" });
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
  `;

  db.query(query, [consultant_id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (!rows.length) {
      return res.status(200).json({ status: 200, message: "No slots found", slots: [] });
    }

    // Grouped result
    const groupedResult = {};

    rows.forEach(slot => {
      if (!groupedResult[slot.slot_date]) {
        groupedResult[slot.slot_date] = [];
      }

      groupedResult[slot.slot_date].push({
        start_time: slot.start_time,
        end_time: slot.end_time,
        available: slot.is_slot_available,
        booked: slot.is_booked,
        day_off: slot.is_day_off
      });
    });

    return res.status(200).json({
      status: 200,
      message: "Availability fetched successfully",
      consultant_id,
      slots: groupedResult
    });
  });
};

export const getAvailableSlots = async (req, res) => {
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


