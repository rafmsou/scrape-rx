import * as express from "express"

export const validateRequest = (req: express.Request, res: express.Response) => {
  if (!req.query.drug) {
    res.status(200).send({ offers: [], error: "`drug` query param is missing" })
    return false
  }
  if (!req.query.zipcode) {
    res.status(200).send({ offers: [], error: "`zipcode` query param is missing" })
    return false
  }
  return true
}
