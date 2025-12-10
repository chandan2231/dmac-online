import express from 'express'
import {
  addExpertReview,
  getExpertReview,
  addTherapistReview,
  getTherapistReview,
  getExpertReviews,
  getTherapistReviews
} from '../controllers/reviews.js'

import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/expert', authenticateUser, addExpertReview)
router.get('/expert/:consultationId', authenticateUser, getExpertReview)
router.get('/expert/list/:expertId', authenticateUser, getExpertReviews)
router.post('/therapist', authenticateUser, addTherapistReview)
router.get('/therapist/:consultationId', authenticateUser, getTherapistReview)
router.get('/therapist/list/:therapistId', authenticateUser, getTherapistReviews)

export default router
