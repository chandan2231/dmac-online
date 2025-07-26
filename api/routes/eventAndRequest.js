import express from 'express'
import {
  saveStudyCloseoutRequest,
  saveProtocolAmendmentRequest,
  savePromptlyReportableEvent,
  saveAdverseEvent,
  fetchEventAndRequestById
} from '../controllers/eventAndRequest.js'
import { authenticateUser } from '../utils/middleware.js'
const router = express.Router()

router.post(
  '/createStudyCloseoutRequest',
  authenticateUser,
  saveStudyCloseoutRequest
)
router.post(
  '/createPromptlyReportableEvent',
  authenticateUser,
  savePromptlyReportableEvent
)
router.post(
  '/createProtocolAmendmentRequest',
  authenticateUser,
  saveProtocolAmendmentRequest
)
router.post('/createAdverseEvent', authenticateUser, saveAdverseEvent)
router.post(
  '/fetchEventAndRequestById',
  authenticateUser,
  fetchEventAndRequestById
)

export default router
