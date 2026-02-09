import express from 'express'
import {
  saveTherapistAvailability,
  getTherapistAvailability,
  getAvailableSlots,
  toggleDayOff,
  updateDaySlots,
  getConsultationList,
  updateConsultationStatus,
  rescheduleTherapistConsultation,
  getTherapistPatients,
  getPatientDocuments,
  getPatientAssessmentStatus,
  getPatientMedicalHistory
} from '../controllers/therapist.js'

import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/save/slot', authenticateUser, saveTherapistAvailability)
router.post('/get/slots', authenticateUser, getTherapistAvailability)
router.post('/get/slot', authenticateUser, getAvailableSlots)
router.post('/toggle-day-off', authenticateUser, toggleDayOff)
router.post('/update-day-slots', authenticateUser, updateDaySlots)
router.post('/consultation-list', authenticateUser, getConsultationList)
router.post('/update-status', authenticateUser, updateConsultationStatus)
router.post('/reschedule', authenticateUser, rescheduleTherapistConsultation)
router.post('/patients', authenticateUser, getTherapistPatients)
router.post('/patient-documents', authenticateUser, getPatientDocuments)
router.post(
  '/patient-assessment-status',
  authenticateUser,
  getPatientAssessmentStatus
)

router.post(
  '/patient-medical-history',
  authenticateUser,
  getPatientMedicalHistory
)

export default router
