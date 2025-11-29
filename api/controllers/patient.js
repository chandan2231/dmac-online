import { db } from '../connect.js'

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