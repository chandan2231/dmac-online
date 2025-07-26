import express from 'express'
import { getExternalMonitorProtocolList } from '../controllers/externalMonitor.js'
import { authenticateUser } from '../utils/middleware.js'
const router = express.Router()

router.post('/protocol/list', authenticateUser, getExternalMonitorProtocolList)

export default router
