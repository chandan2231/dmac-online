import express from 'express'
import {
  getModules,
  startSession,
  submitSession
} from '../controllers/modules.js'

const router = express.Router()

router.get('/', getModules)
router.post('/:moduleId/session/start', startSession)
router.post('/:moduleId/session/:sessionId/submit', submitSession)

export default router

