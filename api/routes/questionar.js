import express from 'express'
import { getQuestionWithFollowUps } from '../controllers/questionar.js';

const router = express.Router()

router.get('/:sequenceNo', getQuestionWithFollowUps);

export default router
