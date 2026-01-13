import express from 'express'
import {
  getModules,
  startSession,
  submitSession,
  getAttemptStatus
} from '../controllers/modules.js'

import { authenticateUserWithBearer } from '../utils/middleware.js'

const router = express.Router()

router.get('/', authenticateUserWithBearer, getModules)
router.get('/attempts', authenticateUserWithBearer, getAttemptStatus)
router.post('/:moduleId/session/start', authenticateUserWithBearer, startSession)
router.post('/:moduleId/session/:sessionId/submit', authenticateUserWithBearer, submitSession)

export default router

