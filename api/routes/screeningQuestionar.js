import express from 'express'
import { saveQuestionnaireAnswer } from '../controllers/questionar.js'

const router = express.Router()

// Save questionnaire answers without bearer auth for screening flow.
router.post('/answer', saveQuestionnaireAnswer)

export default router
