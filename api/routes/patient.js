import express from 'express'
import {
  getTherapistListByLanguage,
  getExpertListByLanguage,
  getAvailableExpertSlots,
  bookConsultationWithGoogleCalender,
  rescheduleConsultationWithGoogleCalendar,
  cancelConsultationByConsultant,
  getAvailableTherapistSlots,
  bookTherapistConsultation
} from '../controllers/patient.js'

const router = express.Router()

router.post('/therapist-list', getTherapistListByLanguage)
router.post('/expert-list', getExpertListByLanguage)
router.post('/expert-slot', getAvailableExpertSlots)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post(
  '/reschedule/consultation',
  rescheduleConsultationWithGoogleCalendar
)
router.post('/cancel/consultation', cancelConsultationByConsultant)
router.post('/therapist-slot', getAvailableTherapistSlots)
router.post('/book/therapist-consultation', bookTherapistConsultation)

export default router
