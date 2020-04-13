
import { Browser } from "puppeteer"
import * as express from "express"
import puppeteer from "puppeteer-extra"
// Pending XHR Puppeteer is a tool that detect when there is xhr requests not yet finished.
import { PendingXHR } from "pending-xhr-puppeteer"
import { validateRequest } from "./helpers"

const url = "https://perks.optum.com"
const source = "optumperks"

exports.invoke = (req: express.Request, res: express.Response) => {

  if (!validateRequest(req, res)) {
    return
  }

  const cookie = {
    url,
    name: "postalCode",
    value: req.query.zipcode,
    domain: "perks.optum.com",
    path: "/",
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page)
    await page.setCookie(cookie)
    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("#txtDrug1", { timeout: 3000 })
      await page.type("#txtDrug1", req.query.drug, { delay: 100 })
      await page.waitForSelector("ul.ui-autocomplete > li")
      await page.waitFor(500)

      await Promise.all([
        page.waitForNavigation({ timeout: 3000 }),
        page.click("ul.ui-autocomplete > li"),
      ])

      await pendingXHR.waitForAllXhrFinished()
      await page.waitForSelector("#results-div .pharmacy-record:nth-child(3n)")

      const offers = await page.$$eval(
        "#results-div .pharmacy-record:nth-of-type(-n+3)",
        (divs: Element[]) => divs.map(div => {
          const { pharmacy, price } = (div as HTMLElement).dataset
          return {
            pharmacyName: pharmacy,
            price
          }
        })
      )

      const location = await page.$eval(
        "#radiusSearchDisplayDiv",
        div => div.textContent?.trim()
      )

      res.status(200).send({ source, offers, location })
      await browser.close()
    } catch (error) {
      console.error(error)
      res.status(200).send({ source, offers: [], error: error.toString() })
      await browser.close()
    }
  })
}
