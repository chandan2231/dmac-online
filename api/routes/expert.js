import express from 'express'
import {
  saveExpertAvailability,
  getExpertAvailability,
  getAvailableSlots,
  toggleDayOff,
  updateDaySlots,
  getExpertConsultations,
  updateConsultationStatus,
  rescheduleConsultation,
  getExpertPatients,
  getPatientDocuments
} from '../controllers/expert.js'

import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/save/slot', authenticateUser, saveExpertAvailability)
router.post('/get/slots', authenticateUser, getExpertAvailability)
router.post('/get/slot', authenticateUser, getAvailableSlots)
router.post('/toggle-day-off', authenticateUser, toggleDayOff)
router.post('/update-day-slots', authenticateUser, updateDaySlots)
router.post('/get/consultations', authenticateUser, getExpertConsultations)
router.post('/update-status', authenticateUser, updateConsultationStatus)
router.post('/reschedule', authenticateUser, rescheduleConsultation)
router.post('/patients', authenticateUser, getExpertPatients)
router.post('/patient-documents', authenticateUser, getPatientDocuments)

export default router
