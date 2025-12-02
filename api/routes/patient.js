import express from 'express'
import { authenticateUser, upload } from '../utils/middleware.js'
import {
  getTherapistListByLanguage,
  getExpertListByLanguage,
  getAvailableExpertSlots,
  bookConsultationWithGoogleCalender,
  rescheduleConsultationWithGoogleCalendar,
  cancelConsultationByConsultant,
  getAvailableTherapistSlots,
  bookTherapistConsultation,
  getConsultationList,
  getTherapistConsultationList,
  rescheduleTherapistConsultation,
  getProfile,
  updateProfile,
  uploadDocument,
  getUserDocuments,
  deleteUserDocument
} from '../controllers/patient.js'

const router = express.Router()

router.post(
  '/upload-document',
  authenticateUser,
  upload.single('file'),
  uploadDocument
)
router.get('/documents', authenticateUser, getUserDocuments)
router.delete('/documents/:id', authenticateUser, deleteUserDocument)

router.post('/therapist-list', getTherapistListByLanguage)
router.post('/expert-list', getExpertListByLanguage)
router.post('/expert-slot', getAvailableExpertSlots)
router.post('/book/consultation', bookConsultationWithGoogleCalender)
router.post('/consultation-list', getConsultationList)
router.post('/therapist-consultation-list', getTherapistConsultationList)
router.post(
  '/reschedule/consultation',
  rescheduleConsultationWithGoogleCalendar
)
router.post(
  '/reschedule/therapist-consultation',
  rescheduleTherapistConsultation
)
router.post('/cancel/consultation', cancelConsultationByConsultant)
router.post('/therapist-slot', getAvailableTherapistSlots)
router.post('/book/therapist-consultation', bookTherapistConsultation)
router.post('/profile', getProfile)
router.post('/profile/update', updateProfile)

export default router
