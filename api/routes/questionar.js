import express from 'express'
import { getQuestionWithFollowUps, getPageContent } from '../controllers/questionar.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.get('/:sequenceNo', getQuestionWithFollowUps);
router.get('/page/:pageKey', getPageContent);

export default router
