
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

puppeteer.launch({ headless: true })
.then(async browser => {
  const page = await browser.newPage()
  await page.goto('https://www.wellrx.com/')

  try {
    await page.type('#drugname', 'metform', { delay: 300 })
    await page.waitForSelector('ul.ui-autocomplete')
    await page.click('ul.ui-autocomplete > li')
    await page.waitFor(500)
    await page.type('#address', '91325')

    await Promise.all([
      page.waitForNavigation(),
      page.click('#btnSearch'),
    ])

    await page.waitForSelector('.price-list-item')
    const results = await page.$$eval(
      '.price-list-item',
      divs => divs.map(div => {
        const pharmacy = div.querySelector('div > div > p')
        return pharmacy ? pharmacy.innerText : null
      })
    )

    console.log(results);

    // await browser.close()
  } catch (error) {
    console.error(error)
    await browser.close()
  }
})
