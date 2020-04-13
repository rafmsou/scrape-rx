import { Browser } from "puppeteer"
import * as express from "express"
import puppeteer from "puppeteer-extra"
import { validateRequest } from "./helpers"

const url = "https://savingstool.lowermyrx.com/"
const source = "lowermyrx"

exports.invoke = (req: express.Request, res: express.Response) => {

  if (!validateRequest(req, res)) {
    return
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("#SearchDrugText", { timeout: 3000 })
      await page.type("#SearchDrugText", req.query.drug, { delay: 100 })
      await page.waitForSelector(".popular_sesrch > ul > li")
      await page.waitFor(500)
      await page.click(".popular_sesrch > ul > li")

      await page.waitForSelector("#getzipcode")
      await page.type("#getzipcode", req.query.zipcode)
      await page.click(".find_button")

      await page.waitForSelector(".pharmacy_list .card:nth-child(3n)")

      const offers = await page.$$eval(
        ".pharmacy_list .card:nth-of-type(-n+3)",
        divs => divs.map(card => {
          const pharmacy = card.querySelector(".name_Sec > p")
          const price = card.querySelector(".name_Sec > span")

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
