import { db } from '../connect.js'

export const getLanguageList = (req, res) => {
  const { patient_show, therapist_show, expert_show } = req.body;

  // Determine which filter column is passed
  let filterColumn = null;
  if (patient_show !== undefined) filterColumn = "patient_show";
  if (therapist_show !== undefined) filterColumn = "therapist_show";
  if (expert_show !== undefined) filterColumn = "expert_show";

  if (!filterColumn) {
    return res.status(400).json({
      status: 400,
      message: "Invalid request. Provide patient_show OR therapist_show OR expert_show"
    });
  }

  const query = `
    SELECT id, language, code 
    FROM dmac_webapp_language 
    WHERE status = 1 AND ${filterColumn} = 1
  `;

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json({
      status: 200,
      languages: data
    });
  });
};


export const updateLanguage = (req, res) => {
  const que = 'UPDATE dmac_webapp_users SET language=? WHERE id=?'
  db.query(que, [req.body.language, req.body.id], (err, data) => {
    if (err) {
      return res.status(500).json(err)
    } else {
      let result = {}
      result.status = 200
      result.msg = 'Language Changed Successfully'
      return res.json(result)
    }
  })
}
