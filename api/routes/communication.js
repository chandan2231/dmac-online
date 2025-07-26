import express from 'express'
import {
  saveEnquiryRequest,
  getCommunicationListByProtocolId,
  downloadCommunicationPdf
} from '../controllers/communication.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/saveEnquiry', authenticateUser, saveEnquiryRequest)
router.post(
  '/getCommunicationListByProtocolId',
  authenticateUser,
  getCommunicationListByProtocolId
)
router.post(
  '/downloadCommunicationPdf',
  authenticateUser,
  downloadCommunicationPdf
)

export default router
