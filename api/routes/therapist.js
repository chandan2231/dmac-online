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
  getPatientDocuments
} from '../controllers/therapist.js'

const router = express.Router()

router.post('/save/slot', saveTherapistAvailability)
router.post('/get/slots', getTherapistAvailability)
router.post('/get/slot', getAvailableSlots)
router.post('/toggle-day-off', toggleDayOff)
router.post('/update-day-slots', updateDaySlots)
router.post('/consultation-list', getConsultationList)
router.post('/update-status', updateConsultationStatus)
router.post('/reschedule', rescheduleTherapistConsultation)
router.post('/patients', getTherapistPatients)
router.post('/patient-documents', getPatientDocuments)

export default router
