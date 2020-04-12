import { Browser } from "puppeteer"
import * as express from "express"
import puppeteer from "puppeteer-extra"
import { validateRequest } from "./helpers"

const url = "https://www.wellrx.com/"
const source = "wellrx"

export const invoke = (req: express.Request, res: express.Response) => {

  if (!validateRequest(req, res)) {
    return
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("#drugname", { timeout: 3000 })
      await page.type("#drugname", req.query.drug, { delay: 300 })
      await page.waitForSelector("ul.ui-autocomplete")
      await page.click("ul.ui-autocomplete > li")
      await page.waitFor(500)
      await page.type("#address", req.query.zipcode)

      await Promise.all([
        page.waitForNavigation(),
        page.click("#btnSearch"),
      ])

      await page.waitForSelector(".price-list-item")
      const offers = await page.$$eval(
        ".price-list-item",
        divs => divs.map(div => {
          const pharmacy = div.querySelector("div > div > p")
          const price = div.querySelector(".pricesm")

          return {
            pharmacyName: pharmacy ? pharmacy.textContent : null,
            price: price ? price.textContent : null,
          }
        })
      )

      const location = req.query.zipcode
      res.status(200).send({ source, offers, location })
      await browser.close()
    } catch (error) {
      console.error(error)
      res.status(200).send({ source, offers: [], error: error.toString() })
      await browser.close()
    }
  })
}
