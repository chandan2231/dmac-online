import express from 'express'
import {
  getTherapistListByLanguage,
  getExpertListByLanguage
} from '../controllers/patient.js'

const router = express.Router()

router.post('/therapist-list', getTherapistListByLanguage)
router.post('/expert-list', getExpertListByLanguage)

export default router
