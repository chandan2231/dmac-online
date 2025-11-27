import express from 'express'
import { 
    googleAuthUrl, 
    googleCallbackUrl, 
    bookConsultationWithGoogleCalender,
    rescheduleConsultationWithGoogleCalendar,
    cancelConsultationByConsultant
} from '../controllers/googleAuth.js'
import { authenticateUserGoogle } from '../utils/middleware.js'

const router = express.Router()

router.get('/url', authenticateUserGoogle, googleAuthUrl)
router.get('/auth/callback', googleCallbackUrl)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post('/reschedule/consultation', rescheduleConsultationWithGoogleCalendar)
router.post('/cancel/consultation', cancelConsultationByConsultant)

export default router
