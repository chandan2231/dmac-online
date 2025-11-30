import express from 'express'
import {
  saveExpertAvailability,
  getExpertAvailability,
  getAvailableSlots,
  toggleDayOff,
  updateDaySlots,
  getExpertConsultations
} from '../controllers/expert.js'

const router = express.Router()

router.post('/save/slot', saveExpertAvailability)
router.post('/get/slots', getExpertAvailability)
router.post('/get/slot', getAvailableSlots)
router.post('/toggle-day-off', toggleDayOff)
router.post('/update-day-slots', updateDaySlots)
router.post('/get/consultations', getExpertConsultations)

export default router
