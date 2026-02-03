import express from 'express'
import { authenticateUser } from '../utils/middleware.js'
import {
  createPartner,
  getPartnersList,
  changePartnerStatus,
  updatePartner,
  changePartnerPassword,
  addMorePartnerUsers,
  getPartnerAddedUsersHistory
} from '../controllers/partner.js'

const router = express.Router()

router.post('/list', authenticateUser, getPartnersList)
router.post('/create', authenticateUser, createPartner)
router.post('/status/change', authenticateUser, changePartnerStatus)
router.post('/update', authenticateUser, updatePartner)
router.post('/password/change', authenticateUser, changePartnerPassword)
router.post('/allowed-users/add', authenticateUser, addMorePartnerUsers)
router.post('/allowed-users/history', authenticateUser, getPartnerAddedUsersHistory)

export default router
