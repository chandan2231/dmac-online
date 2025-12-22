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
  deleteUserDocument,
  getAssessmentStatus,
  submitAssessmentTab,
  getLatestMedicalHistory,
  submitMedicalHistory
} from '../controllers/patient.js'

const router = express.Router()

console.log('Setting up Patient routes', authenticateUser)

router.post(
  '/upload-document',
  authenticateUser,
  upload.single('file'),
  uploadDocument
)
router.get('/documents', authenticateUser, getUserDocuments)
router.delete('/documents/:id', authenticateUser, deleteUserDocument)
router.get('/assessment-status', authenticateUser, getAssessmentStatus)
router.post('/assessment-submit', authenticateUser, submitAssessmentTab)

router.get('/medical-history/latest', authenticateUser, getLatestMedicalHistory)
router.post('/medical-history', authenticateUser, submitMedicalHistory)
router.post('/therapist-list', authenticateUser, getTherapistListByLanguage)
router.post('/expert-list', authenticateUser, getExpertListByLanguage)
router.post('/expert-slot', authenticateUser, getAvailableExpertSlots)
router.post(
  '/book/consultation',
  authenticateUser,
  bookConsultationWithGoogleCalender
)
router.post('/consultation-list', authenticateUser, getConsultationList)
router.post(
  '/therapist-consultation-list',
  authenticateUser,
  getTherapistConsultationList
)
router.post(
  '/reschedule/consultation',
  authenticateUser,
  rescheduleConsultationWithGoogleCalendar
)
router.post(
  '/reschedule/therapist-consultation',
  authenticateUser,
  rescheduleTherapistConsultation
)
router.post(
  '/cancel/consultation',
  authenticateUser,
  cancelConsultationByConsultant
)
router.post('/therapist-slot', authenticateUser, getAvailableTherapistSlots)
router.post(
  '/book/therapist-consultation',
  authenticateUser,
  bookTherapistConsultation
)
router.post('/profile', authenticateUser, getProfile)
router.post('/profile/update', authenticateUser, updateProfile)

export default router
