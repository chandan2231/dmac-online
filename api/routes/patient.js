import express from 'express'
import {
    getTherapistListByLanguage,
    getExpertListByLanguage,
    bookConsultationWithGoogleCalender,
    rescheduleConsultationWithGoogleCalendar,
    cancelConsultationByConsultant,
    getAvailableSlots
} from '../controllers/patient.js'

const router = express.Router()

router.post('/therapist-list', getTherapistListByLanguage)
router.post('/expert-list', getExpertListByLanguage)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post('/reschedule/consultation', rescheduleConsultationWithGoogleCalendar)
router.post('/cancel/consultation', cancelConsultationByConsultant)
router.post('/get/slot', getAvailableSlots)

export default router


