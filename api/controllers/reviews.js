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

export const getExpertReviews = (req, res) => {
  const expertId = req.params.expertId
  const q = `
    SELECT r.*, u.name as patient_name 
    FROM expert_reviews r
    JOIN dmac_webapp_users u ON r.patient_id = u.id
    WHERE r.expert_id = ?
    ORDER BY r.created_at DESC
  `

  db.query(q, [expertId], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}

export const getTherapistReviews = (req, res) => {
  const therapistId = req.params.therapistId
  const q = `
    SELECT r.*, u.name as patient_name 
    FROM therapist_reviews r
    JOIN dmac_webapp_users u ON r.patient_id = u.id
    WHERE r.therapist_id = ?
    ORDER BY r.created_at DESC
  `

  db.query(q, [therapistId], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}
