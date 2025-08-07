import express from 'express'
import {getLanguageList} from '../controllers/language.js'

const router = express.Router()

router.get('/language-list', getLanguageList)

export default router
