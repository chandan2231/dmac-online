import express from 'express'
import { 
    saveTherapistAvailability,
    getTherapistAvailability,
    getAvailableSlots
} from '../controllers/therapist.js'

const router = express.Router()

router.post('/save/slot', saveTherapistAvailability)
router.post('/get/slots', getTherapistAvailability)
router.post('/get/slot', getAvailableSlots)

export default router
