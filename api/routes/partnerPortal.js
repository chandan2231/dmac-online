import express from 'express'
import { authenticateUser } from '../utils/middleware.js'
import {
  getPartnerConsentSignatures,
  savePartnerConsentSignatures,
  getPartnerUsersSummary,
  listPartnerUsers,
  createPartnerUser,
  updatePartnerUser,
  changePartnerUserPassword,
  createPartnerUserSlotsPayment,
  capturePartnerUserSlotsPayment,
  cancelPartnerUserSlotsPayment
} from '../controllers/partnerPortal.js'

const router = express.Router()

router.post('/consent/status', authenticateUser, getPartnerConsentSignatures)
router.post('/consent/sign', authenticateUser, savePartnerConsentSignatures)

router.post('/users/summary', authenticateUser, getPartnerUsersSummary)
router.post('/users/list', authenticateUser, listPartnerUsers)
router.post('/users/create', authenticateUser, createPartnerUser)
router.post('/users/update', authenticateUser, updatePartnerUser)
router.post('/users/password/change', authenticateUser, changePartnerUserPassword)

router.post('/users/purchase/createPayment', authenticateUser, createPartnerUserSlotsPayment)
router.post('/users/purchase/capturePayment', authenticateUser, capturePartnerUserSlotsPayment)
router.post('/users/purchase/cancelPayment', authenticateUser, cancelPartnerUserSlotsPayment)

export default router
