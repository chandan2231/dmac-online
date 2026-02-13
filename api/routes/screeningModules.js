import express from 'express'
import {
  getModules,
  startSession,
  submitSession,
  getAttemptStatus,
  abandonInProgressSessions,
  getUserReport,
  generateReportPdf,
  registerScreeningUser,
  verifyScreeningEmail
} from '../controllers/screeningModules.js'

const router = express.Router()

// No auth middleware for screening.
router.get('/', getModules)
router.get('/attempts', getAttemptStatus)
router.post('/attempts/abandon', abandonInProgressSessions)
router.post('/report', getUserReport)
router.post('/report/pdf', generateReportPdf)

router.post('/register', registerScreeningUser)
router.post('/verify-email', verifyScreeningEmail)

router.post('/:moduleId/session/start', startSession)
router.post('/:moduleId/session/:sessionId/submit', submitSession)

export default router
