import express from 'express'
import {
  addExpertReview,
  getExpertReview,
  addTherapistReview,
  getTherapistReview,
  getExpertReviews,
  getTherapistReviews
} from '../controllers/reviews.js'

const router = express.Router()

router.post('/expert', addExpertReview)
router.get('/expert/:consultationId', getExpertReview)
router.get('/expert/list/:expertId', getExpertReviews)
router.post('/therapist', addTherapistReview)
router.get('/therapist/:consultationId', getTherapistReview)
router.get('/therapist/list/:therapistId', getTherapistReviews)

export default router
