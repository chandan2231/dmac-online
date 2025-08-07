import { db } from '../connect.js'


export const getLanguageList = (req, res) => {
  const que = 'SELECT * FROM dmac_webapp_language WHERE status=?'
  db.query(que, [1], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}