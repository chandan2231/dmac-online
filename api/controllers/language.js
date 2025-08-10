import { db } from '../connect.js'

<<<<<<< HEAD

export const getLanguageList = (req, res) => {
  const que = 'SELECT * FROM dmac_webapp_language WHERE status=?'
=======
export const getLanguageList = (req, res) => {
  const que = 'SELECT id, language FROM dmac_webapp_language WHERE status=?'
>>>>>>> 90b7cbff7a445384c05e38d5ac9f70cf8c6ab5ea
  db.query(que, [1], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
<<<<<<< HEAD
}
=======
}
>>>>>>> 90b7cbff7a445384c05e38d5ac9f70cf8c6ab5ea
