
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const devices = require('puppeteer/DeviceDescriptors');
const url = 'https://perks.optum.com'
const cookie = {
  url,
  name: 'postalCode',
  value: '91320',
  domain: 'perks.optum.com',
  path: '/',
}

puppeteer.launch({ headless: false })
.then(async browser => {
  const page = await browser.newPage()
  await page.setCookie(cookie)
  await page.goto(url)

  try {
    await page.type('#txtDrug1', 'metform', { delay: 300 })
    await page.waitForSelector('ul.ui-autocomplete')

    await Promise.all([
      page.waitForNavigation(),
      page.click('ul.ui-autocomplete > li'),
    ])

    await page.waitForSelector('#results-div .pharmacy-record .pharmacy-record-col')
    const results = await page.$$eval(
      '#results-div .pharmacy-record',
      divs => divs.map(div => {
        const { pharmacy, price } = div.dataset
        return { pharmacy, price }
      })
    )

    console.log(results);
    await browser.close()
  } catch (error) {
    console.error(error)
    await browser.close()
  }
})
