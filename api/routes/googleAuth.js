import express from 'express'
import { 
    googleAuthUrl, 
    googleCallbackUrl, 
    bookConsultationWithGoogleCalender,
    rescheduleConsultationWithGoogleCalendar,
    cancelConsultationByConsultant,
    saveConsultantAvailability,
    getAvailableSlots
} from '../controllers/googleAuth.js'
import { authenticateUserGoogle } from '../utils/middleware.js'

const router = express.Router()

router.get('/url', authenticateUserGoogle, googleAuthUrl)
router.get('/auth/callback', googleCallbackUrl)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post('/reschedule/consultation', rescheduleConsultationWithGoogleCalendar)
router.post('/cancel/consultation', cancelConsultationByConsultant)
router.post('/save/slot', saveConsultantAvailability)
router.post('/get/slot', getAvailableSlots)

export default router
