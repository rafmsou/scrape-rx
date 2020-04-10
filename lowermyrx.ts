import { Browser } from "puppeteer"
import * as express from "express"
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
import puppeteer from "puppeteer-extra"
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from "puppeteer-extra-plugin-stealth"
puppeteer.use(StealthPlugin())

const url = "https://savingstool.lowermyrx.com/"
const source = "lowermyrx"

exports.invoke = (req: express.Request, res: express.Response) => {

  if (!req.query.drug) {
    res.status(200).send({ offers: [], error: "`drug` query param is missing" })
    return
  }
  if (!req.query.zipcode) {
    res.status(200).send({ offers: [], error: "`zipcode` query param is missing" })
    return
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("#SearchDrugText")
      await page.type("#SearchDrugText", req.query.drug, { delay: 100 })
      await page.waitForSelector(".popular_sesrch")
      await page.waitFor(500)
      await page.click(".popular_sesrch > ul > li")

      await page.waitForSelector("#getzipcode")
      await page.type("#getzipcode", req.query.zipcode)
      await page.click(".find_button")

      await page.waitForSelector(".pharmacy_list .card", { timeout: 5000 })
      await page.waitFor(500)

      const offers = await page.$$eval(
        ".pharmacy_list .card",
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
      res.status(200).send({ source, offers: [], error })
      await browser.close()
    }
  })
}
