import { Browser } from "puppeteer"
import * as express from "express"
import puppeteer from "puppeteer-extra"
import { validateRequest } from "./helpers"

const url = "https://rxsaver.retailmenot.com"
const source = "rxsaver"

exports.invoke = (req: express.Request, res: express.Response) => {

  if (!validateRequest(req, res)) {
    return
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("input[type='search']", { timeout: 3000 })
      await page.type("input[type='search']", req.query.drug)
      await page.waitForSelector(".ant-select-dropdown-menu")
      await page.waitFor(500)

      await Promise.all([
        page.waitForNavigation(),
        page.click(".ant-select-dropdown-menu > li"),
      ])

      await page.waitForSelector(".zip-code a")
      await page.click(".zip-code a")
      await page.waitForSelector("input.zip-code-input-search")
      await page.type("input.zip-code-input-search", req.query.zipcode)
      await page.click(".zip-code button")

      await page.waitForSelector(".results-list > div")

      const offers = await page.$$eval(
        ".results-list > div",
        divs => divs.map(div => {
          const pharmacy = div.querySelector(".pharmacy-name")
          const price = div.querySelector(".result-item-price")

          return {
            pharmacyName: pharmacy ? pharmacy.textContent : null,
            price: price ? price.textContent : null,
          }
        })
      )

      const location = await page.$eval(
        ".best-prices-in-zip span",
        span => span.textContent
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
