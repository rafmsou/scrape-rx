import * as express from "express"
import * as drugs from "./drugs.json"

export const searchRx = (req: express.Request, res: express.Response) => {
  const term = req.query.q
  const matchedDrugs = drugs.filter(
    (d: string) => d.toLowerCase().startsWith(term.toLowerCase())
  )
  res.send(matchedDrugs)
}
