import express from 'express'
import {
  getModules,
  startSession,
  submitSession
} from '../controllers/modules.js'

import { authenticateUserWithBearer } from '../utils/middleware.js'

const router = express.Router()

router.get('/', authenticateUserWithBearer, getModules)
router.post('/:moduleId/session/start', authenticateUserWithBearer, startSession)
router.post('/:moduleId/session/:sessionId/submit', authenticateUserWithBearer, submitSession)

export default router

