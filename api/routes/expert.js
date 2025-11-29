import express from 'express'
import {
  saveExpertAvailability,
  getExpertAvailability,
  getAvailableSlots,
  toggleDayOff
} from '../controllers/expert.js'

const router = express.Router()

router.post('/save/slot', saveExpertAvailability)
router.post('/get/slots', getExpertAvailability)
router.post('/get/slot', getAvailableSlots)
router.post('/toggle-day-off', toggleDayOff)

export default router
