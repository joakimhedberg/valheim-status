import { Router, Request, Response } from 'express'
import path from 'path'
import fs from 'fs'

const on = fs.readFileSync(path.resolve(__dirname, '../../img/bulb.png'))
const off = fs.readFileSync(path.resolve(__dirname, '../../img/bulb_off.png'))

const router = Router()

router.get('/on', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/png')
  res.status(200).send(on)
})

router.get('/off', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/png')
  res.status(200).send(off)
})
export default router