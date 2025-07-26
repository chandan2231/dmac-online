import express from 'express'

import {
  saveProtocolInfo,
  saveInvestigatorInfo,
  saveStydyInfo,
  saveInformedInfo,
  saveProtocolProceduresInfo,
  saveContactInfo,
  saveInvestigatorAndProtocolInformation,
  saveClinicalInformedConsent,
  saveMultiSiteProtocolProceduresInfo,
  saveClinicalSiteSubmission,
  getClinicalSiteSavedProtocolType,
  saveMultiSiteSubmission,
  getMultiSiteSavedProtocolType,
  getPrincipalInvestigatorSavedProtocolType,
  savePrincipalInvestigatorSubmission,
  getDocumentReviewSavedProtocolType,
  saveDocumentReview,
  saveDocumentSubmission
} from '../controllers/researchInfo.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/saveProtocolInfo', authenticateUser, saveProtocolInfo)
router.post('/saveInvestigatorInfo', authenticateUser, saveInvestigatorInfo)
router.post('/saveStydyInfo', authenticateUser, saveStydyInfo)
router.post('/saveInformedInfo', authenticateUser, saveInformedInfo)

router.post(
  '/saveProtocolProceduresInfo',
  authenticateUser,
  saveProtocolProceduresInfo
)
router.post(
  '/saveMultiSiteProtocolProceduresInfo',
  authenticateUser,
  saveMultiSiteProtocolProceduresInfo
)
router.post('/saveContactInfo', authenticateUser, saveContactInfo)
router.post(
  '/saveInvestigatorAndProtocolInformation',
  authenticateUser,
  saveInvestigatorAndProtocolInformation
)
router.post(
  '/saveClinicalInformedConsent',
  authenticateUser,
  saveClinicalInformedConsent
)
router.post(
  '/saveClinicalSiteSubmission',
  authenticateUser,
  saveClinicalSiteSubmission
)
router.post(
  '/getClinicalSiteSavedProtocolType',
  authenticateUser,
  getClinicalSiteSavedProtocolType
)
router.post(
  '/saveMultiSiteSubmission',
  authenticateUser,
  saveMultiSiteSubmission
)
router.post(
  '/getMultiSiteSavedProtocolType',
  authenticateUser,
  getMultiSiteSavedProtocolType
)
router.post(
  '/savePrincipalInvestigatorSubmission',
  authenticateUser,
  savePrincipalInvestigatorSubmission
)
router.post(
  '/getPrincipalInvestigatorSavedProtocolType',
  authenticateUser,
  getPrincipalInvestigatorSavedProtocolType
)
router.post(
  '/getDocumentReviewSavedProtocolType',
  authenticateUser,
  getDocumentReviewSavedProtocolType
)
router.post('/saveDocumentReview', authenticateUser, saveDocumentReview)
router.post('/saveDocumentSubmission', authenticateUser, saveDocumentSubmission)

export default router
