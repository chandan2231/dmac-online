import { db } from '../connect.js'

export const addExpertReview = (req, res) => {
  const { patient_id, expert_id, consultation_id, rating, review } = req.body

  const q =
    'INSERT INTO expert_reviews (`patient_id`, `expert_id`, `consultation_id`, `rating`, `review`) VALUES (?)'
  const values = [patient_id, expert_id, consultation_id, rating, review]

  db.query(q, [values], (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json('Review already exists for this consultation.')
      }
      return res.status(500).json(err)
    }
    return res.status(200).json('Review has been created.')
  })
}

export const getExpertReview = (req, res) => {
  const consultationId = req.params.consultationId
  const q = 'SELECT * FROM expert_reviews WHERE consultation_id = ?'

  db.query(q, [consultationId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length === 0) return res.status(404).json('Review not found')
    return res.status(200).json(data[0])
  })
}

export const addTherapistReview = (req, res) => {
  const { patient_id, therapist_id, consultation_id, rating, review } = req.body

  const q =
    'INSERT INTO therapist_reviews (`patient_id`, `therapist_id`, `consultation_id`, `rating`, `review`) VALUES (?)'
  const values = [patient_id, therapist_id, consultation_id, rating, review]

  db.query(q, [values], (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json('Review already exists for this consultation.')
      }
      return res.status(500).json(err)
    }
    return res.status(200).json('Review has been created.')
  })
}

export const getTherapistReview = (req, res) => {
  const consultationId = req.params.consultationId
  const q = 'SELECT * FROM therapist_reviews WHERE consultation_id = ?'

  db.query(q, [consultationId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length === 0) return res.status(404).json('Review not found')
    return res.status(200).json(data[0])
  })
}
