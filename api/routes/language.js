import express from 'express'
import { getLanguageList, updateLanguage } from '../controllers/language.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/language-list', getLanguageList)
router.post( '/language-update', updateLanguage)

export default router
