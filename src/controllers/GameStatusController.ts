import { Request, Response } from 'express'
import { parser } from '..'

export default class GameStatusController {
  public static GetGameStatus = async (req: Request, res: Response)=> {
    try {
      res.setHeader('Content-Type', 'text/html')
      res.status(200).send(parser.getHtml())
    }
    catch (err) {
      res.status(400).send()
    }
  }

  public static GetGameLog = async (req: Request, res: Response) => {
    try {
      res.setHeader('Content-Type', 'text/html')
      res.status(200).send(parser.getLog())
    } catch {
      res.status(400).send()
    }
  }
}