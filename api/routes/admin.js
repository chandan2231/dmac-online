import express from 'express'
import {
  getAllUsersByRole,
  changeUserStatus,
  createUsersByRole,
  getProductList,
  updateProductDetails,
  changeProductStatus,
  updateUsersDetails,
  changeUserPassword,
  getUsersTransactionList,
  getConsultationList
} from '../controllers/admin.js'

import { authenticateUser } from '../utils/middleware.js'


const router = express.Router()

router.post('/users/list', authenticateUser, getAllUsersByRole)
router.post('/user/status/change', authenticateUser, changeUserStatus)
router.post('/user/create', authenticateUser, createUsersByRole)
router.post('/user/update', authenticateUser, updateUsersDetails)
router.get('/products/list', authenticateUser, getProductList)
router.post('/products/update', authenticateUser, updateProductDetails)
router.post('/products/status/change', authenticateUser, changeProductStatus)
router.post('/user/reset/password', authenticateUser, changeUserPassword)
router.post('/user/transactions/list', authenticateUser, getUsersTransactionList)
router.post('/consultations/list', authenticateUser, getConsultationList)

export default router
