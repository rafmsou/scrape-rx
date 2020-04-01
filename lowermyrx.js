
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

puppeteer.launch({ headless: true })
.then(async browser => {
  const page = await browser.newPage()
  await page.goto('https://savingstool.lowermyrx.com/')

  try {
    await page.waitForSelector('#SearchDrugText')
    await page.type('#SearchDrugText', 'metformin', { delay: 100 })
    await page.waitForSelector('.popular_sesrch')
    await page.waitFor(500)
    await page.click('.popular_sesrch > ul > li')

    await page.waitForSelector('#getzipcode')
    await page.type('#getzipcode', '91330')
    await page.click('.find_button')

    await page.waitForSelector('.pharmacy_list .card')
    await page.waitFor(500)

    const results = await page.$$eval(
      '.pharmacy_list .card',
      divs => divs.map(card => {
        const pharmacy = card.querySelector('.name_Sec')
        return pharmacy ? pharmacy.innerText : null
      })
    )

    console.log(results);
    await browser.close()
  } catch (error) {
    console.error(error)
    await browser.close()
  }
})
