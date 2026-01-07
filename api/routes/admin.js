import express from 'express'
import {
  getAllUsersByRole,
  changeUserStatus,
  createUsersByRole,
  getProductList,
  createProduct,
  updateProductDetails,
  updateProductCountryAmounts,
  changeProductStatus,
  updateUsersDetails,
  changeUserPassword,
  getUsersTransactionList,
  getConsultationList,
  getPatientDocuments,
  getPatientAssessmentStatus,
  getPatientMedicalHistory
} from '../controllers/admin.js'

import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/users/list', authenticateUser, getAllUsersByRole)
router.post('/user/status/change', authenticateUser, changeUserStatus)
router.post('/user/create', authenticateUser, createUsersByRole)
router.post('/user/update', authenticateUser, updateUsersDetails)
router.get('/products/list', getProductList)
router.post('/products/create', authenticateUser, createProduct)
router.post('/products/update', authenticateUser, updateProductDetails)
router.post(
  '/products/country-amounts/update',
  authenticateUser,
  updateProductCountryAmounts
)
router.post('/products/status/change', authenticateUser, changeProductStatus)
router.post('/user/reset/password', authenticateUser, changeUserPassword)
router.post(
  '/user/transactions/list',
  authenticateUser,
  getUsersTransactionList
)
router.post('/consultations/list', authenticateUser, getConsultationList)
router.post('/patient-documents', authenticateUser, getPatientDocuments)
router.post(
  '/patient-medical-history',
  authenticateUser,
  getPatientMedicalHistory
)
router.post(
  '/patient-assessment-status',
  authenticateUser,
  getPatientAssessmentStatus
)

export default router
