import { db } from '../connect.js'

export const getLanguageList = (req, res) => {
  const que = 'SELECT id, language FROM dmac_webapp_language WHERE status=?'
  db.query(que, [1], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

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
