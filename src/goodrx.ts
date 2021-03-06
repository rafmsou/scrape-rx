import { Browser } from "puppeteer"
import * as express from "express"
import puppeteer from "puppeteer-extra"
// Pending XHR Puppeteer is a tool that detect when there is xhr requests not yet finished.
import { PendingXHR } from "pending-xhr-puppeteer"
import { validateRequest } from "./helpers"

const url = "https://www.goodrx.com/"
const source = "goodrx"

exports.invoke = (req: express.Request, res: express.Response) => {

  if (!validateRequest(req, res)) {
    return
  }

  puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  .then(async (browser: Browser) => {
    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page)
    const drug = req.query.drug

    await page.goto(url, { timeout: 0 })

    try {
      await page.waitForSelector("input[data-qa='search_inp']", { timeout: 3000 })
      await page.type("input[data-qa='search_inp']", drug, { delay: 100 })
      await page.waitForSelector("nav[data-qa='typeahead'] > a")
      await page.waitFor(500)
      await page.click("nav[data-qa='typeahead'] > a")

      await page.waitForSelector("button[data-qa='set_location_button']")
      await page.click("button[data-qa='set_location_button']")
      await page.waitForSelector("#locationModalInput")
      await page.type("#locationModalInput", req.query.zipcode)
      await page.click("#uat-location-submit")

      await page.waitForSelector("button[data-qa='location_element_after_setting_location']")
      await pendingXHR.waitForAllXhrFinished()
      await page.waitForFunction(
        () => !document.querySelector("span[class^='spinner-']"),
        { polling: "mutation" },
      );

      const offers = await page.$$eval(
        "li[data-qa='price_row']:nth-of-type(-n+3)",
        (divs: Element[]) => divs.map(div => {
          const pharmacy = div.querySelector("div[data-qa='store_name'] > span:nth-of-type(2)")
          const priceElement = div.querySelector("div[data-qa='drug_price']")
          const priceRegexMatch = priceElement
            ? priceElement.textContent?.match(/\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?/)
            : null

          return {
            pharmacyName: pharmacy ? pharmacy.textContent : null,
            price: priceRegexMatch ? priceRegexMatch[0] : null,
          }
        })
      )

      const location = await page.$eval(
        "button[data-qa='location_element_after_setting_location']",
        button => button.textContent
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
