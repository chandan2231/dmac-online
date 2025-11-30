import express from 'express'
import {
    getTherapistListByLanguage,
    getExpertListByLanguage,
    getAvailableExpertSlots,
    bookConsultationWithGoogleCalender,
    rescheduleConsultationWithGoogleCalendar,
    cancelConsultationByConsultant,
    
} from '../controllers/patient.js'

const router = express.Router()

router.post('/therapist-list', getTherapistListByLanguage)
router.post('/expert-list', getExpertListByLanguage)
router.post('/get/slot', getAvailableExpertSlots)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post('/reschedule/consultation', rescheduleConsultationWithGoogleCalendar)
router.post('/cancel/consultation', cancelConsultationByConsultant)


export default router


