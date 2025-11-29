import express from 'express'
import { 
    saveExpertAvailability,
    getExpertAvailability,
    getAvailableSlots
} from '../controllers/expert.js'

const router = express.Router()

router.post('/save/slot', saveExpertAvailability)
router.post('/get/slots', getExpertAvailability)
router.post('/get/slot', getAvailableSlots)

export default router
