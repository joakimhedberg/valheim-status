import { Router } from 'express'
import GameStatusController from '../controllers/GameStatusController'
import img from './img'

const router = Router()

router.get('/status', GameStatusController.GetGameStatus)
router.get('/log', GameStatusController.GetGameLog)
router.use('/img', img)
export default router