import express from 'express'
import { getGameInstructions } from '../controllers/game.js'

import { authenticateUserWithBearer } from '../utils/middleware.js'

const router = express.Router()

router.get('/instructions', authenticateUserWithBearer, getGameInstructions)

export default router

