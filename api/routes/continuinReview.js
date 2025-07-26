import express from 'express'
import {
  saveRiskAssessment,
  saveInformedConsent,
  saveInvestigatorAndinstuation,
  saveResearchProcess
} from '../controllers/continuinReview.js'
import { authenticateUser } from '../utils/middleware.js'
const router = express.Router()

router.post('/riskAssessmentSave', authenticateUser, saveRiskAssessment)
router.post('/informedConsentSave', authenticateUser, saveInformedConsent)
router.post(
  '/investigatorAndinstuationSave',
  authenticateUser,
  saveInvestigatorAndinstuation
)
router.post('/researchProcessSave', authenticateUser, saveResearchProcess)

export default router
