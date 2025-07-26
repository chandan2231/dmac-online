import express from 'express'
import { authenticateUser, upload } from '../utils/middleware.js'
import {
  saveFile,
  continueinReviewGeneratePdf,
  protocolGeneratePdf,
  getProtocolList,
  createProtocol,
  getApprovedProtocolCheck,
  getApprovedProtocolList,
  checkMultisiteProtocolExist,
  multiSiteChildProtocolsList,
  createExternalMonitor,
  getExternalMonitorList,
  createCRC,
  getCRCList,
  getCTMProtocolsReport
} from '../controllers/protocol.js'

const router = express.Router()
router.post(
  '/multiSiteChildProtocolsList',
  authenticateUser,
  multiSiteChildProtocolsList
)
router.post(
  '/checkMultisiteProtocolExist',
  authenticateUser,
  checkMultisiteProtocolExist
)
router.post('/approvedListCheck', authenticateUser, getApprovedProtocolCheck)
router.post('/approved/list', authenticateUser, getApprovedProtocolList)
router.post('/list', authenticateUser, getProtocolList)
router.post('/create', authenticateUser, createProtocol)
router.post('/upload/file', authenticateUser, upload.single('file'), saveFile)
router.post(
  '/continuein/generate/pdf',
  authenticateUser,
  continueinReviewGeneratePdf
)
router.post('/protocol/generate/pdf', authenticateUser, protocolGeneratePdf)
router.post('/createExternalMonitor', authenticateUser, createExternalMonitor)
router.post('/external/monitor/list', authenticateUser, getExternalMonitorList)
router.post('/createCRC', authenticateUser, createCRC)
router.post('/crc/list', authenticateUser, getCRCList)
router.post('/getCTMProtocolsReport', authenticateUser, getCTMProtocolsReport)

export default router
