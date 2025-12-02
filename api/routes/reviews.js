import express from 'express'
import {
  addExpertReview,
  getExpertReview,
  addTherapistReview,
  getTherapistReview
} from '../controllers/reviews.js'

const router = express.Router()

router.post('/expert', addExpertReview)
router.get('/expert/:consultationId', getExpertReview)
router.post('/therapist', addTherapistReview)
router.get('/therapist/:consultationId', getTherapistReview)

export default router
