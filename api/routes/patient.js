import express from 'express'
import {
  authenticateUser,
  authenticateUserWithBearer,
  upload
} from '../utils/middleware.js'
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
  deleteUserDocument,
  getAssessmentStatus,
  submitAssessmentTab
} from '../controllers/patient.js'

const router = express.Router()

router.post(
  '/upload-document',
  authenticateUserWithBearer,
  upload.single('file'),
  uploadDocument
)
router.get('/documents', authenticateUserWithBearer, getUserDocuments)
router.delete('/documents/:id', authenticateUserWithBearer, deleteUserDocument)

router.get(
  '/assessment-status',
  authenticateUserWithBearer,
  getAssessmentStatus
)
router.post(
  '/assessment-submit',
  authenticateUserWithBearer,
  submitAssessmentTab
)

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
